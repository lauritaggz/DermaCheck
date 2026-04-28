import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
}

const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -20,
  },
};

export function PageTransition({ children, className = '' }: Props) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Variante para transiciones más rápidas (modales, etc)
export function QuickTransition({ children, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        transition: { duration: 0.2, ease: 'easeOut' }
      }}
      exit={{ 
        opacity: 0, 
        scale: 0.95,
        transition: { duration: 0.15, ease: 'easeIn' }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Transición con slide desde la derecha
export function SlideTransition({ children, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ 
        opacity: 1, 
        x: 0,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
      }}
      exit={{ 
        opacity: 0, 
        x: -100,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
