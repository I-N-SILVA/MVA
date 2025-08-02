'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MagneticButton } from '@/components/motion/MagneticButton'
import { TypewriterText } from '@/components/motion/TypewriterText'
import { ScrollReveal } from '@/components/motion/ScrollReveal'
import { useAuth } from '@/hooks/useAuth'
import { 
  pageVariants, 
  staggerContainer, 
  staggerItem 
} from '@/lib/animations'
import {
  Search,
  Vote,
  TrendingUp,
  BarChart3,
  Users,
  Award,
  ChevronDown,
  ArrowRight
} from 'lucide-react'

export default function HomePage() {
  const { user, isLoading } = useAuth()

  const features = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Discover Athletes",
      description: "Scout and submit promising talent from around the world. Build your reputation as a top scout.",
      color: "text-blue-600"
    },
    {
      icon: <Vote className="w-8 h-8" />,
      title: "Community Validation", 
      description: "Vote on athlete submissions and help validate the next generation of sports stars.",
      color: "text-purple-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Invest & Earn",
      description: "Back athletes early and earn returns as they progress in their careers and market value grows.",
      color: "text-green-600"
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Track Performance",
      description: "Monitor your athlete portfolio performance and watch your investments grow over time.",
      color: "text-orange-600"
    }
  ]

  const steps = [
    {
      step: "01",
      title: "Create Account",
      description: "Sign up as a Scout or Fan and join our community of sports enthusiasts."
    },
    {
      step: "02", 
      title: "Scout or Vote",
      description: "Discover athletes and submit them, or vote on existing submissions to validate talent."
    },
    {
      step: "03",
      title: "Invest in Athletes",
      description: "Back the athletes you believe in and purchase shares in their future success."
    },
    {
      step: "04",
      title: "Earn Returns",
      description: "Watch your portfolio grow as athletes progress and their market value increases."
    }
  ]

  const stats = [
    { value: "10K+", label: "Active Scouts" },
    { value: "2.5K", label: "Athletes" },
    { value: "$1.2M", label: "Total Invested" },
    { value: "89%", label: "Success Rate" }
  ]

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="in"
      exit="out"
      className="min-h-screen bg-white"
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="text-center"
          >
            {/* Main Headline */}
            <motion.div variants={staggerItem} className="mb-8">
              <TypewriterText
                text="Turn Every Fan Into a Scout"
                className="text-6xl md:text-8xl font-bold text-black mb-6"
                delay={500}
              />
              <motion.p 
                variants={staggerItem}
                className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-8"
              >
                Discover, validate, and invest in the next generation of athletic talent through community-driven scouting.
              </motion.p>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              variants={staggerItem}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            >
              {!isLoading && (
                <>
                  {user ? (
                    <MagneticButton>
                      <Link href="/dashboard">
                        <Button size="lg" className="text-lg px-8 py-4 shadow-plyaz-lg">
                          Go to Dashboard
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </MagneticButton>
                  ) : (
                    <>
                      <MagneticButton>
                        <Link href="/auth/signup">
                          <Button size="lg" className="text-lg px-8 py-4 shadow-plyaz-lg">
                            Start Scouting
                            <ArrowRight className="ml-2 w-5 h-5" />
                          </Button>
                        </Link>
                      </MagneticButton>
                      <MagneticButton>
                        <Link href="/auth/login">
                          <Button variant="outline" size="lg" className="text-lg px-8 py-4 shadow-plyaz">
                            Sign In
                          </Button>
                        </Link>
                      </MagneticButton>
                    </>
                  )}
                </>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={staggerItem}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto mb-16"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  variants={staggerItem}
                  className="text-center"
                >
                  <div className="text-3xl md:text-4xl font-bold text-black mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              variants={staggerItem}
              className="flex flex-col items-center"
            >
              <p className="text-gray-500 mb-4">Discover more</p>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <ChevronDown className="w-6 h-6 text-gray-400" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <ScrollReveal>
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={staggerItem}
                className="text-4xl md:text-5xl font-bold text-black mb-6"
              >
                Why Choose Plyaz?
              </motion.h2>
              <motion.p 
                variants={staggerItem}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                Our platform revolutionizes sports scouting by combining community expertise with investment opportunities.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {features.map((feature, index) => (
                <motion.div key={feature.title} variants={staggerItem}>
                  <Card variant="interactive" className="p-8 h-full">
                    <div className={`${feature.color} mb-6`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-black mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* How It Works Section */}
      <ScrollReveal>
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2 
                variants={staggerItem}
                className="text-4xl md:text-5xl font-bold text-black mb-6"
              >
                How It Works
              </motion.h2>
              <motion.p 
                variants={staggerItem}
                className="text-xl text-gray-600 max-w-3xl mx-auto"
              >
                From discovery to investment, here's your journey to becoming a successful sports scout and investor.
              </motion.p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {steps.map((step, index) => (
                <motion.div 
                  key={step.step} 
                  variants={staggerItem}
                  className="text-center"
                >
                  <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-6 shadow-plyaz">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold text-black mb-4">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </ScrollReveal>

      {/* Final CTA Section */}
      <ScrollReveal>
        <section className="py-20 bg-black text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.h2 
                variants={staggerItem}
                className="text-4xl md:text-5xl font-bold mb-6"
              >
                Ready to Start Scouting?
              </motion.h2>
              <motion.p 
                variants={staggerItem}
                className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
              >
                Join thousands of scouts and fans who are already discovering and investing in the next generation of athletic talent.
              </motion.p>
              <motion.div 
                variants={staggerItem}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {!isLoading && !user && (
                  <>
                    <MagneticButton>
                      <Link href="/auth/signup">
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="text-lg px-8 py-4 bg-white text-black hover:bg-gray-100 border-white"
                        >
                          Create Account
                          <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                      </Link>
                    </MagneticButton>
                    <MagneticButton>
                      <Link href="/athletes">
                        <Button 
                          variant="ghost" 
                          size="lg" 
                          className="text-lg px-8 py-4 text-white hover:bg-white/10 border border-white/20"
                        >
                          Browse Athletes
                        </Button>
                      </Link>
                    </MagneticButton>
                  </>
                )}
              </motion.div>
            </motion.div>
          </div>
        </section>
      </ScrollReveal>
    </motion.div>
  )
}