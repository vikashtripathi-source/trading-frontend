import React from 'react'
import { cn } from '@/lib/utils'

export interface ColumnDef<T> {
  id: keyof T
  header: string
  accessor?: (row: T) => any
  className?: string
  sortable?: boolean
  width?: string
}

export interface PaginationConfig {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export interface SortingConfig {
  column: string
  direction: 'asc' | 'desc'
  onSort: (column: string, direction: 'asc' | 'desc') => void
}

export interface FilteringConfig {
  searchTerm: string
  onSearchChange: (term: string) => void
}

export interface SelectionConfig<T> {
  selectedRows: T[]
  onSelectionChange: (rows: T[]) => void
  getRowId: (row: T) => string
}

export interface TableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  loading?: boolean
  pagination?: PaginationConfig
  sorting?: SortingConfig
  filtering?: FilteringConfig
  selection?: SelectionConfig<T>
  onRowClick?: (row: T) => void
  className?: string
  emptyMessage?: string
}

function Table<T>({
  data,
  columns,
  loading = false,
  pagination,
  sorting,
  filtering,
  selection,
  onRowClick,
  className,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(pagination?.page || 1)
  const [pageSize, setPageSize] = React.useState(pagination?.pageSize || 10)

  const paginatedData = React.useMemo(() => {
    if (!pagination) return data
    const start = (currentPage - 1) * pageSize
    return data.slice(start, start + pageSize)
  }, [data, currentPage, pageSize, pagination])

  const handleSort = (columnId: string) => {
    if (!sorting || !columns.find(col => col.id === columnId)?.sortable) return
    const newDirection = sorting.column === columnId && sorting.direction === 'asc' ? 'desc' : 'asc'
    sorting.onSort(columnId, newDirection)
  }

  const handleRowSelection = (row: T) => {
    if (!selection) return
    const rowId = selection.getRowId(row)
    const isSelected = selection.selectedRows.some(r => selection.getRowId(r) === rowId)
    
    if (isSelected) {
      selection.onSelectionChange(selection.selectedRows.filter(r => selection.getRowId(r) !== rowId))
    } else {
      selection.onSelectionChange([...selection.selectedRows, row])
    }
  }

  const handleSelectAll = () => {
    if (!selection) return
    if (selection.selectedRows.length === paginatedData.length) {
      selection.onSelectionChange([])
    } else {
      selection.onSelectionChange(paginatedData)
    }
  }

  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (column.accessor) {
      return column.accessor(row)
    }
    return row[column.id]
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-12 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {filtering && (
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search..."
            value={filtering.searchTerm}
            onChange={(e) => filtering.onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
          />
        </div>
      )}

      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              {selection && (
                <th className="w-12 px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selection.selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.id)}
                  className={cn(
                    'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                    column.sortable && sorting && 'cursor-pointer hover:text-gray-700 dark:hover:text-gray-300',
                    column.className
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.id))}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {column.sortable && sorting && sorting.column === String(column.id) && (
                      <svg
                        className={cn(
                          'w-4 h-4',
                          sorting.direction === 'desc' ? 'rotate-180' : ''
                        )}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selection ? 1 : 0)}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'table-hover',
                    onRowClick && 'cursor-pointer',
                    selection && selection.selectedRows.some(r => selection.getRowId(r) === selection.getRowId(row)) && 'bg-gray-50 dark:bg-gray-700/50'
                  )}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {selection && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selection.selectedRows.some(r => selection.getRowId(r) === selection.getRowId(row))}
                        onChange={() => handleRowSelection(row)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.id)}
                      className={cn('px-4 py-3 text-sm text-gray-900 dark:text-gray-100', column.className)}
                    >
                      {getCellValue(row, column)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, data.length)} of{' '}
              {data.length} results
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={pageSize}
              onChange={(e) => {
                const newSize = Number(e.target.value)
                setPageSize(newSize)
                pagination.onPageSizeChange(newSize)
              }}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-600"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <div className="flex space-x-1">
              <button
                onClick={() => {
                  setCurrentPage(1)
                  pagination.onPageChange(1)
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                First
              </button>
              <button
                onClick={() => {
                  const newPage = currentPage - 1
                  setCurrentPage(newPage)
                  pagination.onPageChange(newPage)
                }}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const newPage = currentPage + 1
                  setCurrentPage(newPage)
                  pagination.onPageChange(newPage)
                }}
                disabled={currentPage >= Math.ceil(data.length / pageSize)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Next
              </button>
              <button
                onClick={() => {
                  const lastPage = Math.ceil(data.length / pageSize)
                  setCurrentPage(lastPage)
                  pagination.onPageChange(lastPage)
                }}
                disabled={currentPage >= Math.ceil(data.length / pageSize)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { Table }
