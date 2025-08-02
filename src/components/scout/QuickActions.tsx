import * as React from 'react'
import { motion } from 'framer-motion'
import { Button, Badge } from '@/components/ui'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { staggerContainer, staggerItem } from '@/lib/animations'
import Link from 'next/link'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  href: string
  variant: 'primary' | 'secondary' | 'outline'
  badge?: {
    text: string
    color: string
  }
}

export const QuickActions: React.FC = () => {
  const quickActions: QuickAction[] = [
    {
      id: 'submit',
      title: 'Submit Athlete',
      description: 'Discover new talent',
      icon: '🔍',
      href: '/submit',
      variant: 'primary',
      badge: {
        text: '+25 pts',
        color: 'bg-green-100 text-green-800 border-green-200'
      }
    },
    {
      id: 'browse',
      title: 'Browse Athletes',
      description: 'Find investment opportunities',
      icon: '👥',
      href: '/athletes',
      variant: 'outline'
    },
    {
      id: 'pending',
      title: 'Review Submissions',
      description: 'Vote on pending athletes',
      icon: '🗳️',
      href: '/athletes/pending',
      variant: 'secondary',
      badge: {
        text: '5 new',
        color: 'bg-blue-100 text-blue-800 border-blue-200'
      }
    }
  ]

  return (
    <ScrollReveal>
      <motion.div
        className="flex flex-wrap gap-3"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {quickActions.map((action, index) => (
          <motion.div
            key={action.id}
            variants={staggerItem}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <MagneticButton
              variant={action.variant}
              size="lg"
              strength={0.2}
              range={80}
              asChild
            >
              <Link href={action.href}>
                <div className="flex items-center space-x-3">
                  {/* Icon */}
                  <motion.span
                    className="text-xl"  
                    animate={{ 
                      rotate: [0, 5, -5, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity, 
                      delay: index * 0.3 
                    }}
                  >
                    {action.icon}
                  </motion.span>
                  
                  {/* Content */}
                  <div className="text-left">
                    <div className="font-bold text-sm uppercase tracking-wide">
                      {action.title}
                    </div>
                    <div className="text-xs opacity-75 normal-case tracking-normal">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </MagneticButton>

            {/* Badge */}
            {action.badge && (
              <motion.div
                className="absolute -top-2 -right-2"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  delay: (index * 0.1) + 0.3, 
                  type: 'spring', 
                  stiffness: 400, 
                  damping: 30 
                }}
              >
                <Badge 
                  className={`${action.badge.color} text-xs font-bold border-2 shadow-sm`}
                >
                  {action.badge.text}
                </Badge>
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>
    </ScrollReveal>
  )
}