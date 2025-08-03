-- ================================================
-- Enhanced Authentication System Migration
-- ================================================
-- This migration adds tables and functions for enhanced authentication features

-- Create table for login attempts tracking (server-side rate limiting)
CREATE TABLE IF NOT EXISTS public.login_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    identifier TEXT NOT NULL, -- IP address or client identifier
    email TEXT,
    attempt_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    success BOOLEAN DEFAULT FALSE,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on login_attempts
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for login_attempts (admin only)
CREATE POLICY "Only admins can view login attempts" ON public.login_attempts
    FOR SELECT USING (false); -- Only accessible via functions

-- Create table for user preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email_notifications JSONB DEFAULT '{"weekly_summary": true, "new_features": true, "security_alerts": true}',
    privacy_settings JSONB DEFAULT '{"profile_visibility": "public", "activity_visibility": "friends"}',
    theme_preference TEXT DEFAULT 'system' CHECK (theme_preference IN ('light', 'dark', 'system')),
    language_preference TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'UTC',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Create table for user activity log
CREATE TABLE IF NOT EXISTS public.user_activity_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL,
    activity_description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_activity_log
ALTER TABLE public.user_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_log
CREATE POLICY "Users can view their own activity" ON public.user_activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- Function to create user preferences on profile creation
CREATE OR REPLACE FUNCTION public.create_user_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create preferences when profile is created
CREATE TRIGGER create_preferences_on_profile_creation
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_user_preferences();

-- Function to log user activity
CREATE OR REPLACE FUNCTION public.log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.user_activity_log (
        user_id,
        activity_type,
        activity_description,
        metadata
    )
    VALUES (
        p_user_id,
        p_activity_type,
        p_activity_description,
        p_metadata
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to track login attempts (server-side rate limiting)
CREATE OR REPLACE FUNCTION public.track_login_attempt(
    p_identifier TEXT,
    p_email TEXT DEFAULT NULL,
    p_success BOOLEAN DEFAULT FALSE,
    p_user_agent TEXT DEFAULT NULL,
    p_ip_address INET DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    attempt_count INTEGER;
    block_duration INTERVAL := '30 minutes';
    window_duration INTERVAL := '15 minutes';
BEGIN
    -- Insert the current attempt
    INSERT INTO public.login_attempts (
        identifier,
        email,
        success,
        user_agent,
        ip_address
    )
    VALUES (
        p_identifier,
        p_email,
        p_success,
        p_user_agent,
        p_ip_address
    );
    
    -- If successful, clean up old failed attempts for this identifier
    IF p_success THEN
        DELETE FROM public.login_attempts 
        WHERE identifier = p_identifier 
        AND success = FALSE 
        AND attempt_time > NOW() - window_duration;
        RETURN TRUE;
    END IF;
    
    -- Count failed attempts in the last window
    SELECT COUNT(*) INTO attempt_count
    FROM public.login_attempts
    WHERE identifier = p_identifier
    AND success = FALSE
    AND attempt_time > NOW() - window_duration;
    
    -- Return FALSE if too many attempts (5 or more)
    RETURN attempt_count < 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if identifier is blocked
CREATE OR REPLACE FUNCTION public.is_login_blocked(p_identifier TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    attempt_count INTEGER;
    window_duration INTERVAL := '15 minutes';
BEGIN
    SELECT COUNT(*) INTO attempt_count
    FROM public.login_attempts
    WHERE identifier = p_identifier
    AND success = FALSE
    AND attempt_time > NOW() - window_duration;
    
    RETURN attempt_count >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get profile completion percentage
CREATE OR REPLACE FUNCTION public.get_profile_completion(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    completion_score INTEGER := 0;
    total_possible INTEGER := 7;
    profile_record RECORD;
    user_record RECORD;
    preferences_record RECORD;
BEGIN
    -- Get profile data
    SELECT * INTO profile_record FROM public.profiles WHERE id = p_user_id;
    SELECT * INTO user_record FROM auth.users WHERE id = p_user_id;
    SELECT * INTO preferences_record FROM public.user_preferences WHERE user_id = p_user_id;
    
    -- Check completion criteria
    IF user_record.email_confirmed_at IS NOT NULL THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.full_name IS NOT NULL AND LENGTH(profile_record.full_name) > 0 THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.username IS NOT NULL AND LENGTH(profile_record.username) > 0 THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.avatar_url IS NOT NULL AND LENGTH(profile_record.avatar_url) > 0 THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.bio IS NOT NULL AND LENGTH(profile_record.bio) > 0 THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF profile_record.user_type IS NOT NULL THEN
        completion_score := completion_score + 1;
    END IF;
    
    IF preferences_record.onboarding_completed = TRUE THEN
        completion_score := completion_score + 1;
    END IF;
    
    RETURN ROUND((completion_score::DECIMAL / total_possible::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS login_attempts_identifier_idx ON public.login_attempts(identifier);
CREATE INDEX IF NOT EXISTS login_attempts_email_idx ON public.login_attempts(email);
CREATE INDEX IF NOT EXISTS login_attempts_time_idx ON public.login_attempts(attempt_time DESC);
CREATE INDEX IF NOT EXISTS login_attempts_success_idx ON public.login_attempts(success);

CREATE INDEX IF NOT EXISTS user_preferences_user_id_idx ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS user_activity_log_user_id_idx ON public.user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS user_activity_log_type_idx ON public.user_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS user_activity_log_time_idx ON public.user_activity_log(created_at DESC);

-- Add updated_at trigger for user_preferences
CREATE TRIGGER user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Cleanup old login attempts (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_login_attempts()
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.login_attempts 
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT SELECT ON public.user_activity_log TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_user_activity TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_profile_completion TO authenticated;

-- Add helpful comments
COMMENT ON TABLE public.login_attempts IS 'Tracks login attempts for rate limiting and security monitoring';
COMMENT ON TABLE public.user_preferences IS 'Stores user preferences and settings';
COMMENT ON TABLE public.user_activity_log IS 'Logs user activities for security and analytics';

COMMENT ON FUNCTION public.track_login_attempt IS 'Tracks login attempts and returns FALSE if identifier should be blocked';
COMMENT ON FUNCTION public.is_login_blocked IS 'Checks if an identifier is currently blocked due to failed attempts';
COMMENT ON FUNCTION public.get_profile_completion IS 'Calculates profile completion percentage for a user';

-- Verify the migration
SELECT 'Enhanced authentication migration completed successfully!' as status;