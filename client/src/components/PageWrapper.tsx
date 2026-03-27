import { motion, type Variants } from 'framer-motion';
import { type ReactNode } from 'react';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
}

const variants: Variants = {
  initial: {
    opacity: 0,
    y: 10,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.23, 1, 0.32, 1], 
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
    },
  },
};

export const PageWrapper = ({ children, className }: PageWrapperProps) => {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
      style={{ minHeight: '100vh', width: '100%' }}
    >
      {children}
    </motion.div>
  );
};
