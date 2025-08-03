'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AthleteCard } from '@/components/athlete/AthleteCard'
import { AthleteCardSkeleton } from '@/components/ui/skeleton'
import { ErrorDisplay } from '@/components/error/ErrorBoundary'
import { PullToRefreshWrapper } from '@/components/ui/pull-to-refresh'
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

  // Keyboard navigation for athletes grid
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Global keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'k':
          event.preventDefault()
          // Focus search input
          document.getElementById('athlete-search')?.focus()
          break
        case 'f':
          event.preventDefault()
          // Toggle filters
          setShowFilters(!showFilters)
          break
      }
    }

    // Escape to clear search or close filters
    if (event.key === 'Escape') {
      if (showFilters) {
        setShowFilters(false)
      } else if (searchQuery) {
        setSearchQuery('')
        document.getElementById('athlete-search')?.focus()
      }
    }
  }, [showFilters, searchQuery])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <PullToRefreshWrapper 
      onRefresh={refresh}
      disabled={isLoading}
      className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200"
    >
      {/* Header */}
      <div className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Athletes Marketplace</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Discover and invest in the next generation of athletic talent
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 transition-colors duration-200">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className="min-w-[44px] min-h-[44px] p-2"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className="min-w-[44px] min-h-[44px] p-2"
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
        <div className="bg-white dark:bg-black border-b-2 border-black dark:border-white transition-colors duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-black dark:bg-white rounded-lg">
                  <DollarSign className="h-5 w-5 text-white dark:text-black" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black dark:text-white">
                    ${marketStats.total_market_cap.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Market Cap</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-800 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">{marketStats.total_athletes}</p>
                  <p className="text-xs text-gray-500">Active Athletes</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-700 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-black">
                    ${marketStats.total_volume_24h.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">24h Volume</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${marketStats.average_price_change_24h >= 0 ? 'bg-black' : 'bg-gray-600'}`}>
                  {marketStats.average_price_change_24h >= 0 ? (
                    <TrendingUp className="h-5 w-5 text-white" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-white" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${marketStats.average_price_change_24h >= 0 ? 'text-black' : 'text-gray-600'}`}>
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
        <div className="bg-white dark:bg-black rounded-lg border-2 border-black dark:border-white p-4 mb-6 shadow-plyaz-sm transition-colors duration-200">
          {/* Main Search and Sort Row */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="athlete-search"
                placeholder="Search athletes by name, sport, or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search athletes"
              />
            </div>
            
            {/* Sort */}
            <div className="w-full lg:w-64">
              <Select 
                id="athlete-sort"
                value={sortBy} 
                onValueChange={setSortBy}
                options={SORT_OPTIONS}
                placeholder="Sort by..."
                aria-label="Sort athletes"
              />
            </div>
            
            {/* Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:w-auto"
              aria-expanded={showFilters}
              aria-controls="advanced-filters"
              aria-label={`${showFilters ? 'Hide' : 'Show'} advanced filters`}
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
            <div id="advanced-filters" className="border-t border-gray-200 pt-4" role="region" aria-label="Advanced filters">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Sport Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
                  <Select 
                    id="sport-filter"
                    value={selectedSport} 
                    onValueChange={setSelectedSport}
                    options={[
                      { value: "", label: "All Sports" },
                      ...sports.map(sport => ({ value: sport, label: sport }))
                    ]}
                    placeholder="Select sport..."
                    aria-label="Filter by sport"
                  />
                </div>
                
                {/* Funding Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Funding Status</label>
                  <Select 
                    id="funding-status-filter"
                    value={fundingStatus} 
                    onValueChange={setFundingStatus}
                    options={FUNDING_STATUS_OPTIONS}
                    placeholder="Select status..."
                    aria-label="Filter by funding status"
                  />
                </div>
                
                {/* Career Trajectory */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Career Stage</label>
                  <Select 
                    id="career-stage-filter"
                    value={careerTrajectory} 
                    onValueChange={setCareerTrajectory}
                    options={CAREER_TRAJECTORY_OPTIONS}
                    placeholder="Select stage..."
                    aria-label="Filter by career stage"
                  />
                </div>
                
                {/* Price Range */}
                <div>
                  <fieldset>
                    <legend className="block text-sm font-medium text-gray-700 mb-2">Price Range ($)</legend>
                    <div className="flex gap-2">
                      <Input
                        id="price-min"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        aria-label="Minimum price"
                        type="number"
                      />
                      <Input
                        id="price-max"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        aria-label="Maximum price"
                        type="number"
                      />
                    </div>
                  </fieldset>
                </div>
              </div>
              
              {/* Filter Actions */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">Active filters:</span>
                    
                    {searchQuery && (
                      <Badge variant="outline" className="cursor-pointer min-h-[44px] px-3 py-2 text-sm" onClick={() => setSearchQuery('')} role="button" tabIndex={0}>
                        Search: {searchQuery} ×
                      </Badge>
                    )}
                    
                    {selectedSport && (
                      <Badge variant="outline" className="cursor-pointer min-h-[44px] px-3 py-2 text-sm" onClick={() => setSelectedSport('')} role="button" tabIndex={0}>
                        Sport: {selectedSport} ×
                      </Badge>
                    )}
                    
                    {fundingStatus && (
                      <Badge variant="outline" className="cursor-pointer min-h-[44px] px-3 py-2 text-sm" onClick={() => setFundingStatus('')} role="button" tabIndex={0}>
                        Status: {FUNDING_STATUS_OPTIONS.find(o => o.value === fundingStatus)?.label} ×
                      </Badge>
                    )}
                    
                    {careerTrajectory && (
                      <Badge variant="outline" className="cursor-pointer min-h-[44px] px-3 py-2 text-sm" onClick={() => setCareerTrajectory('')} role="button" tabIndex={0}>
                        Stage: {CAREER_TRAJECTORY_OPTIONS.find(o => o.value === careerTrajectory)?.label} ×
                      </Badge>
                    )}
                    
                    {(priceRange.min || priceRange.max) && (
                      <Badge variant="outline" className="cursor-pointer min-h-[44px] px-3 py-2 text-sm" onClick={() => setPriceRange({ min: '', max: '' })} role="button" tabIndex={0}>
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
          <div className={`mb-8 ${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }`}>
            {Array.from({ length: 8 }, (_, i) => (
              <AthleteCardSkeleton key={i} viewMode={viewMode} />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <ErrorDisplay
            error={error}
            onRetry={refresh}
            onClear={clearFilters}
            className="mb-6"
          />
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
                  <nav className="bg-white rounded-lg border border-gray-200 p-4" aria-label="Athletes pagination">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-700" id="pagination-info">
                        Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                        {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                        {pagination.totalCount} athletes
                      </p>
                      
                      <div className="flex items-center gap-2" role="group" aria-labelledby="pagination-info">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(pagination.page - 1)}
                          disabled={!hasPreviousPage}
                          aria-label="Go to previous page"
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
                                className="w-11 h-11 p-0 min-w-[44px] min-h-[44px]" // Increased from w-8 h-8 to meet touch targets
                                aria-label={`Go to page ${pageNumber}`}
                                aria-current={pageNumber === pagination.page ? 'page' : undefined}
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
                          aria-label="Go to next page"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </nav>
                )}
              </>
            )}
          </>
        )}
      </div>
    </PullToRefreshWrapper>
  )
}