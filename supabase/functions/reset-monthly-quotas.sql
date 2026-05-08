-- RateWise Monthly Quota Reset Function
-- Created: 2024
-- Description: Database function to reset free tier user quotas monthly
-- Usage: Can be called via Supabase Edge Function or scheduled job

-- ============================================
-- MAIN RESET FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION reset_monthly_quotas()
RETURNS TABLE (
    user_id UUID,
    old_calculations_used INTEGER,
    new_calculations_used INTEGER,
    reset_status TEXT
) AS $$
DECLARE
    v_current_month TIMESTAMPTZ;
    v_reset_count INTEGER := 0;
BEGIN
    -- Get the current month start
    v_current_month := DATE_TRUNC('month', NOW());
    
    RETURN QUERY
    WITH updated_users AS (
        UPDATE users
        SET 
            monthly_calculations_used = 0,
            monthly_calculations_reset_at = v_current_month,
            updated_at = NOW()
        WHERE 
            -- Only reset free tier users
            tier = 'free'
            -- Only users whose quota hasn't been reset this month
            AND (monthly_calculations_reset_at IS NULL 
                 OR monthly_calculations_reset_at < v_current_month)
        RETURNING 
            users.id,
            users.monthly_calculations_used as new_used,
            users.monthly_calculations_reset_at as reset_at
    )
    SELECT 
        updated_users.id,
        0::INTEGER as old_calculations_used,  -- We reset to 0, so old is effectively 0 after reset
        updated_users.new_used,
        'success'::TEXT as reset_status
    FROM updated_users;
    
    -- Log the reset operation
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        new_data,
        performed_by
    ) VALUES (
        'users',
        '00000000-0000-0000-0000-000000000000'::UUID,
        'BULK_UPDATE',
        jsonb_build_object(
            'operation', 'reset_monthly_quotas',
            'reset_month', v_current_month,
            'affected_tier', 'free'
        ),
        NULL
    );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ALTERNATIVE: RESET WITH DETAILED LOGGING
-- ============================================

CREATE OR REPLACE FUNCTION reset_monthly_quotas_with_log()
RETURNS JSONB AS $$
DECLARE
    v_current_month TIMESTAMPTZ;
    v_affected_count INTEGER;
    v_result JSONB;
