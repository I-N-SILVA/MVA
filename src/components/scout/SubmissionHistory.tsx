import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal, ScrollRevealStagger } from '@/components/motion/ScrollReveal'
import { staggerContainer, staggerItem } from '@/lib/animations'
import Link from 'next/link'

interface Submission {
  id: string
  athlete_name: string
  sport: string
  status: 'pending' | 'approved' | 'rejected'
  votes_for: number
  votes_against: number
  created_at: string
  voting_deadline: string
}

interface SubmissionHistoryProps {
  userId: string
}

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  userId
}) => {
  // Mock data - in real app this would come from a hook/API
  const mockSubmissions: Submission[] = [
    {
      id: '1',
      athlete_name: 'Marcus Johnson',
      sport: 'Basketball',
      status: 'approved',
      votes_for: 28,
      votes_against: 5,
      created_at: '2024-01-15T10:00:00Z',
      voting_deadline: '2024-01-22T10:00:00Z'
    },
    {
      id: '2',
      athlete_name: 'Sarah Williams',
      sport: 'Tennis',
      status: 'pending',
      votes_for: 12,
      votes_against: 3,
      created_at: '2024-01-18T14:30:00Z',
      voting_deadline: '2024-01-25T14:30:00Z'
    },
    {
      id: '3',
      athlete_name: 'David Chen',
      sport: 'Swimming',
      status: 'rejected',
      votes_for: 8,
      votes_against: 15,
      created_at: '2024-01-10T09:15:00Z',
      voting_deadline: '2024-01-17T09:15:00Z'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✓'
      case 'rejected':
        return '✗'
      case 'pending':
        return '⏱'
      default:
        return '?'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const getApprovalPercentage = (votesFor: number, votesAgainst: number) => {
    const total = votesFor + votesAgainst
    return total > 0 ? Math.round((votesFor / total) * 100) : 0
  }

  return (
    <ScrollReveal>
      <Card className="bg-white border-2 border-black shadow-plyaz">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-black">Submission History</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/submit">+ New Submission</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {mockSubmissions.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-4xl mb-4">🏃‍♂️</div>
              <h3 className="text-lg font-bold text-black mb-2">
                No submissions yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start building your reputation by submitting your first athlete.
              </p>
              <Button asChild>
                <Link href="/submit">Submit an Athlete</Link>
              </Button>
            </motion.div>
          ) : (
            <motion.div
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence>
                {mockSubmissions.map((submission, index) => (
                  <motion.div
                    key={submission.id}
                    variants={staggerItem}
                    initial="initial"
                    animate="animate"
                    transition={{ delay: index * 0.1 }}
                    className="group"
                  >
                    <Card 
                      variant="outlined" 
                      className="border-gray-200 hover:border-black transition-all duration-200 hover:shadow-plyaz-sm"
                      interactive
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Status Icon */}
                            <motion.div
                              className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-bold text-sm ${
                                submission.status === 'approved' ? 'bg-green-100' :
                                submission.status === 'rejected' ? 'bg-red-100' :
                                'bg-yellow-100'
                              }`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            >
                              {getStatusIcon(submission.status)}
                            </motion.div>

                            {/* Submission Info */}
                            <div>
                              <motion.h4 
                                className="font-bold text-black group-hover:text-gray-800 transition-colors"
                                whileHover={{ x: 5 }}
                              >
                                {submission.athlete_name}
                              </motion.h4>
                              <p className="text-sm text-gray-600">
                                {submission.sport} • Submitted {formatDate(submission.created_at)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Voting Stats */}
                            <div className="text-right">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs font-medium text-gray-600">
                                  Approval:
                                </span>
                                <span className="text-sm font-bold text-black">
                                  {getApprovalPercentage(submission.votes_for, submission.votes_against)}%
                                </span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {submission.votes_for} for • {submission.votes_against} against
                              </div>
                            </div>

                            {/* Status Badge */}
                            <Badge 
                              className={`${getStatusColor(submission.status)} font-bold uppercase tracking-wide border-2`}
                            >
                              {submission.status}
                            </Badge>

                            {/* Action Button */}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              asChild
                            >
                              <Link href={`/athletes/submissions/${submission.id}`}>
                                View →
                              </Link>
                            </Button>
                          </div>
                        </div>

                        {/* Progress bar for pending submissions */}
                        {submission.status === 'pending' && (
                          <motion.div
                            className="mt-4 pt-4 border-t border-gray-200"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            transition={{ delay: 0.2 }}
                          >
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                              <span>Voting Progress</span>
                              <span>
                                Ends {formatDate(submission.voting_deadline)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <motion.div
                                className="bg-black h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ 
                                  width: `${Math.min(((submission.votes_for + submission.votes_against) / 25) * 100, 100)}%` 
                                }}
                                transition={{ delay: 0.4, duration: 0.8 }}
                              />
                            </div>
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* View All Button */}
              {mockSubmissions.length >= 3 && (
                <motion.div
                  className="text-center pt-4"
                  variants={staggerItem}
                >
                  <Button variant="outline" asChild>
                    <Link href="/profile/submissions">
                      View All Submissions
                    </Link>
                  </Button>
                </motion.div>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}