-- Initial schema migration for RateWise

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  website TEXT,
  location TEXT,
  timezone TEXT,
  primary_skills TEXT[],
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  subscription_status TEXT CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'unpaid')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  email_notifications BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calculations table
CREATE TABLE IF NOT EXISTS calculations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  input_data JSONB NOT NULL,
  result_data JSONB NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate cards table
CREATE TABLE IF NOT EXISTS rate_cards (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  skills TEXT[] NOT NULL,
  experience_level TEXT NOT NULL CHECK (experience_level IN ('entry', 'mid', 'senior', 'expert')),
  years_of_experience INTEGER NOT NULL DEFAULT 0,
  location TEXT NOT NULL,
  industry TEXT,
  project_complexity TEXT CHECK (project_complexity IN ('low', 'medium', 'high')),
  currency TEXT DEFAULT 'USD',
  hourly_rate JSONB,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Market data cache table
CREATE TABLE IF NOT EXISTS market_data_cache (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rate card shares table
CREATE TABLE IF NOT EXISTS rate_card_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rate_card_id UUID REFERENCES rate_cards(id) ON DELETE CASCADE NOT NULL,
  shared_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  shared_with UUID REFERENCES profiles(id) ON DELETE SET NULL,
  share_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON calculations(created_at);
CREATE INDEX IF NOT EXISTS idx_rate_cards_user_id ON rate_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_cards_is_public ON rate_cards(is_public);
CREATE INDEX IF NOT EXISTS idx_market_data_cache_expires_at ON market_data_cache(expires_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rate_cards_updated_at
  BEFORE UPDATE ON rate_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_card_shares ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Calculations policies
CREATE POLICY "Users can view own calculations"
  ON calculations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calculations"
  ON calculations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Rate cards policies
CREATE POLICY "Users can view own rate cards"
  ON rate_cards FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own rate cards"
  ON rate_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own rate cards"
  ON rate_cards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own rate cards"
  ON rate_cards FOR DELETE
  USING (auth.uid() = user_id);

-- Rate card shares policies
CREATE POLICY "Users can view own shares"
  ON rate_card_shares FOR SELECT
  USING (auth.uid() = shared_by OR auth.uid() = shared_with);

CREATE POLICY "Users can create shares"
  ON rate_card_shares FOR INSERT
  WITH CHECK (auth.uid() = shared_by);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
