'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { AthleteCardData } from '@/types/athlete'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Target,
  Star,
  MapPin,
  Calendar,
  Building,
  Award,
  Activity,
  Eye,
  ShoppingCart
} from 'lucide-react'

interface AthleteCardProps {
  athlete: AthleteCardData
  viewMode?: 'grid' | 'list'
  showQuickInvest?: boolean
}

export function AthleteCard({ athlete, viewMode = 'grid', showQuickInvest = true }: AthleteCardProps) {
  const [isQuickInvestOpen, setIsQuickInvestOpen] = useState(false)
  
  // Calculate funding progress
  const fundingProgress = athlete.market_data.funding_goal > 0 
    ? (athlete.total_investments / athlete.market_data.funding_goal) * 100 
    : 0
  
  // Format price change
  const priceChange = athlete.market_data.price_change_24h
  const priceChangePercentage = athlete.market_data.price_change_percentage_24h
  const isPositiveChange = priceChange >= 0
  
  // Career trajectory styling
  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'rising': return 'bg-green-100 text-green-800'
      case 'peak': return 'bg-blue-100 text-blue-800'
      case 'declining': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }
  
  // Investment potential stars
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  // Get athlete avatar (use first media URL or placeholder)
  const avatarUrl = athlete.media_urls?.[0] || '/api/placeholder/avatar'

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <img 
              src={avatarUrl} 
              alt={athlete.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          </div>
          
          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <Link 
                  href={`/athletes/${athlete.id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  {athlete.name}
                </Link>
                
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="font-medium">{athlete.sport}</span>
                  {athlete.position && <span>• {athlete.position}</span>}
                  {athlete.current_team && (
                    <span className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {athlete.current_team}
                    </span>
                  )}
                  {athlete.nationality && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {athlete.nationality}
                    </span>
                  )}
                </div>
              </div>
              
              <Badge className={getTrajectoryColor(athlete.career_trajectory)}>
                {athlete.career_trajectory}
              </Badge>
            </div>
          </div>
          
          {/* Price Info */}
          <div className="flex-shrink-0 text-right">
            <div className="text-xl font-bold text-gray-900">
              ${athlete.current_share_price.toFixed(2)}
            </div>
            <div className={`text-sm font-medium flex items-center justify-end gap-1 ${
              isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveChange ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositiveChange ? '+' : ''}{priceChangePercentage.toFixed(2)}%
            </div>
          </div>
          
          {/* Market Data */}
          <div className="flex-shrink-0 text-right text-sm text-gray-500 min-w-0">
            <div>Market Cap: ${athlete.market_cap.toLocaleString()}</div>
            <div>Investors: {athlete.investor_count}</div>
          </div>
          
          {/* Actions */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/athletes/${athlete.id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
            {showQuickInvest && (
              <Button size="sm">
                <ShoppingCart className="h-4 w-4 mr-1" />
                Invest
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Header with Avatar and Basic Info */}
      <div className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <img 
            src={avatarUrl} 
            alt={athlete.name}
            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <Link 
              href={`/athletes/${athlete.id}`}
              className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors line-clamp-1"
            >
              {athlete.name}
            </Link>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-medium text-gray-600">{athlete.sport}</span>
              {athlete.position && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{athlete.position}</span>
                </>
              )}
            </div>
          </div>
          
          <Badge className={getTrajectoryColor(athlete.career_trajectory)} size="sm">
            {athlete.career_trajectory}
          </Badge>
        </div>
      </div>
      
      {/* Athlete Details */}
      <div className="px-4 py-2 space-y-2">
        {/* Location and Team */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          {athlete.current_team && (
            <span className="flex items-center gap-1">
              <Building className="h-3 w-3" />
              {athlete.current_team}
            </span>
          )}
          {athlete.nationality && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {athlete.nationality}
            </span>
          )}
          {athlete.age && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {athlete.age}y
            </span>
          )}
        </div>
        
        {/* Investment Potential */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">Investment Potential</span>
          <div className="flex items-center gap-1">
            {renderStars(athlete.investment_potential / 2)}
            <span className="text-xs text-gray-500 ml-1">
              {athlete.investment_potential}/10
            </span>
          </div>
        </div>
      </div>
      
      {/* Price and Performance */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-xl font-bold text-gray-900">
              ${athlete.current_share_price.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">per share</div>
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-semibold flex items-center gap-1 ${
              isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveChange ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {isPositiveChange ? '+' : ''}{priceChangePercentage.toFixed(2)}%
            </div>
            <div className="text-xs text-gray-500">24h</div>
          </div>
        </div>
        
        {/* Market Stats */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-gray-500">Market Cap</span>
            <div className="font-medium text-gray-900">
              ${(athlete.market_cap / 1000000).toFixed(1)}M
            </div>
          </div>
          <div>
            <span className="text-gray-500">Volume 24h</span>
            <div className="font-medium text-gray-900">
              ${athlete.market_data.volume_24h.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Funding Progress */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-gray-600">Funding Progress</span>
          <span className="font-medium text-gray-900">
            ${athlete.total_investments.toLocaleString()} / ${athlete.market_data.funding_goal.toLocaleString()}
          </span>
        </div>
        
        <Progress value={Math.min(fundingProgress, 100)} className="h-2 mb-2" />
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{Math.round(fundingProgress)}% funded</span>
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {athlete.investor_count} investors
          </span>
        </div>
      </div>
      
      {/* Recent Achievements */}
      {athlete.achievements && athlete.achievements.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex items-start gap-1">
            <Award className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-gray-600 line-clamp-2">
              {athlete.achievements[0]}
            </span>
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="p-4 pt-2">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <Link href={`/athletes/${athlete.id}`}>
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Link>
          </Button>
          
          {showQuickInvest && (
            <Button size="sm" className="flex-1">
              <ShoppingCart className="h-3 w-3 mr-1" />
              Quick Invest
            </Button>
          )}
        </div>
      </div>
      
      {/* Trending Indicator */}
      {athlete.trending_score > 0.7 && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
          <Activity className="h-3 w-3" />
          Trending
        </div>
      )}
    </div>
  )
}