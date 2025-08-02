'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AthleteCard } from '@/components/athlete/AthleteCard'
import { useAthletes } from '@/hooks/useAthletes'
import { useMarketData } from '@/hooks/useMarketData'
import { AthleteSearchFilters, AthleteSortOptions } from '@/types/athlete'
import { 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  BarChart3,
  RefreshCw,
  Grid3X3,
  List,
  SlidersHorizontal
} from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'name:asc', label: 'Name A-Z' },
  { value: 'name:desc', label: 'Name Z-A' },
  { value: 'current_share_price:desc', label: 'Price: High to Low' },
  { value: 'current_share_price:asc', label: 'Price: Low to High' },
  { value: 'market_cap:desc', label: 'Market Cap: High to Low' },
  { value: 'total_investments:desc', label: 'Most Invested' },
  { value: 'created_at:desc', label: 'Recently Added' }
]

const FUNDING_STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'new', label: 'New Listings' },
  { value: 'funding', label: 'Funding Active' },
  { value: 'funded', label: 'Fully Funded' }
]

const CAREER_TRAJECTORY_OPTIONS = [
  { value: '', label: 'All Trajectories' },
  { value: 'rising', label: 'Rising Star' },
  { value: 'peak', label: 'Peak Performance' },
  { value: 'declining', label: 'Declining' }
]

export default function AthletesMarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [fundingStatus, setFundingStatus] = useState('')
  const [careerTrajectory, setCareerTrajectory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState<string>('market_cap:desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Parse sort option
  const [sortField, sortDirection] = sortBy.split(':') as [string, 'asc' | 'desc']
  const sortOptions: AthleteSortOptions = {
    field: sortField as any,
    direction: sortDirection
  }

  // Build filters
  const filters: AthleteSearchFilters = {
    search_query: searchQuery || undefined,
    sport: selectedSport || undefined,
    funding_status: fundingStatus as any || undefined,
    career_trajectory: careerTrajectory as any || undefined,
    price_range: priceRange.min || priceRange.max ? {
      min: parseFloat(priceRange.min) || 0,
      max: parseFloat(priceRange.max) || 999999
    } : undefined
  }

  const {
    athletes,
    isLoading,
    error,
    sports,
    pagination,
    goToPage,
    refresh,
    hasNextPage,
    hasPreviousPage
  } = useAthletes(filters, sortOptions)

  const { marketStats, isLoading: marketLoading } = useMarketData()

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedSport('')
    setFundingStatus('')
    setCareerTrajectory('')
    setPriceRange({ min: '', max: '' })
    setSortBy('market_cap:desc')
  }

  const hasActiveFilters = searchQuery || selectedSport || fundingStatus || careerTrajectory || priceRange.min || priceRange.max

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Athletes Marketplace</h1>
              <p className="text-gray-600 mt-1">
                Discover and invest in the next generation of athletic talent
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={refresh}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Market Stats */}
      {marketStats && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${marketStats.total_market_cap.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Total Market Cap</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{marketStats.total_athletes}</p>
                  <p className="text-xs text-gray-500">Active Athletes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${marketStats.total_volume_24h.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">24h Volume</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${marketStats.average_price_change_24h >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                  {marketStats.average_price_change_24h >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${marketStats.average_price_change_24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {marketStats.average_price_change_24h >= 0 ? '+' : ''}{marketStats.average_price_change_24h.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500">24h Change</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          {/* Main Search and Sort Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search athletes by name, sport, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sort */}
            <div className="w-full lg:w-64">
              <Select value={sortBy} onValueChange={setSortBy}>
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            
            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {[searchQuery, selectedSport, fundingStatus, careerTrajectory, priceRange.min, priceRange.max]
                    .filter(Boolean).length}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sport Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <option value="">All Sports</option>
                    {sports.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </Select>
                </div>
                
                {/* Funding Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Funding Status</label>
                  <Select value={fundingStatus} onValueChange={setFundingStatus}>
                    {FUNDING_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                
                {/* Career Trajectory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Career Stage</label>
                  <Select value={careerTrajectory} onValueChange={setCareerTrajectory}>
                    {CAREER_TRAJECTORY_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
                
                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    />
                    <Input
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              
              {/* Filter Actions */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    
                    {searchQuery && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery('')}>
                        Search: {searchQuery} ×
                      </Badge>
                    )}
                    
                    {selectedSport && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setSelectedSport('')}>
                        Sport: {selectedSport} ×
                      </Badge>
                    )}
                    
                    {fundingStatus && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setFundingStatus('')}>
                        Status: {FUNDING_STATUS_OPTIONS.find(o => o.value === fundingStatus)?.label} ×
                      </Badge>
                    )}
                    
                    {careerTrajectory && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setCareerTrajectory('')}>
                        Stage: {CAREER_TRAJECTORY_OPTIONS.find(o => o.value === careerTrajectory)?.label} ×
                      </Badge>
                    )}
                    
                    {(priceRange.min || priceRange.max) && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setPriceRange({ min: '', max: '' })}>
                        Price: ${priceRange.min || '0'} - ${priceRange.max || '∞'} ×
                      </Badge>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    Clear all filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading athletes...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-1 bg-red-100 rounded">
                <RefreshCw className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-red-800">Error loading athletes</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Athletes Grid */}
        {!isLoading && !error && (
          <>
            {athletes.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No athletes found</h3>
                <p className="text-gray-500">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to see more results.'
                    : 'No athletes are currently available for investment.'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className={`mb-8 ${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                    : 'space-y-4'
                }`}>
                  {athletes.map((athlete) => (
                    <AthleteCard
                      key={athlete.id}
                      athlete={athlete}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                        {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                        {pagination.totalCount} athletes
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(pagination.page - 1)}
                          disabled={!hasPreviousPage}
                        >
                          Previous
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            const pageNumber = Math.max(1, pagination.page - 2) + i
                            if (pageNumber > pagination.totalPages) return null
                            
                            return (
                              <Button
                                key={pageNumber}
                                variant={pageNumber === pagination.page ? "default" : "outline"}
                                size="sm"
                                onClick={() => goToPage(pageNumber)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNumber}
                              </Button>
                            )
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(pagination.page + 1)}
                          disabled={!hasNextPage}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}