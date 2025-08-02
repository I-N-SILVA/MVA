'use client'

import { ScoutStatistics } from '@/hooks/useScoutStats'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ScoutStatsProps {
  stats: ScoutStatistics
  reputationLevel: {
    level: string
    color: string
    bgColor: string
  } | null
  nextLevelProgress: {
    progress: number
    nextThreshold: number
    pointsNeeded: number
  } | null
}

export function ScoutStats({ stats, reputationLevel, nextLevelProgress }: ScoutStatsProps) {
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`
  const formatNumber = (value: number) => value.toLocaleString()

  const StatCard = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    trend, 
    color = 'text-gray-900' 
  }: {
    title: string
    value: string | number
    subtitle?: string
    icon?: string
    trend?: 'up' | 'down' | 'stable'
    color?: string
  }) => (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={cn("text-2xl font-bold", color)}>{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center text-sm",
            trend === 'up' ? 'text-green-600' :
            trend === 'down' ? 'text-red-600' : 'text-gray-500'
          )}>
            {trend === 'up' && '↗'}
            {trend === 'down' && '↘'}
            {trend === 'stable' && '→'}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Scout Performance</h2>
          <p className="text-gray-600">Your key metrics and achievements</p>
        </div>
        {reputationLevel && (
          <Badge className={cn("px-3 py-1", reputationLevel.color, reputationLevel.bgColor)}>
            {reputationLevel.level}
          </Badge>
        )}
      </div>

      {/* Reputation Progress */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">Reputation Score</h3>
            <p className="text-3xl font-bold text-blue-600">{formatNumber(stats.reputationScore)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Global Rank</p>
            <p className="text-xl font-semibold text-gray-900">#{formatNumber(stats.globalRank)}</p>
            <p className="text-xs text-gray-500">
              Top {stats.percentileRank.toFixed(1)}%
            </p>
          </div>
        </div>
        
        {nextLevelProgress && nextLevelProgress.pointsNeeded > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
              <span>Progress to next level</span>
              <span>{nextLevelProgress.pointsNeeded} points needed</span>
            </div>
            <Progress 
              value={nextLevelProgress.progress} 
              className="h-2"
            />
          </div>
        )}
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Submissions"
          value={formatNumber(stats.totalSubmissions)}
          subtitle={`${formatNumber(stats.approvedSubmissions)} approved`}
          icon="📝"
          color="text-blue-600"
        />

        <StatCard
          title="Success Rate"
          value={formatPercentage(stats.submissionSuccessRate)}
          subtitle="Approval rate"
          icon="✅"
          color={stats.submissionSuccessRate >= 0.7 ? "text-green-600" : 
                 stats.submissionSuccessRate >= 0.5 ? "text-yellow-600" : "text-red-600"}
        />

        <StatCard
          title="Votes Cast"
          value={formatNumber(stats.totalVotesCast)}
          subtitle={`${formatNumber(stats.successfulVotes)} successful`}
          icon="🗳️"
          color="text-purple-600"
        />

        <StatCard
          title="Voting Accuracy"
          value={formatPercentage(stats.votingAccuracy)}
          subtitle={`Avg confidence: ${stats.averageConfidence.toFixed(1)}`}
          icon="🎯"
          color={stats.votingAccuracy >= 0.8 ? "text-green-600" : 
                 stats.votingAccuracy >= 0.6 ? "text-yellow-600" : "text-red-600"}
        />
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Consistency Score */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Consistency Score</h4>
            <span className="text-lg">📊</span>
          </div>
          <div className="flex items-end space-x-2">
            <span className={cn(
              "text-2xl font-bold",
              stats.consistencyScore >= 0.8 ? "text-green-600" :
              stats.consistencyScore >= 0.6 ? "text-yellow-600" : "text-red-600"
            )}>
              {formatPercentage(stats.consistencyScore)}
            </span>
            <span className="text-sm text-gray-500 mb-1">reliability</span>
          </div>
          <Progress value={stats.consistencyScore * 100} className="h-2 mt-2" />
        </div>

        {/* Vote Success Rate */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">Vote Success Rate</h4>
            <span className="text-lg">⚡</span>
          </div>
          <div className="flex items-end space-x-2">
            <span className={cn(
              "text-2xl font-bold",
              stats.voteSuccessRate >= 0.8 ? "text-green-600" :
              stats.voteSuccessRate >= 0.6 ? "text-yellow-600" : "text-red-600"
            )}>
              {formatPercentage(stats.voteSuccessRate)}
            </span>
            <span className="text-sm text-gray-500 mb-1">accuracy</span>
          </div>
          <Progress value={stats.voteSuccessRate * 100} className="h-2 mt-2" />
        </div>
      </div>

      {/* Recent Achievements Preview */}
      {stats.achievements.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Latest Achievements</h4>
          <div className="flex flex-wrap gap-2">
            {stats.achievements.slice(0, 3).map((achievement) => (
              <div
                key={achievement.id}
                className={cn(
                  "flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium",
                  achievement.rarity === 'legendary' ? 'bg-yellow-100 text-yellow-800' :
                  achievement.rarity === 'epic' ? 'bg-purple-100 text-purple-800' :
                  achievement.rarity === 'rare' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                )}
              >
                <span>{achievement.icon}</span>
                <span>{achievement.title}</span>
              </div>
            ))}
            {stats.achievements.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{stats.achievements.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Sport Expertise Preview */}
      {stats.strongestSports.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Top Sports</h4>
          <div className="space-y-2">
            {stats.strongestSports.slice(0, 3).map((sport) => (
              <div key={sport.sport} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{sport.sport}</span>
                  <Badge variant="secondary" className="text-xs">
                    {sport.totalVotes} votes
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    "text-sm font-medium",
                    sport.accuracy >= 0.8 ? "text-green-600" :
                    sport.accuracy >= 0.6 ? "text-yellow-600" : "text-red-600"
                  )}>
                    {formatPercentage(sport.accuracy)}
                  </span>
                  <div className="w-16 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className={cn(
                        "h-1.5 rounded-full",
                        sport.accuracy >= 0.8 ? "bg-green-500" :
                        sport.accuracy >= 0.6 ? "bg-yellow-500" : "bg-red-500"
                      )}
                      style={{ width: `${sport.accuracy * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}