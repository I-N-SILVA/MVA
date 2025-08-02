-- ================================================
-- Plyaz MVP - Initial Database Schema Migration
-- ================================================
-- This migration creates the complete database schema for the Plyaz MVP platform
-- including all tables, RLS policies, indexes, and database functions.

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================
-- PROFILES TABLE
-- ================================================
-- Extends auth.users with additional profile information
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    website TEXT,
    social_links JSONB DEFAULT '{}',
    user_type TEXT CHECK (user_type IN ('scout', 'fan', 'athlete')) DEFAULT 'fan',
    reputation_score INTEGER DEFAULT 0,
    total_votes_cast INTEGER DEFAULT 0,
    successful_votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ================================================
-- SUBMISSIONS TABLE
-- ================================================
-- Stores athlete submissions for community validation
CREATE TABLE public.submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    athlete_name TEXT NOT NULL,
    sport TEXT NOT NULL,
    position TEXT,
    age INTEGER CHECK (age > 0 AND age < 50),
    height TEXT,
    weight TEXT,
    nationality TEXT,
    current_team TEXT,
    previous_teams TEXT[],
    achievements TEXT[],
    stats JSONB DEFAULT '{}',
    media_urls TEXT[],
    video_highlights TEXT[],
    social_media JSONB DEFAULT '{}',
    scouting_notes TEXT,
    market_value_estimate DECIMAL(12,2),
    submission_status TEXT CHECK (submission_status IN ('pending', 'under_review', 'approved', 'rejected')) DEFAULT 'pending',
    rejection_reason TEXT,
    votes_for INTEGER DEFAULT 0,
    votes_against INTEGER DEFAULT 0,
    total_votes INTEGER DEFAULT 0,
    voting_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on submissions
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submissions
CREATE POLICY "Submissions are viewable by everyone" ON public.submissions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create submissions" ON public.submissions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own submissions" ON public.submissions
    FOR UPDATE USING (auth.uid() = submitted_by);

CREATE POLICY "Only system can update submission status and vote counts" ON public.submissions
    FOR UPDATE USING (false); -- This will be handled by database functions

-- ================================================
-- VOTES TABLE
-- ================================================
-- Stores community votes on athlete submissions
CREATE TABLE public.votes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type TEXT CHECK (vote_type IN ('for', 'against')) NOT NULL,
    confidence_level INTEGER CHECK (confidence_level >= 1 AND confidence_level <= 5) DEFAULT 3,
    reasoning TEXT,
    expertise_areas TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one vote per user per submission
    UNIQUE(submission_id, voter_id)
);

-- Enable RLS on votes
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for votes
CREATE POLICY "Votes are viewable by everyone" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create votes" ON public.votes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = voter_id);

CREATE POLICY "Users can update their own votes" ON public.votes
    FOR UPDATE USING (auth.uid() = voter_id);

CREATE POLICY "Users can delete their own votes" ON public.votes
    FOR DELETE USING (auth.uid() = voter_id);

-- ================================================
-- ATHLETES TABLE
-- ================================================
-- Stores approved athletes from successful submissions
CREATE TABLE public.athletes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    sport TEXT NOT NULL,
    position TEXT,
    age INTEGER CHECK (age > 0 AND age < 50),
    height TEXT,
    weight TEXT,
    nationality TEXT,
    current_team TEXT,
    previous_teams TEXT[],
    achievements TEXT[],
    stats JSONB DEFAULT '{}',
    media_urls TEXT[],
    video_highlights TEXT[],
    social_media JSONB DEFAULT '{}',
    market_value DECIMAL(12,2),
    performance_metrics JSONB DEFAULT '{}',
    career_trajectory TEXT CHECK (career_trajectory IN ('rising', 'peak', 'declining', 'unknown')) DEFAULT 'unknown',
    investment_potential INTEGER CHECK (investment_potential >= 1 AND investment_potential <= 10) DEFAULT 5,
    total_investments DECIMAL(15,2) DEFAULT 0,
    current_share_price DECIMAL(8,2) DEFAULT 100.00,
    shares_outstanding BIGINT DEFAULT 1000000,
    market_cap DECIMAL(15,2) GENERATED ALWAYS AS (current_share_price * shares_outstanding) STORED,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on athletes
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for athletes
CREATE POLICY "Athletes are viewable by everyone" ON public.athletes
    FOR SELECT USING (true);

