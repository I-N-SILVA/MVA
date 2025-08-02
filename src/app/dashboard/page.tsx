'use client'

import { useAuth } from '@/hooks/useAuth'
import { useDashboard } from '@/hooks/useDashboard'
import { useScoutStats } from '@/hooks/useScoutStats'
import { ScoutStats } from '@/components/scout/ScoutStats'
import { ReputationBreakdown } from '@/components/scout/ReputationBreakdown'
import { SubmissionHistory } from '@/components/scout/SubmissionHistory'
import { InvestmentPortfolio } from '@/components/scout/InvestmentPortfolio'
import { ActivityFeed } from '@/components/scout/ActivityFeed'
import { LeaderBoard } from '@/components/scout/LeaderBoard'
import { QuickActions } from '@/components/scout/QuickActions'
import { PerformanceChart } from '@/components/scout/PerformanceChart'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getReputationBadge } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, profile, loading } = useAuth()
  const { dashboardData, loading: dashboardLoading } = useDashboard(user?.id)
  const { stats, loading: statsLoading } = useScoutStats(user?.id)

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Setup Required</h2>
          <p className="text-gray-600 mb-6">Please complete your profile to access the dashboard.</p>
          <Button asChild>
            <Link href="/profile/setup">Complete Profile</Link>
          </Button>
        </div>
      </div>
    )
  }

  const reputationBadge = getReputationBadge(profile.reputation_score)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile.full_name || profile.username}!
              </h1>
              <div className="flex items-center space-x-4 mt-2">
                <Badge className={reputationBadge.color}>
                  {reputationBadge.level}
                </Badge>
                <span className="text-gray-600">
                  {profile.reputation_score} reputation points
                </span>
                {reputationBadge.nextLevel && (
                  <span className="text-sm text-gray-500">
                    {reputationBadge.nextLevel.threshold - profile.reputation_score} points to {reputationBadge.nextLevel.name}
                  </span>
                )}
              </div>
            </div>
            <QuickActions />
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats and Performance */}
          <div className="lg:col-span-2 space-y-8">
            {/* Scout Stats Overview */}
            <ScoutStats 
              stats={stats} 
              loading={statsLoading}
              profile={profile}
            />

            {/* Performance Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Performance Over Time
              </h3>
              <PerformanceChart userId={user.id} />
            </div>

            {/* Submission History */}
            <SubmissionHistory userId={user.id} />

            {/* Investment Portfolio */}
            <InvestmentPortfolio userId={user.id} />
          </div>

          {/* Right Column - Activity and Leaderboard */}
          <div className="space-y-8">
            {/* Reputation Breakdown */}
            <ReputationBreakdown 
              profile={profile}
              stats={stats}
            />

            {/* Activity Feed */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <ActivityFeed userId={user.id} limit={10} />
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Scouts
              </h3>
              <LeaderBoard currentUserId={user.id} limit={10} />
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        {stats?.achievements && stats.achievements.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Achievements
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.achievements.map((achievement, index) => (
                <div 
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200"
                >
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <p className="font-medium text-gray-900">{achievement.title}</p>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {stats && stats.totalSubmissions === 0 && (
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Ready to start scouting?
              </h3>
              <p className="text-gray-600 mb-4">
                Submit your first athlete and begin building your reputation in the community.
              </p>
              <Button asChild>
                <Link href="/submit">Submit Your First Athlete</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}