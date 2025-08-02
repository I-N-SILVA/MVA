'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useRealtimeVotes } from '@/hooks/useRealtimeVotes'
import { supabase } from '@/lib/supabase/client'
import { 
  Activity,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  TrendingUp,
  Clock,
  User,
  Star,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'vote' | 'comment' | 'submission_status_change'
  submission_id: string
  submission_name: string
  user_name: string
  data: any
  created_at: string
}

interface ActivityFeedProps {
  submissionIds?: string[]
  maxItems?: number
  showSubmissionFilter?: boolean
  className?: string
}

export function ActivityFeed({ 
  submissionIds = [], 
  maxItems = 20,
  showSubmissionFilter = true,
  className = ''
}: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [filterType, setFilterType] = useState<'all' | 'votes' | 'comments'>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<string>('')

  const { isConnected } = useRealtimeVotes(submissionIds)

  // Fetch recent activities
  useEffect(() => {
    fetchActivities()
  }, [submissionIds.length])

  // Set up real-time subscriptions
  useEffect(() => {
    if (submissionIds.length === 0) return

    const channel = supabase
      .channel('activity-feed')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          filter: submissionIds.length > 0 ? `submission_id=in.(${submissionIds.join(',')})` : undefined
        },
        (payload) => {
          handleVoteActivity(payload)
        }
      )
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submission_comments',
          filter: submissionIds.length > 0 ? `submission_id=in.(${submissionIds.join(',')})` : undefined
        },
        (payload) => {
          handleCommentActivity(payload)
        }
      )
      .on('postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'submissions',
          filter: submissionIds.length > 0 ? `id=in.(${submissionIds.join(',')})` : undefined
        },
        (payload) => {
          handleSubmissionStatusChange(payload)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [submissionIds.join(',')])

  // Filter activities based on selected filters
  useEffect(() => {
    let filtered = activities

    if (filterType !== 'all') {
      filtered = filtered.filter(activity => {
        if (filterType === 'votes') return activity.type === 'vote'
        if (filterType === 'comments') return activity.type === 'comment'
        return true
      })
    }

    if (selectedSubmission && selectedSubmission !== 'all') {
      filtered = filtered.filter(activity => activity.submission_id === selectedSubmission)
    }

    setFilteredActivities(filtered.slice(0, showAll ? maxItems : 10))
  }, [activities, filterType, selectedSubmission, showAll, maxItems])

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const activities: ActivityItem[] = []

      // Fetch recent votes
      const { data: votes } = await supabase
        .from('votes')
        .select(`
          id,
          submission_id,
          vote_type,
          confidence_level,
          created_at,
          profiles:voter_id(username),
          submissions:submission_id(athlete_name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      if (votes) {
        votes.forEach(vote => {
          if (!submissionIds.length || submissionIds.includes(vote.submission_id)) {
            activities.push({
              id: vote.id,
              type: 'vote',
              submission_id: vote.submission_id,
              submission_name: (vote as any).submissions?.athlete_name || 'Unknown Athlete',
              user_name: (vote as any).profiles?.username || 'Anonymous',
              data: {
                vote_type: vote.vote_type,
                confidence_level: vote.confidence_level
              },
              created_at: vote.created_at
            })
          }
        })
      }

      // Fetch recent comments
      const { data: comments } = await supabase
        .from('submission_comments')
        .select(`
          id,
          submission_id,
          content,
          created_at,
          profiles:user_id(username),
          submissions:submission_id(athlete_name)
        `)
        .order('created_at', { ascending: false })
        .limit(30)

      if (comments) {
        comments.forEach(comment => {
          if (!submissionIds.length || submissionIds.includes(comment.submission_id)) {
            activities.push({
              id: comment.id,
              type: 'comment',
              submission_id: comment.submission_id,
              submission_name: (comment as any).submissions?.athlete_name || 'Unknown Athlete',
              user_name: (comment as any).profiles?.username || 'Anonymous',
              data: {
                content: comment.content.substring(0, 100) + (comment.content.length > 100 ? '...' : '')
              },
              created_at: comment.created_at
            })
          }
        })
      }

      // Sort all activities by date
      activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setActivities(activities.slice(0, maxItems))
    } catch (error) {
      console.error('Error fetching activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoteActivity = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      try {
        const { data: voteData } = await supabase
          .from('votes')
          .select(`
            id,
            submission_id,
            vote_type,
            confidence_level,
            created_at,
            profiles:voter_id(username),
            submissions:submission_id(athlete_name)
          `)
          .eq('id', payload.new.id)
          .single()

        if (voteData && (!submissionIds.length || submissionIds.includes(voteData.submission_id))) {
          const newActivity: ActivityItem = {
            id: voteData.id,
            type: 'vote',
            submission_id: voteData.submission_id,
            submission_name: (voteData as any).submissions?.athlete_name || 'Unknown Athlete',
            user_name: (voteData as any).profiles?.username || 'Anonymous',
            data: {
              vote_type: voteData.vote_type,
              confidence_level: voteData.confidence_level
            },
            created_at: voteData.created_at
          }

          setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)])
        }
      } catch (error) {
        console.error('Error handling vote activity:', error)
      }
    }
  }

  const handleCommentActivity = async (payload: any) => {
    if (payload.eventType === 'INSERT') {
      try {
        const { data: commentData } = await supabase
          .from('submission_comments')
          .select(`
            id,
            submission_id,
            content,
            created_at,
            profiles:user_id(username),
            submissions:submission_id(athlete_name)
          `)
          .eq('id', payload.new.id)
          .single()

        if (commentData && (!submissionIds.length || submissionIds.includes(commentData.submission_id))) {
          const newActivity: ActivityItem = {
            id: commentData.id,
            type: 'comment',
            submission_id: commentData.submission_id,
            submission_name: (commentData as any).submissions?.athlete_name || 'Unknown Athlete',
            user_name: (commentData as any).profiles?.username || 'Anonymous',
            data: {
              content: commentData.content.substring(0, 100) + (commentData.content.length > 100 ? '...' : '')
            },
            created_at: commentData.created_at
          }

          setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)])
        }
      } catch (error) {
        console.error('Error handling comment activity:', error)
      }
    }
  }

  const handleSubmissionStatusChange = (payload: any) => {
    if (payload.old.submission_status !== payload.new.submission_status) {
      const newActivity: ActivityItem = {
        id: `status-${payload.new.id}-${Date.now()}`,
        type: 'submission_status_change',
        submission_id: payload.new.id,
        submission_name: payload.new.athlete_name,
        user_name: 'System',
        data: {
          old_status: payload.old.submission_status,
          new_status: payload.new.submission_status
        },
        created_at: payload.new.updated_at
      }

      setActivities(prev => [newActivity, ...prev.slice(0, maxItems - 1)])
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    return date.toLocaleDateString()
  }

  const getActivityIcon = (type: string, data?: any) => {
    switch (type) {
      case 'vote':
        return data?.vote_type === 'for' ? 
          <ThumbsUp className="h-4 w-4 text-green-600" /> :
          <ThumbsDown className="h-4 w-4 text-red-600" />
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-blue-600" />
      case 'submission_status_change':
        return <TrendingUp className="h-4 w-4 text-purple-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'vote':
        return (
          <span>
            <span className="font-medium">{activity.user_name}</span> voted{' '}
            <span className={`font-medium ${activity.data.vote_type === 'for' ? 'text-green-600' : 'text-red-600'}`}>
              {activity.data.vote_type}
            </span>{' '}
            on <span className="font-medium">{activity.submission_name}</span>
            {activity.data.confidence_level && (
              <span className="text-gray-500 ml-1">
                ({activity.data.confidence_level}/5 confidence)
              </span>
            )}
          </span>
        )
      case 'comment':
        return (
          <span>
            <span className="font-medium">{activity.user_name}</span> commented on{' '}
            <span className="font-medium">{activity.submission_name}</span>
            {activity.data.content && (
              <div className="text-gray-600 text-sm mt-1 italic">
                "{activity.data.content}"
              </div>
            )}
          </span>
        )
      case 'submission_status_change':
        return (
          <span>
            <span className="font-medium">{activity.submission_name}</span> status changed from{' '}
            <Badge variant="outline" className="mx-1">
              {activity.data.old_status}
            </Badge>
            to
            <Badge variant="outline" className="mx-1">
              {activity.data.new_status}
            </Badge>
          </span>
        )
      default:
        return <span>Unknown activity</span>
    }
  }

  const uniqueSubmissions = [...new Set(activities.map(a => a.submission_id))]

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            <h3 className="text-lg font-semibold text-gray-900">Live Activity</h3>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchActivities}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Filters */}
        {showSubmissionFilter && uniqueSubmissions.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-3">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('all')}
            >
              All Activity
            </Button>
            <Button
              variant={filterType === 'votes' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('votes')}
            >
              Votes
            </Button>
            <Button
              variant={filterType === 'comments' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType('comments')}
            >
              Comments
            </Button>
          </div>
        )}
      </div>

      {/* Activity List */}
      <div className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-1">No activity yet</h4>
            <p className="text-gray-500">Activity will appear here as it happens</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredActivities.map((activity, index) => (
              <div 
                key={`${activity.id}-${index}`}
                className="flex gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                  {getActivityIcon(activity.type, activity.data)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-900">
                    {getActivityText(activity)}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(activity.created_at)}
                    </div>
                    
                    {index < 3 && (
                      <Badge variant="outline" className="text-xs">
                        New
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {activities.length > 10 && (
              <div className="text-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAll(!showAll)}
                >
                  {showAll ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Show More
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}