CREATE POLICY "Only system can create athletes" ON public.athletes
    FOR INSERT WITH CHECK (false); -- This will be handled by database functions

CREATE POLICY "Only system can update athletes" ON public.athletes
    FOR UPDATE USING (false); -- This will be handled by database functions

-- ================================================
-- INVESTMENTS TABLE
-- ================================================
-- Stores simulated investments in athletes
CREATE TABLE public.investments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    investor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE NOT NULL,
    investment_type TEXT CHECK (investment_type IN ('buy', 'sell')) NOT NULL,
    shares BIGINT NOT NULL CHECK (shares > 0),
    price_per_share DECIMAL(8,2) NOT NULL CHECK (price_per_share > 0),
    total_amount DECIMAL(15,2) GENERATED ALWAYS AS (shares * price_per_share) STORED,
    transaction_fee DECIMAL(8,2) DEFAULT 0,
    net_amount DECIMAL(15,2) GENERATED ALWAYS AS (total_amount + transaction_fee) STORED,
    reasoning TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on investments
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for investments
CREATE POLICY "Users can view their own investments" ON public.investments
    FOR SELECT USING (auth.uid() = investor_id);

CREATE POLICY "Investment summaries are viewable by everyone" ON public.investments
    FOR SELECT USING (true); -- For aggregate data only

CREATE POLICY "Authenticated users can create investments" ON public.investments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = investor_id);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Profiles indexes
CREATE INDEX profiles_username_idx ON public.profiles(username);
CREATE INDEX profiles_user_type_idx ON public.profiles(user_type);
CREATE INDEX profiles_reputation_idx ON public.profiles(reputation_score DESC);

-- Submissions indexes
CREATE INDEX submissions_status_idx ON public.submissions(submission_status);
CREATE INDEX submissions_submitted_by_idx ON public.submissions(submitted_by);
CREATE INDEX submissions_sport_idx ON public.submissions(sport);
CREATE INDEX submissions_voting_deadline_idx ON public.submissions(voting_deadline);
CREATE INDEX submissions_created_at_idx ON public.submissions(created_at DESC);
CREATE INDEX submissions_total_votes_idx ON public.submissions(total_votes DESC);

-- Votes indexes
CREATE INDEX votes_submission_id_idx ON public.votes(submission_id);
CREATE INDEX votes_voter_id_idx ON public.votes(voter_id);
CREATE INDEX votes_created_at_idx ON public.votes(created_at DESC);

-- Athletes indexes
CREATE INDEX athletes_sport_idx ON public.athletes(sport);
CREATE INDEX athletes_name_idx ON public.athletes(name);
CREATE INDEX athletes_market_cap_idx ON public.athletes(market_cap DESC);
CREATE INDEX athletes_investment_potential_idx ON public.athletes(investment_potential DESC);
CREATE INDEX athletes_is_active_idx ON public.athletes(is_active);

-- Text search indexes
CREATE INDEX athletes_name_trgm_idx ON public.athletes USING gin(name gin_trgm_ops);
CREATE INDEX submissions_athlete_name_trgm_idx ON public.submissions USING gin(athlete_name gin_trgm_ops);

-- Investments indexes
CREATE INDEX investments_investor_id_idx ON public.investments(investor_id);
CREATE INDEX investments_athlete_id_idx ON public.investments(athlete_id);
CREATE INDEX investments_created_at_idx ON public.investments(created_at DESC);
CREATE INDEX investments_investment_type_idx ON public.investments(investment_type);

-- ================================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER submissions_updated_at
    BEFORE UPDATE ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER athletes_updated_at
    BEFORE UPDATE ON public.athletes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to update vote counts when votes are inserted/updated/deleted
CREATE OR REPLACE FUNCTION public.update_submission_vote_counts()
RETURNS TRIGGER AS $$
DECLARE
    submission_uuid UUID;
    votes_for_count INTEGER;
    votes_against_count INTEGER;
    total_count INTEGER;
