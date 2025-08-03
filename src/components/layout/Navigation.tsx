'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getReputationBadge, cn } from '@/lib/utils'
import { 
  mobileMenuVariants, 
  menuItemVariants, 
  hamburgerVariants, 
  hamburgerMiddleVariants, 
  hamburgerBottomVariants 
} from '@/lib/animations'

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isLoading } = useAuth()

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const isActive = (path: string) => pathname === path

  const navItems = [
    { name: 'Home', href: '/', public: true },
    { name: 'Athletes', href: '/athletes', public: true },
    { name: 'Pending', href: '/athletes/pending', auth: true },
    { name: 'Submit', href: '/submit', auth: true },
    { name: 'Dashboard', href: '/dashboard', auth: true },
  ]

  const filteredNavItems = navItems.filter(item => 
    item.public || (item.auth && user)
  )

  return (
    <nav className="bg-white shadow-plyaz-sm border-b-2 border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center border-2 border-black shadow-plyaz-sm">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <span className="text-xl font-black text-black">Plyaz</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'inline-flex items-center px-1 pt-1 text-sm font-bold border-b-2 transition-colors duration-200',
                    isActive(item.href)
                      ? 'border-black text-black'
                      : 'border-transparent text-gray-600 hover:border-gray-400 hover:text-black'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 w-24 bg-gray-200 rounded"></div>
              </div>
            ) : user ? (
              <>
                {user && (
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-black">
                        {user.full_name || user.email}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="secondary" 
                          className={getReputationBadge(user.reputation_score || 0).color}
                        >
                          {getReputationBadge(user.reputation_score || 0).level}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {user.reputation_score || 0} pts
                        </span>
                      </div>
                    </div>
                    {user.user_metadata?.avatar_url && (
                      <img
                        src={user.user_metadata?.avatar_url}
                        alt={user.full_name || user.email || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                  </div>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex flex-col items-center justify-center p-2 w-10 h-10 rounded-md text-black hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="sr-only">Toggle menu</span>
              
              {/* Animated hamburger lines */}
              <motion.span
                className="block h-0.5 w-6 bg-current mb-1"
                variants={hamburgerVariants}
                animate={isMenuOpen ? 'open' : 'closed'}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="block h-0.5 w-6 bg-current mb-1"
                variants={hamburgerMiddleVariants}
                animate={isMenuOpen ? 'open' : 'closed'}
                transition={{ duration: 0.3 }}
              />
              <motion.span
                className="block h-0.5 w-6 bg-current"
                variants={hamburgerBottomVariants}
                animate={isMenuOpen ? 'open' : 'closed'}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden"
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t-2 border-black shadow-plyaz-sm">
              {filteredNavItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  variants={menuItemVariants}
                  custom={index}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      'block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 border-2',
                      isActive(item.href)
                        ? 'text-white bg-black border-black shadow-plyaz-sm'
                        : 'text-black bg-white border-transparent hover:border-gray-200 hover:bg-gray-50'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <motion.span
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    >
                      {item.name}
                    </motion.span>
                  </Link>
                </motion.div>
              ))}
              
              {/* Mobile User Section */}
              <motion.div 
                className="border-t-2 border-gray-200 pt-4 mt-4"
                variants={menuItemVariants}
              >
                {isLoading ? (
                  <div className="animate-pulse px-3">
                    <div className="h-8 w-32 bg-gray-200 rounded mb-2"></div>
                  </div>
                ) : user ? (
                  <motion.div 
                    className="px-3 space-y-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {user && (
                      <motion.div 
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border-2 border-gray-200"
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      >
                        {user.user_metadata?.avatar_url && (
                          <motion.img
                            src={user.user_metadata?.avatar_url}
                            alt={user.full_name || user.email || 'User'}
                            className="w-12 h-12 rounded-full border-2 border-black"
                            whileHover={{ rotate: 5 }}
                          />
                        )}
                        <div>
                          <p className="text-base font-bold text-black">
                            {user.full_name || user.email}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="secondary" 
                              className={cn('border-black', getReputationBadge(user.reputation_score || 0).color)}
                            >
                              {getReputationBadge(user.reputation_score || 0).level}
                            </Badge>
                            <span className="text-sm font-medium text-gray-600">
                              {user.reputation_score || 0} pts
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleSignOut}
                      className="w-full"
                    >
                      Sign Out
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div 
                    className="px-3 space-y-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Button variant="ghost" size="sm" asChild className="w-full justify-start">
                      <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                        Sign In
                      </Link>
                    </Button>
                    <Button size="sm" asChild className="w-full">
                      <Link href="/auth/signup" onClick={() => setIsMenuOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}