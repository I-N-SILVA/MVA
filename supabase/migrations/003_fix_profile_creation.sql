-- ================================================
-- Fix Profile Creation Trigger
-- ================================================
-- This migration fixes the profile creation trigger to properly handle
-- user metadata from the signup form including the role field

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function to handle user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        username, 
        full_name, 
        avatar_url, 
        user_type
    )
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'role', 'fan')::TEXT
    );
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't prevent user creation
        RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update the user_type check constraint to match the form options
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_type_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_user_type_check 
CHECK (user_type IN ('scout', 'fan', 'athlete'));

-- Add a function to handle profile updates when user metadata changes
CREATE OR REPLACE FUNCTION public.sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if the profile exists and metadata has changed
    IF OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data THEN
        UPDATE public.profiles 
        SET 
            username = NEW.raw_user_meta_data->>'username',
            full_name = NEW.raw_user_meta_data->>'full_name',
            avatar_url = NEW.raw_user_meta_data->>'avatar_url',
            user_type = COALESCE(NEW.raw_user_meta_data->>'role', user_type)::TEXT,
            updated_at = NOW()
        WHERE id = NEW.id;
    END IF;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log the error but don't prevent the update
        RAISE WARNING 'Failed to sync profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for profile sync on user updates
CREATE TRIGGER sync_profile_on_user_update
    AFTER UPDATE ON auth.users
    FOR EACH ROW 
    WHEN (OLD.raw_user_meta_data IS DISTINCT FROM NEW.raw_user_meta_data)
    EXECUTE FUNCTION public.sync_user_profile();

-- Add helpful comments
COMMENT ON FUNCTION public.handle_new_user() IS 'Creates a profile when a new user signs up, extracting data from user metadata';
COMMENT ON FUNCTION public.sync_user_profile() IS 'Syncs profile data when user metadata is updated';

-- Create a function to manually create missing profiles (for existing users)
CREATE OR REPLACE FUNCTION public.create_missing_profiles()
RETURNS INTEGER AS $$
DECLARE
    missing_count INTEGER := 0;
    user_record RECORD;
BEGIN
    -- Find users without profiles
    FOR user_record IN 
        SELECT au.id, au.raw_user_meta_data, au.email
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL
    LOOP
        BEGIN
            INSERT INTO public.profiles (
                id,
                username,
                full_name,
                avatar_url,
                user_type
            ) VALUES (
                user_record.id,
                user_record.raw_user_meta_data->>'username',
                user_record.raw_user_meta_data->>'full_name',
                user_record.raw_user_meta_data->>'avatar_url',
                COALESCE(user_record.raw_user_meta_data->>'role', 'fan')::TEXT
            );
            missing_count := missing_count + 1;
        EXCEPTION
            WHEN others THEN
                RAISE WARNING 'Failed to create missing profile for user %: %', user_record.id, SQLERRM;
        END;
    END LOOP;
    
    RETURN missing_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run the function to create any missing profiles
SELECT public.create_missing_profiles() as profiles_created;

COMMENT ON FUNCTION public.create_missing_profiles() IS 'Creates profiles for any existing users who dont have one';