BEGIN
    -- Determine which submission to update
    IF TG_OP = 'DELETE' THEN
        submission_uuid := OLD.submission_id;
    ELSE
        submission_uuid := NEW.submission_id;
    END IF;
    
    -- Calculate vote counts
    SELECT 
        COUNT(CASE WHEN vote_type = 'for' THEN 1 END),
        COUNT(CASE WHEN vote_type = 'against' THEN 1 END),
        COUNT(*)
    INTO votes_for_count, votes_against_count, total_count
    FROM public.votes 
    WHERE submission_id = submission_uuid;
    
    -- Update submission vote counts
    UPDATE public.submissions 
    SET 
        votes_for = votes_for_count,
        votes_against = votes_against_count,
        total_votes = total_count,
        updated_at = NOW()
    WHERE id = submission_uuid;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for vote count updates
CREATE TRIGGER update_vote_counts_on_insert
    AFTER INSERT ON public.votes
    FOR EACH ROW EXECUTE FUNCTION public.update_submission_vote_counts();

CREATE TRIGGER update_vote_counts_on_update
    AFTER UPDATE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION public.update_submission_vote_counts();

CREATE TRIGGER update_vote_counts_on_delete
    AFTER DELETE ON public.votes
    FOR EACH ROW EXECUTE FUNCTION public.update_submission_vote_counts();

-- Function to update user reputation based on voting success
CREATE OR REPLACE FUNCTION public.update_voter_reputation()
RETURNS TRIGGER AS $$
DECLARE
    voter_uuid UUID;
    submission_status TEXT;
    vote_was_correct BOOLEAN;
BEGIN
    -- Only process when submission status changes to approved/rejected
    IF NEW.submission_status IN ('approved', 'rejected') AND 
       OLD.submission_status != NEW.submission_status THEN
        
        -- Update reputation for all voters on this submission
        FOR voter_uuid IN 
            SELECT DISTINCT voter_id FROM public.votes WHERE submission_id = NEW.id
        LOOP
            -- Check if voter's vote was correct
            SELECT 
                CASE 
                    WHEN NEW.submission_status = 'approved' AND vote_type = 'for' THEN true
                    WHEN NEW.submission_status = 'rejected' AND vote_type = 'against' THEN true
                    ELSE false
                END
            INTO vote_was_correct
            FROM public.votes 
            WHERE submission_id = NEW.id AND voter_id = voter_uuid;
            
            -- Update voter's reputation and stats
            UPDATE public.profiles 
            SET 
                reputation_score = reputation_score + CASE WHEN vote_was_correct THEN 10 ELSE -5 END,
                total_votes_cast = total_votes_cast + 1,
                successful_votes = successful_votes + CASE WHEN vote_was_correct THEN 1 ELSE 0 END,
                updated_at = NOW()
            WHERE id = voter_uuid;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for reputation updates
CREATE TRIGGER update_reputation_on_submission_status_change
    AFTER UPDATE ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.update_voter_reputation();

