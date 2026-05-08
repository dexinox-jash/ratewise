-- RateWise Database Row Level Security (RLS) Policies
-- Created: 2024
-- Description: RLS policies for secure multi-tenant data access

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Niches table (public read, admin write)
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;

-- Multipliers table (public read, admin write)
ALTER TABLE multipliers ENABLE ROW LEVEL SECURITY;

-- Pricing benchmarks table (public read, admin write)
ALTER TABLE pricing_benchmarks ENABLE ROW LEVEL SECURITY;

-- Calculations table (user-owned)
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;

-- Rate cards table (user-owned)
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;

-- Calculation rate cards link table (user-owned via calculations)
ALTER TABLE calculation_rate_cards ENABLE ROW LEVEL SECURITY;

-- User activity logs table (user-owned, admin read)
ALTER TABLE user_activity_logs ENABLE ROW LEVEL SECURITY;

-- Audit logs table (admin only)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Policy: Users can read their own data
CREATE POLICY users_select_own ON users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY users_update_own ON users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Users can insert their own data (for signup)
CREATE POLICY users_insert_own ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy: Service role can manage all users
CREATE POLICY users_service_role ON users
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- NICHES TABLE POLICIES
-- ============================================

-- Policy: Anyone can read active niches
CREATE POLICY niches_select_public ON niches
    FOR SELECT
    USING (is_active = true);

-- Policy: Service role can manage all niches
CREATE POLICY niches_service_role ON niches
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Admin users can manage niches
CREATE POLICY niches_admin_manage ON niches
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tier = 'agency'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tier = 'agency'
        )
    );

-- ============================================
-- MULTIPLIERS TABLE POLICIES
-- ============================================

-- Policy: Anyone can read active multipliers
CREATE POLICY multipliers_select_public ON multipliers
    FOR SELECT
    USING (is_active = true);

-- Policy: Service role can manage all multipliers
CREATE POLICY multipliers_service_role ON multipliers
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Admin users can manage multipliers
CREATE POLICY multipliers_admin_manage ON multipliers
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tier = 'agency'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tier = 'agency'
        )
    );

-- ============================================
-- PRICING BENCHMARKS TABLE POLICIES
-- ============================================

-- Policy: Anyone can read active pricing benchmarks
CREATE POLICY benchmarks_select_public ON pricing_benchmarks
    FOR SELECT
    USING (is_active = true);

-- Policy: Service role can manage all benchmarks
CREATE POLICY benchmarks_service_role ON pricing_benchmarks
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy: Admin users can manage benchmarks
CREATE POLICY benchmarks_admin_manage ON pricing_benchmarks
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tier = 'agency'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tier = 'agency'
        )
    );

-- ============================================
-- CALCULATIONS TABLE POLICIES
-- ============================================

-- Policy: Users can read their own calculations
CREATE POLICY calculations_select_own ON calculations
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own calculations
CREATE POLICY calculations_insert_own ON calculations
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own calculations
CREATE POLICY calculations_update_own ON calculations
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own calculations
CREATE POLICY calculations_delete_own ON calculations
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Service role can manage all calculations
CREATE POLICY calculations_service_role ON calculations
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- RATE CARDS TABLE POLICIES
-- ============================================

-- Policy: Users can read their own rate cards
CREATE POLICY rate_cards_select_own ON rate_cards
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can read public rate cards
CREATE POLICY rate_cards_select_public ON rate_cards
    FOR SELECT
    USING (is_public = true);

-- Policy: Users can insert their own rate cards
CREATE POLICY rate_cards_insert_own ON rate_cards
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own rate cards
CREATE POLICY rate_cards_update_own ON rate_cards
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own rate cards
CREATE POLICY rate_cards_delete_own ON rate_cards
    FOR DELETE
    USING (auth.uid() = user_id);

-- Policy: Service role can manage all rate cards
CREATE POLICY rate_cards_service_role ON rate_cards
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- CALCULATION RATE CARDS LINK TABLE POLICIES
-- ============================================

-- Policy: Users can read their calculation-rate card links
CREATE POLICY calc_rate_cards_select_own ON calculation_rate_cards
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = calculation_rate_cards.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );

-- Policy: Users can insert links for their calculations
CREATE POLICY calc_rate_cards_insert_own ON calculation_rate_cards
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = calculation_rate_cards.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );

-- Policy: Users can delete links for their calculations
CREATE POLICY calc_rate_cards_delete_own ON calculation_rate_cards
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM calculations 
            WHERE calculations.id = calculation_rate_cards.calculation_id 
            AND calculations.user_id = auth.uid()
        )
    );

