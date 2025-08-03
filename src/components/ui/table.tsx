'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cva, type VariantProps } from 'class-variance-authority'
import { 
  ChevronUp, 
  ChevronDown, 
  Search, 
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  Eye,
  MoreVertical
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { staggerContainer, staggerItemFast } from '@/lib/animations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const tableVariants = cva(
  'w-full border-collapse bg-white border-2 border-black rounded-lg overflow-hidden',
  {
    variants: {
      variant: {
        default: 'shadow-plyaz',
        minimal: 'border border-gray-200',
        elevated: 'shadow-plyaz-lg',
      },
      size: {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

// Column definition interface
export interface Column<T = any> {
  key: string
  header: string
  accessor?: keyof T | ((row: T) => any)
  sortable?: boolean
  filterable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
  render?: (value: any, row: T, index: number) => React.ReactNode
}

// Table props interface
export interface TableProps<T = any> extends VariantProps<typeof tableVariants> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  filterable?: boolean
  sortable?: boolean
  pagination?: boolean
  pageSize?: number
  emptyMessage?: string
  className?: string
  onRowClick?: (row: T, index: number) => void
  rowActions?: (row: T, index: number) => React.ReactNode
  stickyHeader?: boolean
}

// Sort state type
type SortState = {
  key: string | null
  direction: 'asc' | 'desc' | null
}

const Table = <T,>({
  data,
  columns,
  loading = false,
  searchable = false,
  filterable = false,
  sortable = true,
  pagination = false,
  pageSize = 10,
  emptyMessage = 'No data available',
  variant,
  size,
  className,
  onRowClick,
  rowActions,
  stickyHeader = false,
  ...props
}: TableProps<T>) => {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [sortState, setSortState] = React.useState<SortState>({ key: null, direction: null })
  const [currentPage, setCurrentPage] = React.useState(1)
  const [filters, setFilters] = React.useState<Record<string, string>>({})

  // Filter data based on search and filters
  const filteredData = React.useMemo(() => {
    let result = [...data]

    // Apply search
    if (searchTerm && searchable) {
      result = result.filter(row =>
        columns.some(column => {
          const value = column.accessor 
            ? typeof column.accessor === 'function'
              ? column.accessor(row)
              : row[column.accessor]
            : row[column.key as keyof T]
          
          return String(value).toLowerCase().includes(searchTerm.toLowerCase())
        })
      )
    }

    // Apply filters
    Object.entries(filters).forEach(([key, filterValue]) => {
      if (filterValue) {
        result = result.filter(row => {
          const column = columns.find(col => col.key === key)
          const value = column?.accessor 
            ? typeof column.accessor === 'function'
              ? column.accessor(row)
              : row[column.accessor]
            : row[key as keyof T]
          
          return String(value).toLowerCase().includes(filterValue.toLowerCase())
        })
      }
    })

    return result
  }, [data, searchTerm, filters, columns, searchable])

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortState.key || !sortState.direction) return filteredData

    return [...filteredData].sort((a, b) => {
      const column = columns.find(col => col.key === sortState.key)
      const aValue = column?.accessor 
        ? typeof column.accessor === 'function'
          ? column.accessor(a)
          : a[column.accessor]
        : a[sortState.key as keyof T]
      
      const bValue = column?.accessor 
        ? typeof column.accessor === 'function'
          ? column.accessor(b)
          : b[column.accessor]
        : b[sortState.key as keyof T]

      if (aValue < bValue) return sortState.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return sortState.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredData, sortState, columns])

  // Paginate data
  const paginatedData = React.useMemo(() => {
    if (!pagination) return sortedData

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return sortedData.slice(start, end)
  }, [sortedData, pagination, currentPage, pageSize])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  // Handle sorting
  const handleSort = (columnKey: string) => {
    if (!sortable) return

    const column = columns.find(col => col.key === columnKey)
    if (!column?.sortable) return

    setSortState(prev => {
      if (prev.key === columnKey) {
        return {
          key: columnKey,
          direction: prev.direction === 'asc' ? 'desc' : prev.direction === 'desc' ? null : 'asc'
        }
      }
      return { key: columnKey, direction: 'asc' }
    })
  }

  // Get cell value
  const getCellValue = (row: T, column: Column<T>) => {
    if (column.accessor) {
      return typeof column.accessor === 'function' ? column.accessor(row) : row[column.accessor]
    }
    return row[column.key as keyof T]
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      {(searchable || filterable) && (
        <div className="flex items-center gap-4 p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
          {searchable && (
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          )}
          
          {filterable && (
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="relative overflow-hidden rounded-lg border-2 border-black">
        <div className="overflow-x-auto">
          <motion.table 
            className={cn(tableVariants({ variant, size, className }))}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            {...props}
          >
            {/* Table Header */}
            <thead className={cn(
              'bg-black text-white',
              stickyHeader && 'sticky top-0 z-10'
            )}>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={cn(
                      'px-6 py-4 text-left font-bold tracking-wide uppercase text-sm',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.sortable && sortable && 'cursor-pointer hover:bg-gray-800 transition-colors'
                    )}
                    style={{ width: column.width }}
                    onClick={() => handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2">
                      <span>{column.header}</span>
                      {column.sortable && sortable && (
                        <div className="flex flex-col">
                          {sortState.key === column.key ? (
                            sortState.direction === 'asc' ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : sortState.direction === 'desc' ? (
                              <ChevronDown className="h-3 w-3" />
                            ) : (
                              <ArrowUpDown className="h-3 w-3 opacity-50" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
                {rowActions && (
                  <th className="px-6 py-4 text-right font-bold tracking-wide uppercase text-sm w-20">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y-2 divide-gray-200">
              <AnimatePresence mode="wait">
                {loading ? (
                  <TableSkeleton columns={columns} rowActions={!!rowActions} />
                ) : paginatedData.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={columns.length + (rowActions ? 1 : 0)} 
                      className="px-6 py-12 text-center text-gray-500 font-medium"
                    >
                      {emptyMessage}
                    </td>
                  </tr>
                ) : (
                  paginatedData.map((row, index) => (
                    <motion.tr
                      key={index}
                      variants={staggerItemFast}
                      className={cn(
                        'hover:bg-gray-50 transition-colors',
                        onRowClick && 'cursor-pointer'
                      )}
                      onClick={() => onRowClick?.(row, index)}
                    >
                      {columns.map((column) => (
                        <td
                          key={column.key}
                          className={cn(
                            'px-6 py-4 text-black font-medium',
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {column.render 
                            ? column.render(getCellValue(row, column), row, index)
                            : String(getCellValue(row, column))
                          }
                        </td>
                      ))}
                      {rowActions && (
                        <td className="px-6 py-4 text-right">
                          {rowActions(row, index)}
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </motion.table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg">
          <div className="text-sm text-gray-600 font-medium">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton loader for table
const TableSkeleton: React.FC<{ columns: Column[]; rowActions: boolean }> = ({ columns, rowActions }) => {
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <tr key={i}>
          {columns.map((column) => (
            <td key={column.key} className="px-6 py-4">
              <div className="animate-pulse bg-gray-200 h-6 rounded"></div>
            </td>
          ))}
          {rowActions && (
            <td className="px-6 py-4">
              <div className="animate-pulse bg-gray-200 h-6 w-8 rounded"></div>
            </td>
          )}
        </tr>
      ))}
    </>
  )
}

// Simple table components for basic usage
const SimpleTable = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & VariantProps<typeof tableVariants>
>(({ className, variant, size, ...props }, ref) => (
  <table
    ref={ref}
    className={cn(tableVariants({ variant, size, className }))}
    {...props}
  />
))
SimpleTable.displayName = 'SimpleTable'

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn('bg-black text-white', className)} {...props} />
))
TableHeader.displayName = 'TableHeader'

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('divide-y-2 divide-gray-200', className)}
    {...props}
  />
))
TableBody.displayName = 'TableBody'

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn('hover:bg-gray-50 transition-colors', className)}
    {...props}
  />
))
TableRow.displayName = 'TableRow'

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'px-6 py-4 text-left font-bold tracking-wide uppercase text-sm',
      className
    )}
    {...props}
  />
))
TableHead.displayName = 'TableHead'

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn('px-6 py-4 text-black font-medium', className)}
    {...props}
  />
))
TableCell.displayName = 'TableCell'

export {
  Table,
  SimpleTable,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
}

export type { Column, TableProps }