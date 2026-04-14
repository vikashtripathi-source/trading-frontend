import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        success: 'bg-success-100 text-success-800 border border-success-200',
        warning: 'bg-warning-100 text-warning-800 border border-warning-200',
        danger: 'bg-danger-100 text-danger-800 border border-danger-200',
        info: 'bg-info-100 text-info-800 border border-info-200',
        neutral: 'bg-gray-100 text-gray-800 border border-gray-200',
        primary: 'bg-primary-100 text-primary-800 border border-primary-200',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
    },
    defaultVariants: {
      variant: 'neutral',
      size: 'md',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

// Specialized badges for trading
export const StatusBadge = ({ status }: { status: string }) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'filled':
      case 'active':
        return 'success'
      case 'pending':
      case 'processing':
        return 'warning'
      case 'cancelled':
      case 'rejected':
      case 'failed':
        return 'danger'
      default:
        return 'neutral'
    }
  }

  return (
    <Badge variant={getStatusVariant(status)} size="sm">
      {status}
    </Badge>
  )
}

export const PriceChangeBadge = ({ change }: { change: number }) => {
  const isPositive = change >= 0
  return (
    <Badge
      variant={isPositive ? 'success' : 'danger'}
      size="sm"
      className={cn(
        'font-mono',
        isPositive ? 'profit-text' : 'loss-text'
      )}
    >
      {change >= 0 ? '+' : ''}{change.toFixed(2)}%
    </Badge>
  )
}

export { Badge, badgeVariants }
