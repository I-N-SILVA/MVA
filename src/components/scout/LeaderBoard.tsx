import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { getReputationBadge } from '@/lib/utils'

interface Scout {
  id: string
  username: string
  full_name?: string
  reputation_score: number
  successful_submissions: number
  total_submissions: number
  investment_accuracy: number
  rank: number
  avatar_url?: string
  is_current_user?: boolean
}

interface LeaderBoardProps {
  currentUserId: string
  limit?: number
}

export const LeaderBoard: React.FC<LeaderBoardProps> = ({
  currentUserId,
  limit = 10
}) => {
  // Mock data - in real app this would come from a hook/API
  const mockScouts: Scout[] = [
    {
      id: '1',
      username: 'scout_legend',
      full_name: 'Alex Thompson',
      reputation_score: 98,
      successful_submissions: 45,
      total_submissions: 48,
      investment_accuracy: 92,
      rank: 1,
      is_current_user: false
    },
    {
      id: '2',
      username: 'talent_finder',
      full_name: 'Sarah Johnson',
      reputation_score: 94,
      successful_submissions: 38,
      total_submissions: 42,
      investment_accuracy: 89,
      rank: 2,
      is_current_user: false
    },
    {
      id: '3',
      username: 'sports_oracle',
      full_name: 'Mike Chen',
      reputation_score: 91,
      successful_submissions: 32,
      total_submissions: 36,
      investment_accuracy: 85,
      rank: 3,
      is_current_user: false
    },
    {
      id: currentUserId,
      username: 'current_user',
      full_name: 'You',
      reputation_score: 76,
      successful_submissions: 12,
      total_submissions: 15,
      investment_accuracy: 80,
      rank: 7,
      is_current_user: true
    },
    {
      id: '5',
      username: 'rookie_scout',
      full_name: 'Emma Wilson',
      reputation_score: 68,
      successful_submissions: 8,
      total_submissions: 12,
      investment_accuracy: 75,
      rank: 12,
      is_current_user: false
    }
  ]

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 2:
        return 'bg-gray-100 text-gray-800 border-gray-300'
      case 3:
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  const getApprovalRate = (successful: number, total: number) => {
    return total > 0 ? Math.round((successful / total) * 100) : 0
  }

  return (
    <ScrollReveal>
      <div className="space-y-3">
        {mockScouts.length === 0 ? (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-3xl mb-3">🏆</div>
            <p className="text-gray-600 text-sm">
              No scouts ranked yet. Be the first to build your reputation!
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence>
              {mockScouts.slice(0, limit).map((scout, index) => (
                <motion.div
                  key={scout.id}
                  variants={staggerItem}
                  initial="initial"
                  animate="animate"
                  transition={{ delay: index * 0.05 }}
                  className="group"
                >
                  <motion.div
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all duration-200 ${
                      scout.is_current_user
                        ? 'border-black bg-black text-white shadow-plyaz-sm'
                        : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                    }`}
                    whileHover={{ 
                      scale: scout.is_current_user ? 1.02 : 1.01,
                      x: scout.is_current_user ? 0 : 2
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {/* Rank */}
                    <motion.div
                      className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                        scout.is_current_user
                          ? 'border-white text-white'
                          : `${getRankColor(scout.rank)} border-2`
                      }`}
                      whileHover={{ scale: 1.1, rotate: scout.rank <= 3 ? 10 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      {scout.rank <= 3 ? getRankIcon(scout.rank) : `#${scout.rank}`}
                    </motion.div>

                    {/* Scout Avatar */}
                    <motion.div
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        scout.is_current_user
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                      }`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      {scout.avatar_url ? (
                        <img
                          src={scout.avatar_url}
                          alt={scout.full_name || scout.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (scout.full_name || scout.username)
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()
                      )}
                    </motion.div>

                    {/* Scout Info */}
                    <div className="flex-1 min-w-0">
                      <motion.h4 
                        className={`font-bold text-sm ${
                          scout.is_current_user ? 'text-white' : 'text-black'
                        } group-hover:${scout.is_current_user ? 'text-gray-200' : 'text-gray-800'} transition-colors`}
                        whileHover={{ x: 2 }}
                      >
                        {scout.full_name || scout.username}
                        {scout.is_current_user && (
                          <span className="text-xs opacity-75 ml-2">(You)</span>
                        )}
                      </motion.h4>
                      
                      <div className={`flex items-center space-x-3 text-xs ${
                        scout.is_current_user ? 'text-gray-200' : 'text-gray-600'
                      }`}>
                        <span>
                          {getApprovalRate(scout.successful_submissions, scout.total_submissions)}% approval
                        </span>
                        <span>•</span>
                        <span>
                          {scout.investment_accuracy}% accuracy
                        </span>
                      </div>
                    </div>

                    {/* Reputation Score */}
                    <div className="text-right">
                      <motion.div
                        className={`text-lg font-black ${
                          scout.is_current_user ? 'text-white' : 'text-black'
                        }`}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: (index * 0.05) + 0.2, type: 'spring', stiffness: 400, damping: 30 }}
                      >
                        {scout.reputation_score}
                      </motion.div>
                      
                      <Badge 
                        className={`text-xs font-bold ${
                          scout.is_current_user
                            ? 'bg-white text-black border-white'
                            : getReputationBadge(scout.reputation_score).color
                        }`}
                      >
                        {getReputationBadge(scout.reputation_score).level}
                      </Badge>
                    </div>

                    {/* Trend Arrow */}
                    <motion.div
                      className={`flex-shrink-0 w-6 h-6 flex items-center justify-center ${
                        scout.is_current_user ? 'text-white' : 'text-gray-400'
                      }`}
                      animate={{ 
                        y: [0, -2, 0],
                        opacity: [0.5, 1, 0.5]
                      }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        delay: index * 0.2 
                      }}
                    >
                      {scout.rank <= 3 ? '📈' : '→'}
                    </motion.div>
                  </motion.div>

                  {/* Special highlight for current user */}
                  {scout.is_current_user && (
                    <motion.div
                      className="text-center mt-2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: (index * 0.05) + 0.3 }}
                    >
                      <p className="text-xs text-gray-600">
                        Keep climbing! {scout.rank > 1 ? `${mockScouts.find(s => s.rank === scout.rank - 1)?.reputation_score - scout.reputation_score} points to rank #${scout.rank - 1}` : 'You\'re at the top!'}
                      </p>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* View Full Leaderboard Button */}
            {mockScouts.length > limit && (
              <motion.div
                className="text-center pt-4"
                variants={staggerItem}
              >
                <motion.button
                  className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200 uppercase tracking-wide"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Full Leaderboard →
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </ScrollReveal>
  )
}