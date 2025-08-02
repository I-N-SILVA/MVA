'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { SubmissionCard } from '@/components/athlete/SubmissionCard'
import { useSubmissions } from '@/hooks/useSubmissions'
import { useRealtimeVotes } from '@/hooks/useRealtimeVotes'
import { 
  Search,
  Filter,
  SortAsc,
  SortDesc,
  RefreshCw,
  Users,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'most_voted', label: 'Most Voted' },
  { value: 'deadline_approaching', label: 'Deadline Approaching' },
  { value: 'approval_percentage', label: 'Highest Approval' }
]

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' }
]

export default function CommunityVotingPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('pending')
  const [sortBy, setSortBy] = useState<'newest' | 'most_voted' | 'deadline_approaching' | 'approval_percentage'>('newest')
  const [sports, setSports] = useState<string[]>([])
  
  const {
    submissions,
    isLoading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    changePageSize,
    refresh,
    fetchSports,
    hasNextPage,
    hasPreviousPage
  } = useSubmissions({
    status: selectedStatus,
    sortBy,
    search: searchQuery,
    sport: selectedSport
  })

  // Get submission IDs for realtime updates
  const submissionIds = submissions.map(s => s.id)
  const { isConnected } = useRealtimeVotes(submissionIds)

  // Load sports for filter dropdown
  useEffect(() => {
    const loadSports = async () => {
      const availableSports = await fetchSports()
      setSports(availableSports)
    }
    loadSports()
  }, [fetchSports])

  // Update filters when local state changes
  useEffect(() => {
    updateFilters({
      status: selectedStatus || undefined,
      sortBy,
      search: searchQuery || undefined,
      sport: selectedSport || undefined
    })
  }, [selectedStatus, sortBy, searchQuery, selectedSport, updateFilters])

  const getStatusStats = () => {
    const stats = {
      pending: submissions.filter(s => s.submission_status === 'pending').length,
      approved: submissions.filter(s => s.submission_status === 'approved').length,
      rejected: submissions.filter(s => s.submission_status === 'rejected').length,
      under_review: submissions.filter(s => s.submission_status === 'under_review').length
    }
    return stats
  }

  const stats = getStatusStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Community Voting</h1>
              <p className="text-gray-600 mt-1">
                Help validate and approve athlete submissions through community voting
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-gray-600">
                  {isConnected ? 'Live updates' : 'Disconnected'}
                </span>
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

      {/* Stats Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{stats.under_review}</p>
                <p className="text-xs text-gray-500">Under Review</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{stats.approved}</p>
                <p className="text-xs text-gray-500">Approved</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{pagination.totalCount}</p>
                <p className="text-xs text-gray-500">Total Submissions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search athletes by name or sport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Sport Filter */}
            <div className="w-full lg:w-48">
              <Select
                value={selectedSport}
                onValueChange={setSelectedSport}
              >
                <option value="">All Sports</option>
                {sports.map(sport => (
                  <option key={sport} value={sport}>{sport}</option>
                ))}
              </Select>
            </div>
            
            {/* Status Filter */}
            <div className="w-full lg:w-48">
              <Select
                value={selectedStatus}
                onValueChange={setSelectedStatus}
              >
                {STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            
            {/* Sort */}
            <div className="w-full lg:w-52">
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as any)}
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          
          {/* Active Filters */}
          {(selectedSport || selectedStatus || searchQuery) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
              <span className="text-sm text-gray-500">Active filters:</span>
              
              {selectedSport && (
                <Badge 
                  variant="outline" 
                  className="cursor-pointer"
                  onClick={() => setSelectedSport('')}
                >
                  Sport: {selectedSport} ×
                </Badge>
              )}
              
              {selectedStatus && (
                <Badge 
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setSelectedStatus('')}
                >
                  Status: {selectedStatus} ×
                </Badge>
              )}
              
              {searchQuery && (
                <Badge 
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => setSearchQuery('')}
                >
                  Search: {searchQuery} ×
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSport('')
                  setSelectedStatus('pending')
                  setSearchQuery('')
                }}
                className="text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Loading submissions...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="font-medium text-red-800">Error loading submissions</h3>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submissions Grid */}
        {!isLoading && !error && (
          <>
            {submissions.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                <p className="text-gray-500">
                  {searchQuery || selectedSport || selectedStatus 
                    ? 'Try adjusting your filters to see more results.'
                    : 'There are no submissions available at the moment.'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {submissions.map((submission) => (
                    <SubmissionCard
                      key={submission.id}
                      submission={submission}
                      showQuickVoting={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <p className="text-sm text-gray-700">
                        Showing {((pagination.page - 1) * pagination.pageSize) + 1} to{' '}
                        {Math.min(pagination.page * pagination.pageSize, pagination.totalCount)} of{' '}
                        {pagination.totalCount} submissions
                      </p>
                      
                      <Select
                        value={pagination.pageSize.toString()}
                        onValueChange={(value) => changePageSize(parseInt(value))}
                      >
                        <option value="12">12 per page</option>
                        <option value="24">24 per page</option>
                        <option value="48">48 per page</option>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.page - 1)}
                        disabled={!hasPreviousPage}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
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
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}