-- Policy: Service role can manage all links
CREATE POLICY calc_rate_cards_service_role ON calculation_rate_cards
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- USER ACTIVITY LOGS TABLE POLICIES
-- ============================================

-- Policy: Users can read their own activity logs
CREATE POLICY activity_logs_select_own ON user_activity_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Users can insert their own activity logs
CREATE POLICY activity_logs_insert_own ON user_activity_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Admin users can read all activity logs
CREATE POLICY activity_logs_admin_select ON user_activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tier = 'agency'
        )
    );

-- Policy: Service role can manage all activity logs
CREATE POLICY activity_logs_service_role ON user_activity_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- AUDIT LOGS TABLE POLICIES
-- ============================================

-- Policy: Admin users can read audit logs
CREATE POLICY audit_logs_admin_select ON audit_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.tier = 'agency'
        )
    );

-- Policy: Service role can manage all audit logs
CREATE POLICY audit_logs_service_role ON audit_logs
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- ADDITIONAL SECURITY FUNCTIONS
-- ============================================

-- Function to check if user has reached their calculation limit
CREATE OR REPLACE FUNCTION check_user_calculation_limit(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_tier user_tier;
    v_used INTEGER;
    v_limit INTEGER;
    v_reset_at TIMESTAMPTZ;
BEGIN
    SELECT tier, monthly_calculations_used, monthly_calculations_limit, monthly_calculations_reset_at
    INTO v_tier, v_used, v_limit, v_reset_at
    FROM users
    WHERE id = p_user_id;
    
    -- Pro and agency tiers have unlimited calculations
    IF v_tier IN ('pro', 'agency') THEN
        RETURN true;
    END IF;
    
    -- Check if quota needs reset (new month)
    IF v_reset_at < DATE_TRUNC('month', NOW()) THEN
        -- Reset quota
        UPDATE users 
        SET monthly_calculations_used = 0,
            monthly_calculations_reset_at = DATE_TRUNC('month', NOW())
        WHERE id = p_user_id;
        RETURN true;
    END IF;
    
    -- Check if under limit
    RETURN v_used < v_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment user's calculation count
CREATE OR REPLACE FUNCTION increment_user_calculation_count(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE users 
    SET monthly_calculations_used = monthly_calculations_used + 1
    WHERE id = p_user_id
    AND tier = 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER FOR AUDIT LOGGING
-- ============================================

-- Function to log changes to audit_logs
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (table_name, record_id, action, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, new_data, performed_by)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (table_name, record_id, action, old_data, performed_by)
        VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD), auth.uid());
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to sensitive tables
CREATE TRIGGER calculations_audit
    AFTER INSERT OR UPDATE OR DELETE ON calculations
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER rate_cards_audit
    AFTER INSERT OR UPDATE OR DELETE ON rate_cards
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER users_audit
    AFTER UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- ============================================
-- REALTIME SUBSCRIPTION CONFIGURATION
-- ============================================

-- Enable realtime for calculations table (for live updates)
-- Note: This requires the realtime extension to be enabled in Supabase
COMMENT ON TABLE calculations IS 'User calculations - enable realtime for live updates';
COMMENT ON TABLE rate_cards IS 'User rate cards - enable realtime for live updates';

-- ============================================
-- PERFORMANCE OPTIMIZATION
-- ============================================

-- Create function to get user's current tier with caching
CREATE OR REPLACE FUNCTION get_user_tier(p_user_id UUID)
RETURNS user_tier AS $$
DECLARE
    v_tier user_tier;
BEGIN
    SELECT tier INTO v_tier
    FROM users
    WHERE id = p_user_id;
    
    RETURN v_tier;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to check if user can export PDF
CREATE OR REPLACE FUNCTION can_user_export_pdf(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_export BOOLEAN;
    v_tier user_tier;
BEGIN
    SELECT can_export_pdf, tier INTO v_can_export, v_tier
    FROM users
    WHERE id = p_user_id;
    
    -- Pro and agency can always export
    IF v_tier IN ('pro', 'agency') THEN
        RETURN true;
    END IF;
    
    RETURN COALESCE(v_can_export, false);
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to check if user can use custom branding
CREATE OR REPLACE FUNCTION can_user_custom_brand(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_can_brand BOOLEAN;
    v_tier user_tier;
BEGIN
    SELECT can_custom_brand, tier INTO v_can_brand, v_tier
    FROM users
    WHERE id = p_user_id;
    
    -- Only agency can use custom branding
    IF v_tier = 'agency' THEN
        RETURN true;
    END IF;
    
    RETURN COALESCE(v_can_brand, false);
END;
$$ LANGUAGE plpgsql STABLE;