BEGIN
    -- Get the current month start
    v_current_month := DATE_TRUNC('month', NOW());
    
    -- Perform the reset and count affected rows
    WITH reset_users AS (
        UPDATE users
        SET 
            monthly_calculations_used = 0,
            monthly_calculations_reset_at = v_current_month,
            updated_at = NOW()
        WHERE 
            tier = 'free'
            AND (monthly_calculations_reset_at IS NULL 
                 OR monthly_calculations_reset_at < v_current_month)
        RETURNING id
    )
    SELECT COUNT(*) INTO v_affected_count FROM reset_users;
    
    -- Build result
    v_result := jsonb_build_object(
        'success', true,
        'reset_month', v_current_month,
        'affected_users', v_affected_count,
        'tier_reset', 'free',
        'reset_at', NOW()
    );
    
    -- Log the operation
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        new_data,
        performed_by
    ) VALUES (
        'users',
        '00000000-0000-0000-0000-000000000000'::UUID,
        'BULK_UPDATE',
        v_result,
        NULL
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET QUOTA STATUS FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION get_user_quota_status(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_record RECORD;
    v_result JSONB;
    v_current_month TIMESTAMPTZ;
    v_calculations_remaining INTEGER;
    v_quota_reset_needed BOOLEAN;
BEGIN
    v_current_month := DATE_TRUNC('month', NOW());
    
    SELECT 
        id,
        tier,
        monthly_calculations_used,
        monthly_calculations_limit,
        monthly_calculations_reset_at,
        can_export_pdf,
        can_custom_brand,
        can_team_collaborate,
        can_api_access
    INTO v_user_record
    FROM users
    WHERE id = p_user_id;
    
    IF v_user_record IS NULL THEN
        RETURN jsonb_build_object(
            'error', 'User not found',
            'user_id', p_user_id
        );
    END IF;
    
    -- Check if quota needs reset
    v_quota_reset_needed := v_user_record.monthly_calculations_reset_at < v_current_month;
    
    -- Auto-reset if needed for free tier
    IF v_quota_reset_needed AND v_user_record.tier = 'free' THEN
        UPDATE users
        SET 
            monthly_calculations_used = 0,
            monthly_calculations_reset_at = v_current_month,
            updated_at = NOW()
        WHERE id = p_user_id;
        
        v_user_record.monthly_calculations_used := 0;
        v_user_record.monthly_calculations_reset_at := v_current_month;
    END IF;
    
    -- Calculate remaining
    IF v_user_record.tier IN ('pro', 'agency') THEN
        v_calculations_remaining := -1; -- Unlimited
    ELSE
        v_calculations_remaining := GREATEST(0, 
            v_user_record.monthly_calculations_limit - v_user_record.monthly_calculations_used
        );
    END IF;
    
    v_result := jsonb_build_object(
        'user_id', v_user_record.id,
        'tier', v_user_record.tier,
        'calculations_used', v_user_record.monthly_calculations_used,
        'calculations_limit', v_user_record.monthly_calculations_limit,
        'calculations_remaining', v_calculations_remaining,
        'has_unlimited_calculations', v_user_record.tier IN ('pro', 'agency'),
        'quota_reset_at', v_user_record.monthly_calculations_reset_at,
        'next_quota_reset', v_current_month + INTERVAL '1 month',
        'features', jsonb_build_object(
            'can_export_pdf', v_user_record.can_export_pdf OR v_user_record.tier IN ('pro', 'agency'),
            'can_custom_brand', v_user_record.can_custom_brand OR v_user_record.tier = 'agency',
            'can_team_collaborate', v_user_record.can_team_collaborate OR v_user_record.tier = 'agency',
            'can_api_access', v_user_record.can_api_access OR v_user_record.tier = 'agency'
        )
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INCREMENT CALCULATION COUNT FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION increment_calculation_count(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_user_record RECORD;
    v_current_month TIMESTAMPTZ;
    v_can_calculate BOOLEAN;
    v_new_count INTEGER;
BEGIN
    v_current_month := DATE_TRUNC('month', NOW());
    
    -- Get user with lock
    SELECT 
        id,
        tier,
        monthly_calculations_used,
        monthly_calculations_limit,
        monthly_calculations_reset_at
    INTO v_user_record
    FROM users
    WHERE id = p_user_id
    FOR UPDATE;
    
    IF v_user_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_id', p_user_id
        );
    END IF;
    
    -- Check if quota needs reset
    IF v_user_record.monthly_calculations_reset_at < v_current_month THEN
        v_user_record.monthly_calculations_used := 0;
        v_user_record.monthly_calculations_reset_at := v_current_month;
    END IF;
    
    -- Check if can calculate
    IF v_user_record.tier IN ('pro', 'agency') THEN
        v_can_calculate := true;
    ELSE
        v_can_calculate := v_user_record.monthly_calculations_used < v_user_record.monthly_calculations_limit;
    END IF;
    
    IF NOT v_can_calculate THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Monthly calculation limit reached',
            'user_id', p_user_id,
            'tier', v_user_record.tier,
            'calculations_used', v_user_record.monthly_calculations_used,
            'calculations_limit', v_user_record.monthly_calculations_limit,
            'upgrade_required', true
        );
    END IF;
    
    -- Increment count for free tier
    IF v_user_record.tier = 'free' THEN
        v_new_count := v_user_record.monthly_calculations_used + 1;
        
        UPDATE users
        SET 
            monthly_calculations_used = v_new_count,
            monthly_calculations_reset_at = v_current_month,
            updated_at = NOW()
        WHERE id = p_user_id;
    ELSE
        v_new_count := v_user_record.monthly_calculations_used + 1;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'tier', v_user_record.tier,
        'calculations_used', v_new_count,
        'calculations_limit', v_user_record.monthly_calculations_limit,
        'calculations_remaining', CASE 
            WHEN v_user_record.tier IN ('pro', 'agency') THEN -1
            ELSE GREATEST(0, v_user_record.monthly_calculations_limit - v_new_count)
        END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SCHEDULED RESET FUNCTION (FOR CRON JOBS)
-- ============================================

-- This function can be called by pg_cron or external scheduler
CREATE OR REPLACE FUNCTION scheduled_monthly_quota_reset()
RETURNS VOID AS $$
DECLARE
    v_result JSONB;
BEGIN
    -- Call the reset function
    v_result := reset_monthly_quotas_with_log();
    
    -- Log success (this will be in the audit log from the called function)
    RAISE NOTICE 'Monthly quota reset completed: %', v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GET ALL FREE TIER USERS WITH QUOTA INFO
-- ============================================

CREATE OR REPLACE FUNCTION get_free_tier_quota_summary()
RETURNS TABLE (
    user_id UUID,
    email VARCHAR,
    calculations_used INTEGER,
    calculations_limit INTEGER,
    calculations_remaining INTEGER,
    quota_reset_at TIMESTAMPTZ,
    days_until_reset INTEGER
) AS $$
DECLARE
    v_current_month TIMESTAMPTZ;
    v_next_month TIMESTAMPTZ;
BEGIN
    v_current_month := DATE_TRUNC('month', NOW());
    v_next_month := v_current_month + INTERVAL '1 month';
    
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email,
        u.monthly_calculations_used as calculations_used,
        u.monthly_calculations_limit as calculations_limit,
        GREATEST(0, u.monthly_calculations_limit - u.monthly_calculations_used) as calculations_remaining,
        u.monthly_calculations_reset_at as quota_reset_at,
        EXTRACT(DAY FROM (v_next_month - NOW()))::INTEGER as days_until_reset
    FROM users u
    WHERE u.tier = 'free'
    ORDER BY u.monthly_calculations_used DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MANUAL QUOTA ADJUSTMENT (ADMIN ONLY)
-- ============================================

CREATE OR REPLACE FUNCTION adjust_user_quota(
    p_user_id UUID,
    p_new_calculations_used INTEGER DEFAULT NULL,
    p_new_calculations_limit INTEGER DEFAULT NULL,
    p_reason TEXT DEFAULT 'Manual adjustment'
)
RETURNS JSONB AS $$
DECLARE
    v_old_record RECORD;
    v_result JSONB;
BEGIN
    -- Get current values
    SELECT monthly_calculations_used, monthly_calculations_limit, tier
    INTO v_old_record
    FROM users
    WHERE id = p_user_id;
    
    IF v_old_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_id', p_user_id
        );
    END IF;
    
    -- Update user
    UPDATE users
    SET 
        monthly_calculations_used = COALESCE(p_new_calculations_used, monthly_calculations_used),
        monthly_calculations_limit = COALESCE(p_new_calculations_limit, monthly_calculations_limit),
        updated_at = NOW()
    WHERE id = p_user_id;
    
    v_result := jsonb_build_object(
        'success', true,
        'user_id', p_user_id,
        'tier', v_old_record.tier,
        'old_values', jsonb_build_object(
            'calculations_used', v_old_record.monthly_calculations_used,
            'calculations_limit', v_old_record.monthly_calculations_limit
        ),
        'new_values', jsonb_build_object(
            'calculations_used', COALESCE(p_new_calculations_used, v_old_record.monthly_calculations_used),
            'calculations_limit', COALESCE(p_new_calculations_limit, v_old_record.monthly_calculations_limit)
        ),
        'reason', p_reason,
        'adjusted_at', NOW()
    );
    
    -- Log the adjustment
    INSERT INTO audit_logs (
        table_name,
        record_id,
        action,
        old_data,
        new_data,
        performed_by
    ) VALUES (
        'users',
        p_user_id,
        'QUOTA_ADJUSTMENT',
        jsonb_build_object(
            'calculations_used', v_old_record.monthly_calculations_used,
            'calculations_limit', v_old_record.monthly_calculations_limit
        ),
        jsonb_build_object(
            'calculations_used', COALESCE(p_new_calculations_used, v_old_record.monthly_calculations_used),
            'calculations_limit', COALESCE(p_new_calculations_limit, v_old_record.monthly_calculations_limit),
            'reason', p_reason
        ),
        auth.uid()
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON FUNCTION reset_monthly_quotas() IS 'Resets monthly calculation quotas for all free tier users. Returns table of affected users.';
COMMENT ON FUNCTION reset_monthly_quotas_with_log() IS 'Resets monthly quotas with detailed JSON logging. Returns summary of operation.';
COMMENT ON FUNCTION get_user_quota_status(UUID) IS 'Returns detailed quota status for a specific user including feature flags.';
COMMENT ON FUNCTION increment_calculation_count(UUID) IS 'Increments calculation count for a user if quota allows. Returns success/failure with details.';
COMMENT ON FUNCTION scheduled_monthly_quota_reset() IS 'Wrapper function for scheduled/cron execution of quota reset.';
COMMENT ON FUNCTION get_free_tier_quota_summary() IS 'Returns quota summary for all free tier users. Admin function.';
COMMENT ON FUNCTION adjust_user_quota(UUID, INTEGER, INTEGER, TEXT) IS 'Manually adjusts user quota. Admin only. Logs to audit trail.';
