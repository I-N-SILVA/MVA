import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { formatCurrency, formatPercentage } from '@/lib/utils'
import Link from 'next/link'

interface Investment {
  id: string
  athlete_name: string
  sport: string
  position?: string
  investment_amount: number
  current_value: number
  shares_owned: number
  total_shares: number
  purchase_date: string
  performance_change: number
  status: 'active' | 'completed' | 'divested'
}

interface InvestmentPortfolioProps {
  userId: string
}

export const InvestmentPortfolio: React.FC<InvestmentPortfolioProps> = ({
  userId
}) => {
  // Mock data - in real app this would come from a hook/API
  const mockInvestments: Investment[] = [
    {
      id: '1',
      athlete_name: 'Marcus Johnson',
      sport: 'Basketball',
      position: 'Point Guard',
      investment_amount: 500,
      current_value: 750,
      shares_owned: 25,
      total_shares: 1000,
      purchase_date: '2024-01-15T10:00:00Z',
      performance_change: 50.0,
      status: 'active'
    },
    {
      id: '2',
      athlete_name: 'Sarah Williams',
      sport: 'Tennis',
      investment_amount: 300,
      current_value: 280,
      shares_owned: 15,
      total_shares: 800,
      purchase_date: '2024-01-18T14:30:00Z',
      performance_change: -6.7,
      status: 'active'
    },
    {
      id: '3',
      athlete_name: 'David Chen',
      sport: 'Swimming',
      position: 'Freestyle',
      investment_amount: 200,
      current_value: 320,
      shares_owned: 10,
      total_shares: 500,
      purchase_date: '2024-01-10T09:15:00Z',
      performance_change: 60.0,
      status: 'active'
    }
  ]

  const totalInvested = mockInvestments.reduce((sum, inv) => sum + inv.investment_amount, 0)
  const totalCurrentValue = mockInvestments.reduce((sum, inv) => sum + inv.current_value, 0)
  const totalReturn = totalCurrentValue - totalInvested
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0

  const getPerformanceColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getPerformanceIcon = (change: number) => {
    if (change > 0) return '↗'
    if (change < 0) return '↘'
    return '→'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <ScrollReveal>
      <Card className="bg-white border-2 border-black shadow-plyaz">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-xl font-black">Investment Portfolio</span>
            <Button variant="outline" size="sm" asChild>
              <Link href="/athletes">Find Athletes</Link>
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {mockInvestments.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-lg font-bold text-black mb-2">
                No investments yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start investing in athletes to build your portfolio.
              </p>
              <Button asChild>
                <Link href="/athletes">Browse Athletes</Link>
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Portfolio Summary */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border-2 border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-2xl font-black text-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {formatCurrency(totalInvested)}
                  </motion.div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Total Invested
                  </p>
                </div>

                <div className="text-center">
                  <motion.div
                    className="text-2xl font-black text-black"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {formatCurrency(totalCurrentValue)}
                  </motion.div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Current Value
                  </p>
                </div>

                <div className="text-center">
                  <motion.div
                    className={`text-2xl font-black ${getPerformanceColor(totalReturn)}`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {formatCurrency(totalReturn)}
                  </motion.div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Total Return
                  </p>
                </div>

                <div className="text-center">
                  <motion.div
                    className={`text-2xl font-black ${getPerformanceColor(totalReturnPercentage)} flex items-center justify-center`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: 'spring', stiffness: 400, damping: 30 }}
                  >
                    {getPerformanceIcon(totalReturnPercentage)}
                    {formatPercentage(Math.abs(totalReturnPercentage))}
                  </motion.div>
                  <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                    Performance
                  </p>
                </div>
              </motion.div>

              {/* Individual Investments */}
              <motion.div
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <h4 className="font-bold text-black uppercase tracking-wide text-sm">
                  Holdings ({mockInvestments.length})
                </h4>

                <AnimatePresence>
                  {mockInvestments.map((investment, index) => (
                    <motion.div
                      key={investment.id}
                      variants={staggerItem}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: index * 0.1 }}
                      className="group"
                    >
                      <Card 
                        variant="outlined" 
                        className="border-gray-200 hover:border-black transition-all duration-200 hover:shadow-plyaz-sm"
                        interactive
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {/* Athlete Avatar/Icon */}
                              <motion.div
                                className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                              >
                                {investment.athlete_name.split(' ').map(n => n[0]).join('')}
                              </motion.div>

                              {/* Investment Info */}
                              <div>
                                <motion.h4 
                                  className="font-bold text-black group-hover:text-gray-800 transition-colors"
                                  whileHover={{ x: 5 }}
                                >
                                  {investment.athlete_name}
                                </motion.h4>
                                <p className="text-sm text-gray-600">
                                  {investment.sport} {investment.position && `• ${investment.position}`}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {investment.shares_owned} of {investment.total_shares} shares ({((investment.shares_owned / investment.total_shares) * 100).toFixed(1)}%)
                                </p>
                              </div>
                            </div>

                            <div className="text-right space-y-1">
                              {/* Current Value */}
                              <div className="text-lg font-black text-black">
                                {formatCurrency(investment.current_value)}
                              </div>
                              
                              {/* Performance */}
                              <div className={`text-sm font-bold flex items-center justify-end ${getPerformanceColor(investment.performance_change)}`}>
                                <span className="mr-1">
                                  {getPerformanceIcon(investment.performance_change)}
                                </span>
                                {formatPercentage(Math.abs(investment.performance_change))}
                              </div>

                              {/* Original Investment */}
                              <div className="text-xs text-gray-500">
                                Invested: {formatCurrency(investment.investment_amount)}
                              </div>

                              {/* Purchase Date */}
                              <div className="text-xs text-gray-500">
                                Since: {formatDate(investment.purchase_date)}
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-200">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/athletes/${investment.id}`}>
                                View Profile
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm">
                              Trade Shares
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* View All Button */}
                {mockInvestments.length >= 3 && (
                  <motion.div
                    className="text-center pt-4"
                    variants={staggerItem}
                  >
                    <Button variant="outline" asChild>
                      <Link href="/portfolio">
                        View Full Portfolio
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </div>
          )}
        </CardContent>
      </Card>
    </ScrollReveal>
  )
}