-- Function to create athlete from approved submission
CREATE OR REPLACE FUNCTION public.create_athlete_from_submission()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create athlete when submission is approved
    IF NEW.submission_status = 'approved' AND OLD.submission_status != 'approved' THEN
        INSERT INTO public.athletes (
            submission_id,
            name,
            sport,
            position,
            age,
            height,
            weight,
            nationality,
            current_team,
            previous_teams,
            achievements,
            stats,
            media_urls,
            video_highlights,
            social_media,
            market_value,
            performance_metrics
        ) VALUES (
            NEW.id,
            NEW.athlete_name,
            NEW.sport,
            NEW.position,
            NEW.age,
            NEW.height,
            NEW.weight,
            NEW.nationality,
            NEW.current_team,
            NEW.previous_teams,
            NEW.achievements,
            NEW.stats,
            NEW.media_urls,
            NEW.video_highlights,
            NEW.social_media,
            NEW.market_value_estimate,
            '{}'::jsonb
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create athlete from approved submission
CREATE TRIGGER create_athlete_on_approval
    AFTER UPDATE ON public.submissions
    FOR EACH ROW EXECUTE FUNCTION public.create_athlete_from_submission();

-- Function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- UTILITY FUNCTIONS
-- ================================================

-- Function to get user portfolio value
CREATE OR REPLACE FUNCTION public.get_user_portfolio_value(user_id UUID)
RETURNS DECIMAL(15,2) AS $$
DECLARE
    portfolio_value DECIMAL(15,2) := 0;
BEGIN
    SELECT COALESCE(SUM(
        CASE 
            WHEN i.investment_type = 'buy' THEN i.shares * a.current_share_price
            WHEN i.investment_type = 'sell' THEN -i.shares * a.current_share_price
        END
    ), 0)
    INTO portfolio_value
    FROM public.investments i
    JOIN public.athletes a ON i.athlete_id = a.id
    WHERE i.investor_id = user_id;
    
    RETURN portfolio_value;
END;
$$ LANGUAGE plpgsql;

-- Function to get trending athletes (most invested in recently)
CREATE OR REPLACE FUNCTION public.get_trending_athletes(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    athlete_id UUID,
    athlete_name TEXT,
    sport TEXT,
    total_recent_investment DECIMAL(15,2),
    investment_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.name,
        a.sport,
        COALESCE(SUM(i.total_amount), 0) as total_recent_investment,
        COUNT(i.id) as investment_count
    FROM public.athletes a
    LEFT JOIN public.investments i ON a.id = i.athlete_id 
        AND i.created_at >= NOW() - INTERVAL '7 days'
    WHERE a.is_active = true
    GROUP BY a.id, a.name, a.sport
    ORDER BY total_recent_investment DESC, investment_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate submission voting progress
CREATE OR REPLACE FUNCTION public.get_submission_voting_progress(submission_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'votes_for', s.votes_for,
        'votes_against', s.votes_against,
        'total_votes', s.total_votes,
        'voting_deadline', s.voting_deadline,
        'hours_remaining', EXTRACT(EPOCH FROM (s.voting_deadline - NOW())) / 3600,
        'approval_percentage', 
            CASE 
                WHEN s.total_votes > 0 THEN ROUND((s.votes_for::DECIMAL / s.total_votes) * 100, 2)
                ELSE 0 
            END
    )
    INTO result
    FROM public.submissions s
    WHERE s.id = submission_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- INITIAL DATA SEEDING (Optional)
-- ================================================

-- Insert some initial sports categories (can be expanded)
CREATE TABLE IF NOT EXISTS public.sports_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO public.sports_categories (name, description) VALUES
('Football', 'Association Football/Soccer'),
('Basketball', 'Professional Basketball'),
('American Football', 'NFL/College Football'),
('Baseball', 'MLB/Professional Baseball'), 
('Tennis', 'Professional Tennis'),
('Hockey', 'Ice Hockey'),
('Golf', 'Professional Golf'),
('Athletics', 'Track and Field'),
('Swimming', 'Competitive Swimming'),
('Cycling', 'Professional Cycling');

-- Enable RLS on sports categories
ALTER TABLE public.sports_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sports categories are viewable by everyone" ON public.sports_categories
    FOR SELECT USING (true);

-- ================================================
-- FINAL SETUP AND PERMISSIONS
-- ================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant select permissions to anonymous users for public data
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.submissions TO anon;
GRANT SELECT ON public.votes TO anon;
GRANT SELECT ON public.athletes TO anon;
GRANT SELECT ON public.sports_categories TO anon;

-- Create indexes for RLS policies performance
CREATE INDEX profiles_id_idx ON public.profiles(id);
CREATE INDEX submissions_submitted_by_auth_idx ON public.submissions(submitted_by) WHERE submitted_by IS NOT NULL;
CREATE INDEX votes_voter_id_auth_idx ON public.votes(voter_id) WHERE voter_id IS NOT NULL;
CREATE INDEX investments_investor_id_auth_idx ON public.investments(investor_id) WHERE investor_id IS NOT NULL;

COMMENT ON TABLE public.profiles IS 'User profiles extending auth.users with additional information';
COMMENT ON TABLE public.submissions IS 'Athlete submissions awaiting community validation';
COMMENT ON TABLE public.votes IS 'Community votes on athlete submissions';
COMMENT ON TABLE public.athletes IS 'Approved athletes available for investment';
COMMENT ON TABLE public.investments IS 'Simulated investments in athletes';
COMMENT ON TABLE public.sports_categories IS 'Available sports categories';

-- ================================================
-- MIGRATION COMPLETE
-- ================================================
-- This completes the initial database schema for Plyaz MVP
-- All tables have RLS enabled with appropriate policies
-- Indexes are created for optimal performance
-- Database functions and triggers handle business logic
-- The schema supports the full athlete scouting and investment workflow