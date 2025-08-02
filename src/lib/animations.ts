// Plyaz Design System - Animation Library
// Premium motion system for monochrome minimalism

import { Variants, Transition } from 'framer-motion';

// Common animation configurations
export const springConfig: Transition = {
  type: 'spring',
  stiffness: 300,
  damping: 30,
};

export const bounceConfig: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const smoothConfig: Transition = {
  duration: 0.3,
  ease: [0.25, 0.46, 0.45, 0.94],
};

// Page Transitions
export const pageVariants: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    filter: 'blur(4px)'
  },
  animate: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      ...springConfig,
      staggerChildren: 0.1,
      delayChildren: 0.1,
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    filter: 'blur(4px)',
    transition: { 
      duration: 0.2,
      ease: 'easeInOut'
    }
  }
};

// Stagger Animations
export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

export const staggerItem: Variants = {
  initial: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  animate: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: springConfig
  }
};

export const staggerItemFast: Variants = {
  initial: { 
    opacity: 0, 
    y: 10
  },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  }
};

// Hover Effects
export const scaleHover = {
  whileHover: { 
    scale: 1.02,
    transition: bounceConfig
  },
  whileTap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  }
};

export const scaleHoverBig = {
  whileHover: { 
    scale: 1.05,
    transition: bounceConfig
  },
  whileTap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const liftHover = {
  whileHover: { 
    y: -8, 
    boxShadow: '12px 12px 0px 0px #000000',
    transition: springConfig
  },
  whileTap: {
    y: 0,
    boxShadow: '4px 4px 0px 0px #000000',
    transition: { duration: 0.1 }
  }
};

export const magneticHover = {
  whileHover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
};

// Button Animations
export const buttonVariants: Variants = {
  idle: {
    scale: 1,
    boxShadow: '4px 4px 0px 0px #000000'
  },
  hover: {
    scale: 1.02,
    boxShadow: '8px 8px 0px 0px #000000',
    transition: bounceConfig
  },
  tap: {
    scale: 0.98,
    boxShadow: '2px 2px 0px 0px #000000',
    transition: { duration: 0.1 }
  }
};

export const magneticButtonVariants: Variants = {
  hover: {
    scale: 1.05,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

// Loading States
export const pulseVariants: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};

export const bounceVariants: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Card Animations
export const cardVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
    rotateX: 10
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      ...springConfig,
      delay: 0.1
    }
  },
  hover: {
    y: -8,
    scale: 1.02,
    boxShadow: '12px 12px 0px 0px #000000',
    transition: springConfig
  }
};

export const card3DVariants: Variants = {
  initial: {
    opacity: 0,
    rotateX: 20,
    rotateY: 20,
    z: -100
  },
  animate: {
    opacity: 1,
    rotateX: 0,
    rotateY: 0,
    z: 0,
    transition: {
      ...springConfig,
      duration: 0.6
    }
  },
  hover: {
    rotateX: 5,
    rotateY: 5,
    z: 50
  }
};

// Form Animations
export const inputVariants: Variants = {
  focus: {
    scale: 1.01,
    boxShadow: '4px 4px 0px 0px #000000',
    transition: springConfig
  },
  blur: {
    scale: 1,
    boxShadow: '0px 0px 0px 0px #000000',
    transition: smoothConfig
  }
};

export const labelFloatVariants: Variants = {
  initial: {
    y: 0,
    scale: 1,
    color: '#737373'
  },
  float: {
    y: -20,
    scale: 0.85,
    color: '#000000',
    transition: smoothConfig
  }
};

// Navigation Animations
export const mobileMenuVariants: Variants = {
  closed: {
    opacity: 0,
    height: 0,
    transition: {
      duration: 0.3,
      when: 'afterChildren',
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  },
  open: {
    opacity: 1,
    height: 'auto',
    transition: {
      duration: 0.3,
      when: 'beforeChildren',
      staggerChildren: 0.05
    }
  }
};

export const menuItemVariants: Variants = {
  closed: { 
    opacity: 0, 
    x: -20 
  },
  open: { 
    opacity: 1, 
    x: 0,
    transition: smoothConfig
  }
};

export const hamburgerVariants: Variants = {
  closed: {
    rotate: 0,
    y: 0
  },
  open: {
    rotate: 45,
    y: 6
  }
};

export const hamburgerMiddleVariants: Variants = {
  closed: {
    opacity: 1
  },
  open: {
    opacity: 0
  }
};

export const hamburgerBottomVariants: Variants = {
  closed: {
    rotate: 0,
    y: 0
  },
  open: {
    rotate: -45,
    y: -6
  }
};

// Notification Animations
export const slideInFromTop: Variants = {
  initial: { 
    y: -100, 
    opacity: 0,
    scale: 0.8
  },
  animate: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: bounceConfig
  },
  exit: { 
    y: -100, 
    opacity: 0,
    scale: 0.8,
    transition: smoothConfig
  }
};

