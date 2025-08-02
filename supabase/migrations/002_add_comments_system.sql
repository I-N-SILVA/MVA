-- ================================================
-- Plyaz MVP - Comments System Migration
-- ================================================
-- This migration adds the comment system for submission discussions

-- ================================================
-- SUBMISSION COMMENTS TABLE
-- ================================================
-- Stores comments and discussions on submissions
CREATE TABLE public.submission_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    parent_comment_id UUID REFERENCES public.submission_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 1000),
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on submission_comments
ALTER TABLE public.submission_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for submission_comments
CREATE POLICY "Comments are viewable by everyone" ON public.submission_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.submission_comments
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.submission_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.submission_comments
    FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- COMMENT LIKES TABLE
-- ================================================
-- Stores likes on comments
CREATE TABLE public.comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES public.submission_comments(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure one like per user per comment
    UNIQUE(comment_id, user_id)
);

-- Enable RLS on comment_likes
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comment_likes
CREATE POLICY "Comment likes are viewable by everyone" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comment likes" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can delete their own comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- Submission comments indexes
CREATE INDEX submission_comments_submission_id_idx ON public.submission_comments(submission_id);
CREATE INDEX submission_comments_user_id_idx ON public.submission_comments(user_id);
CREATE INDEX submission_comments_parent_comment_id_idx ON public.submission_comments(parent_comment_id);
CREATE INDEX submission_comments_created_at_idx ON public.submission_comments(created_at DESC);

-- Comment likes indexes
CREATE INDEX comment_likes_comment_id_idx ON public.comment_likes(comment_id);
CREATE INDEX comment_likes_user_id_idx ON public.comment_likes(user_id);

-- ================================================
-- TRIGGERS AND FUNCTIONS
-- ================================================

-- Trigger for updated_at on comments
CREATE TRIGGER submission_comments_updated_at
    BEFORE UPDATE ON public.submission_comments
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to update comment like counts
CREATE OR REPLACE FUNCTION public.update_comment_like_counts()
RETURNS TRIGGER AS $$
DECLARE
    comment_uuid UUID;
    like_count INTEGER;
BEGIN
    -- Determine which comment to update
    IF TG_OP = 'DELETE' THEN
        comment_uuid := OLD.comment_id;
    ELSE
        comment_uuid := NEW.comment_id;
    END IF;
    
    -- Calculate like count
    SELECT COUNT(*)
    INTO like_count
    FROM public.comment_likes 
    WHERE comment_id = comment_uuid;
    
    -- Update comment like count
    UPDATE public.submission_comments 
    SET 
        likes_count = like_count,
        updated_at = NOW()
    WHERE id = comment_uuid;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for like count updates
CREATE TRIGGER update_comment_like_counts_on_insert
    AFTER INSERT ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_like_counts();

CREATE TRIGGER update_comment_like_counts_on_delete
    AFTER DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_like_counts();

-- ================================================
-- PERMISSIONS
-- ================================================

-- Grant permissions for new tables
GRANT ALL ON public.submission_comments TO authenticated;
GRANT ALL ON public.comment_likes TO authenticated;

-- Grant select permissions to anonymous users
GRANT SELECT ON public.submission_comments TO anon;
GRANT SELECT ON public.comment_likes TO anon;

-- ================================================
-- COMMENTS
-- ================================================

COMMENT ON TABLE public.submission_comments IS 'Comments and discussions on athlete submissions';
COMMENT ON TABLE public.comment_likes IS 'Likes on submission comments';

-- ================================================
-- MIGRATION COMPLETE
-- ================================================