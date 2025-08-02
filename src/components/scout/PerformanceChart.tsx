import * as React from 'react'
import { motion } from 'framer-motion'
import { ScrollReveal } from '@/components/motion/ScrollReveal'

interface PerformanceChartProps {
  userId: string
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  userId
}) => {
  // Mock data points for the chart visualization
  const mockDataPoints = [
    { month: 'Jan', score: 45 },
    { month: 'Feb', score: 52 },
    { month: 'Mar', score: 48 },
    { month: 'Apr', score: 61 },
    { month: 'May', score: 68 },
    { month: 'Jun', score: 76 },
  ]

  const maxScore = Math.max(...mockDataPoints.map(d => d.score))

  return (
    <ScrollReveal>
      <div className="h-64 flex items-end justify-center space-x-4 p-4">
        {mockDataPoints.map((point, index) => (
          <motion.div
            key={point.month}
            className="flex flex-col items-center space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {/* Bar */}
            <motion.div
              className="w-8 bg-black rounded-t-sm relative"
              style={{ 
                height: `${(point.score / maxScore) * 150}px`,
                minHeight: '20px'
              }}
              initial={{ height: 0 }}
              animate={{ 
                height: `${(point.score / maxScore) * 150}px`
              }}
              transition={{ 
                delay: (index * 0.1) + 0.2, 
                duration: 0.5,
                type: 'spring',
                stiffness: 100
              }}
            >
              {/* Score label */}
              <motion.div
                className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-black"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: (index * 0.1) + 0.7 }}
              >
                {point.score}
              </motion.div>
            </motion.div>
            
            {/* Month label */}
            <motion.span
              className="text-xs font-medium text-gray-600 uppercase tracking-wide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: (index * 0.1) + 0.5 }}
            >
              {point.month}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Chart description */}
      <motion.div
        className="text-center mt-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm text-gray-600">
          Reputation score progression over the last 6 months
        </p>
        <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-gray-500">
          <span>📈 +{mockDataPoints[mockDataPoints.length - 1].score - mockDataPoints[0].score} points total growth</span>
          <span>•</span>
          <span>🎯 Average: {Math.round(mockDataPoints.reduce((sum, p) => sum + p.score, 0) / mockDataPoints.length)}</span>
        </div>
      </motion.div>
    </ScrollReveal>
  )
}