export const slideInFromRight: Variants = {
  initial: { 
    x: 300, 
    opacity: 0,
    scale: 0.8
  },
  animate: { 
    x: 0, 
    opacity: 1,
    scale: 1,
    transition: bounceConfig
  },
  exit: { 
    x: 300, 
    opacity: 0,
    scale: 0.8,
    transition: smoothConfig
  }
};

export const slideInFromBottom: Variants = {
  initial: { 
    y: 100, 
    opacity: 0,
    scale: 0.8
  },
  animate: { 
    y: 0, 
    opacity: 1,
    scale: 1,
    transition: bounceConfig
  },
  exit: { 
    y: 100, 
    opacity: 0,
    scale: 0.8,
    transition: smoothConfig
  }
};

// Special Effects
export const morphVariants: Variants = {
  initial: { borderRadius: '0%' },
  animate: { 
    borderRadius: ['0%', '50%', '0%'],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const glowVariants: Variants = {
  animate: {
    boxShadow: [
      '0 0 0px rgba(0,0,0,0.1)',
      '0 0 20px rgba(0,0,0,0.3)',
      '0 0 0px rgba(0,0,0,0.1)'
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Text Animations
export const typewriterVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
};

export const letterVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10,
    scale: 0.8
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  }
};

// Scroll Animations
export const scrollRevealVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 50,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springConfig,
      duration: 0.6
    }
  }
};

export const parallaxVariants = {
  offscreen: {
    y: 100,
    opacity: 0
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      bounce: 0.4,
      duration: 0.8
    }
  }
};

// Modal/Overlay Animations
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...bounceConfig,
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
};

export const overlayVariants: Variants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};

// Success/Error State Animations
export const successVariants: Variants = {
  initial: {
    scale: 0,
    rotate: -180
  },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20,
      delay: 0.2
    }
  }
};

export const errorShakeVariants: Variants = {
  shake: {
    x: [-10, 10, -10, 10, 0],
    transition: {
      duration: 0.5
    }
  }
};

// Progress Animations
export const progressVariants: Variants = {
  initial: {
    width: '0%'
  },
  animate: {
    width: '100%',
    transition: {
      duration: 1,
      ease: 'easeInOut'
    }
  }
};

// Export grouped animations
export const animations = {
  page: pageVariants,
  stagger: {
    container: staggerContainer,
    item: staggerItem,
    itemFast: staggerItemFast
  },
  hover: {
    scale: scaleHover,
    scaleBig: scaleHoverBig,
    lift: liftHover,
    magnetic: magneticHover
  },
  button: {
    variants: buttonVariants,
    magnetic: magneticButtonVariants
  },
  loading: {
    pulse: pulseVariants,
    spin: spinVariants,
    bounce: bounceVariants
  },
  card: {
    variants: cardVariants,
    variants3D: card3DVariants
  },
  form: {
    input: inputVariants,
    labelFloat: labelFloatVariants
  },
  navigation: {
    mobileMenu: mobileMenuVariants,
    menuItem: menuItemVariants,
    hamburger: {
      top: hamburgerVariants,
      middle: hamburgerMiddleVariants,
      bottom: hamburgerBottomVariants
    }
  },
  notification: {
    slideInTop: slideInFromTop,
    slideInRight: slideInFromRight,
    slideInBottom: slideInFromBottom
  },
  special: {
    morph: morphVariants,
    glow: glowVariants
  },
  text: {
    typewriter: typewriterVariants,
    letter: letterVariants
  },
  scroll: {
    reveal: scrollRevealVariants,
    parallax: parallaxVariants
  },
  modal: {
    modal: modalVariants,
    overlay: overlayVariants
  },
  state: {
    success: successVariants,
    errorShake: errorShakeVariants
  },
  progress: progressVariants
};

export default animations;