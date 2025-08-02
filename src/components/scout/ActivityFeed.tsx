import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { staggerContainer, staggerItem } from '@/lib/animations'

interface Activity {
  id: string
  type: 'submission' | 'vote' | 'investment' | 'comment' | 'achievement'
  title: string
  description: string
  timestamp: string
  metadata?: {
    athlete_name?: string
    amount?: number
    status?: string
    achievement_type?: string
  }
}

interface ActivityFeedProps {
  userId: string
  limit?: number
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  userId,
  limit = 10
}) => {
  // Mock data - in real app this would come from a hook/API
  const mockActivities: Activity[] = [
    {
      id: '1',
      type: 'investment',
      title: 'Invested in Marcus Johnson',
      description: 'Purchased 25 shares in Basketball player Marcus Johnson',
      timestamp: '2024-01-20T14:30:00Z',
      metadata: {
        athlete_name: 'Marcus Johnson',
        amount: 500
      }
    },
    {
      id: '2',
      type: 'vote',
      title: 'Voted on Sarah Williams',
      description: 'Cast approval vote for Tennis player submission',
      timestamp: '2024-01-20T10:15:00Z',
      metadata: {
        athlete_name: 'Sarah Williams',
        status: 'approved'
      }
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Early Investor Badge Earned!',
      description: 'Recognized for investing in athletes within 24 hours of approval',
      timestamp: '2024-01-19T16:45:00Z',
      metadata: {
        achievement_type: 'early_investor'
      }
    },
    {
      id: '4',
      type: 'submission',
      title: 'Submitted David Chen',
      description: 'New athlete submission for Swimming category',
      timestamp: '2024-01-19T09:20:00Z',
      metadata: {
        athlete_name: 'David Chen',
        status: 'pending'
      }
    },
    {
      id: '5',
      type: 'comment',
      title: 'Commented on Lisa Park',
      description: 'Shared insights on athlete potential and training background',
      timestamp: '2024-01-18T18:30:00Z',
      metadata: {
        athlete_name: 'Lisa Park'
      }
    }
  ]

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'submission':
        return '📝'
      case 'vote':
        return '🗳️'
      case 'investment':
        return '💰'
      case 'comment':
        return '💬'
      case 'achievement':
        return '🏆'
      default:
        return '📍'
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'submission':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'vote':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'investment':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'comment':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'achievement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInHours = Math.floor((now.getTime() - time.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return time.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount)
  }

  return (
    <ScrollReveal>
      <div className="space-y-4">
        {mockActivities.length === 0 ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-3xl mb-3">📈</div>
            <p className="text-gray-600 text-sm">
              No recent activity. Start scouting to see your activity here!
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-3"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {mockActivities.slice(0, limit).map((activity, index) => (
                <motion.div
                  key={activity.id}
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <motion.div
                    className="flex items-start space-x-3 p-3 rounded-lg border-2 border-transparent hover:border-gray-200 hover:bg-gray-50 transition-all duration-200"
                    whileHover={{ x: 2 }}
                  >
                    {/* Activity Icon */}
                    <motion.div
                      className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      {getActivityIcon(activity.type)}
                    </motion.div>

                    {/* Activity Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <motion.h4 
                          className="font-medium text-black text-sm group-hover:text-gray-800 transition-colors"
                          whileHover={{ x: 2 }}
                        >
                          {activity.title}
                        </motion.h4>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            className={`${getActivityColor(activity.type)} text-xs font-bold uppercase tracking-wide border`}
                          >
                            {activity.type}
                          </Badge>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {activity.description}
                      </p>

                      {/* Metadata */}
                      {activity.metadata && (
                        <motion.div
                          className="mt-2 flex items-center space-x-4 text-xs text-gray-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: (index * 0.05) + 0.1 }}
                        >
                          {activity.metadata.athlete_name && (
                            <span>👤 {activity.metadata.athlete_name}</span>
                          )}
                          {activity.metadata.amount && (
                            <span>💷 {formatCurrency(activity.metadata.amount)}</span>
                          )}
                          {activity.metadata.status && (
                            <span 
                              className={`px-2 py-1 rounded-full border ${
                                activity.metadata.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                activity.metadata.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}
                            >
                              {activity.metadata.status}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  {/* Timeline connector */}
                  {index < mockActivities.slice(0, limit).length - 1 && (
                    <motion.div
                      className="ml-4 w-0.5 h-4 bg-gray-200"
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ delay: (index * 0.05) + 0.2, duration: 0.3 }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Show More Button */}
            {mockActivities.length > limit && (
              <motion.div
                className="text-center pt-4"
                variants={staggerItem}
              >
                <motion.button
                  className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200 uppercase tracking-wide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View All Activity →
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </ScrollReveal>
  )
}