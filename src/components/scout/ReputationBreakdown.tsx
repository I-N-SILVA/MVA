import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { getReputationBadge } from '@/lib/utils'
import { staggerItem } from '@/lib/animations'

interface ReputationBreakdownProps {
  profile: {
    reputation_score: number
    full_name?: string
    username?: string
  }
  stats?: {
    successfulSubmissions?: number
    totalSubmissions?: number
    investmentAccuracy?: number
    communityEngagement?: number
    discoveryBonus?: number
  }
}

export const ReputationBreakdown: React.FC<ReputationBreakdownProps> = ({
  profile,
  stats
}) => {
  const reputationBadge = getReputationBadge(profile.reputation_score)
  
  // Mock data if stats not provided
  const mockStats = {
    successfulSubmissions: stats?.successfulSubmissions || 12,
    totalSubmissions: stats?.totalSubmissions || 15,
    investmentAccuracy: stats?.investmentAccuracy || 85,
    communityEngagement: stats?.communityEngagement || 72,
    discoveryBonus: stats?.discoveryBonus || 15
  }

  const approvalRate = mockStats.totalSubmissions > 0 
    ? (mockStats.successfulSubmissions / mockStats.totalSubmissions) * 100 
    : 0

  const breakdown = [
    {
      label: 'Approval Rate',
      value: approvalRate,
      max: 100,
      description: `${mockStats.successfulSubmissions}/${mockStats.totalSubmissions} submissions approved`
    },
    {
      label: 'Investment Accuracy',
      value: mockStats.investmentAccuracy,
      max: 100,
      description: 'Prediction accuracy on athlete performance'
    },
    {
      label: 'Community Engagement',
      value: mockStats.communityEngagement,
      max: 100,
      description: 'Votes, comments, and interactions'
    },
    {
      label: 'Discovery Bonus',
      value: mockStats.discoveryBonus,
      max: 100,
      description: 'Early discovery of successful athletes'
    }
  ]

  return (
    <ScrollReveal>
      <Card className="bg-white border-2 border-black shadow-plyaz">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-black">Reputation</span>
            <Badge className={reputationBadge.color}>
              {reputationBadge.level}
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Overall Score */}
          <motion.div 
            className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
            variants={staggerItem}
            initial="initial"
            animate="animate"
          >
            <motion.div
              className="text-4xl font-black text-black mb-2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
            >
              {profile.reputation_score}
            </motion.div>
            <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total Points
            </p>
            {reputationBadge.nextLevel && (
              <motion.p 
                className="text-xs text-gray-500 mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {reputationBadge.nextLevel.threshold - profile.reputation_score} points to {reputationBadge.nextLevel.name}
              </motion.p>
            )}
          </motion.div>

          {/* Breakdown */}
          <div className="space-y-4">
            <h4 className="font-bold text-black uppercase tracking-wide text-sm">
              Breakdown
            </h4>
            
            {breakdown.map((item, index) => (
              <motion.div
                key={item.label}
                className="space-y-2"
                variants={staggerItem}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-black">
                    {item.label}
                  </span>
                  <span className="text-sm font-bold text-black">
                    {Math.round(item.value)}%
                  </span>
                </div>
                
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: (index * 0.1) + 0.2, duration: 0.5 }}
                >
                  <Progress 
                    value={item.value} 
                    className="h-2 bg-gray-200"
                  />
                </motion.div>
                
                <p className="text-xs text-gray-500">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Tips for Improvement */}
          {profile.reputation_score < 90 && (
            <motion.div
              className="p-4 bg-black text-white rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h5 className="font-bold text-sm uppercase tracking-wide mb-2">
                💡 Improve Your Score
              </h5>
              <ul className="text-xs space-y-1 opacity-90">
                {approvalRate < 80 && (
                  <li>• Submit higher quality athlete profiles</li>
                )}
                {mockStats.communityEngagement < 80 && (
                  <li>• Engage more with community discussions</li>
                )}
                {mockStats.investmentAccuracy < 80 && (
                  <li>• Research athletes more thoroughly before investing</li>
                )}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}