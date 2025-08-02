'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { 
  MessageSquare, 
  Send, 
  Heart, 
  Reply, 
  MoreHorizontal,
  Flag,
  Clock,
  User,
  Award,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface Comment {
  id: string
  submission_id: string
  user_id: string
  content: string
  parent_comment_id?: string
  likes_count: number
  created_at: string
  updated_at: string
  profiles: {
    username: string
    avatar_url: string | null
    reputation_score: number
  } | null
  user_liked?: boolean
  replies?: Comment[]
}

interface DiscussionSectionProps {
  submissionId: string
  className?: string
}

export function DiscussionSection({ submissionId, className = '' }: DiscussionSectionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())

  // Fetch comments
  useEffect(() => {
    fetchComments()
  }, [submissionId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      // First, get top-level comments
      const { data: topLevelComments, error } = await supabase
        .from('submission_comments')
        .select(`
          *,
          profiles:user_id(username, avatar_url, reputation_score)
        `)
        .eq('submission_id', submissionId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Then get replies for each top-level comment
      const commentsWithReplies = await Promise.all(
        (topLevelComments || []).map(async (comment) => {
          const { data: replies } = await supabase
            .from('submission_comments')
            .select(`
              *,
              profiles:user_id(username, avatar_url, reputation_score)
            `)
            .eq('parent_comment_id', comment.id)
            .order('created_at', { ascending: true })

          return {
            ...comment,
            replies: replies || []
          }
        })
      )

      setComments(commentsWithReplies)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const submitComment = async () => {
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('submission_comments')
        .insert({
          submission_id: submissionId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          *,
          profiles:user_id(username, avatar_url, reputation_score)
        `)
        .single()

      if (error) throw error

      setComments(prev => [{ ...data, replies: [] }, ...prev])
      setNewComment('')
    } catch (error) {
      console.error('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('submission_comments')
        .insert({
          submission_id: submissionId,
          user_id: user.id,
          content: replyContent.trim(),
          parent_comment_id: parentId
        })
        .select(`
          *,
          profiles:user_id(username, avatar_url, reputation_score)
        `)
        .single()

      if (error) throw error

      // Add reply to the parent comment
      setComments(prev => prev.map(comment => 
        comment.id === parentId 
          ? { ...comment, replies: [...(comment.replies || []), data] }
          : comment
      ))
      
      setReplyContent('')
      setReplyingTo(null)
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLike = async (commentId: string) => {
    if (!user) return

    try {
      // Check if user already liked this comment
      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        // Unlike
        await supabase
          .from('comment_likes')
          .delete()
          .eq('id', existingLike.id)
      } else {
        // Like
        await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: user.id
          })
      }

      // Refresh comments to get updated like counts
      fetchComments()
    } catch (error) {
      console.error('Error toggling like:', error)
    }
  }

  const toggleExpanded = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString()
  }

  const getReputationBadgeColor = (reputation: number) => {
    if (reputation >= 100) return 'bg-purple-100 text-purple-800'
    if (reputation >= 50) return 'bg-blue-100 text-blue-800'
    if (reputation >= 20) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Discussion
          </h3>
          <Badge variant="outline">
            {comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0)} comments
          </Badge>
        </div>
      </div>

      {/* New Comment Form */}
      <div className="p-6 border-b border-gray-100">
        {user ? (
          <div className="space-y-3">
            <Textarea
              placeholder="Share your thoughts on this submission..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
              maxLength={1000}
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {newComment.length}/1000 characters
              </span>
              <Button
                onClick={submitComment}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">Sign in to join the discussion</p>
            <Button variant="outline">Sign In</Button>
          </div>
        )}
      </div>

      {/* Comments List */}
      <div className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">No comments yet</h4>
            <p className="text-gray-500">Be the first to share your thoughts</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="space-y-4">
                {/* Main Comment */}
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">
                        {comment.profiles?.username || 'Anonymous'}
                      </span>
                      
                      {comment.profiles?.reputation_score && (
                        <Badge className={getReputationBadgeColor(comment.profiles.reputation_score)} size="sm">
                          <Award className="h-3 w-3 mr-1" />
                          {comment.profiles.reputation_score}
                        </Badge>
                      )}
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(comment.created_at)}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleLike(comment.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {comment.likes_count}
                      </Button>
                      
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-gray-500"
                        >
                          <Reply className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                      )}
                      
                      {comment.replies && comment.replies.length > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(comment.id)}
                          className="text-gray-500"
                        >
                          {expandedComments.has(comment.id) ? (
                            <ChevronUp className="h-4 w-4 mr-1" />
                          ) : (
                            <ChevronDown className="h-4 w-4 mr-1" />
                          )}
                          {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                {replyingTo === comment.id && (
                  <div className="ml-11 space-y-3">
                    <Textarea
                      placeholder="Write a reply..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      className="min-h-[60px]"
                      maxLength={500}
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {replyContent.length}/500 characters
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReplyingTo(null)
                            setReplyContent('')
                          }}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => submitReply(comment.id)}
                          disabled={!replyContent.trim() || isSubmitting}
                        >
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && expandedComments.has(comment.id) && (
                  <div className="ml-11 space-y-4 border-l-2 border-gray-100 pl-4">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex gap-3">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-3 w-3 text-gray-500" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-gray-900 text-sm">
                              {reply.profiles?.username || 'Anonymous'}
                            </span>
                            
                            {reply.profiles?.reputation_score && (
                              <Badge className={getReputationBadgeColor(reply.profiles.reputation_score)} size="sm">
                                {reply.profiles.reputation_score}
                              </Badge>
                            )}
                            
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {formatTimeAgo(reply.created_at)}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3 mb-2">
                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{reply.content}</p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleLike(reply.id)}
                            className="text-gray-500 hover:text-red-500 text-xs"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            {reply.likes_count}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}