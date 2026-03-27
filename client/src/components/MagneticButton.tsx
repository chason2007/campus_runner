import { useRef, type ReactNode, type MouseEvent } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const MagneticButton = ({ children, onClick, className, style, disabled, type = 'button' }: MagneticButtonProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for X and Y position
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for the movement
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: MouseEvent) => {
    if (!ref.current || disabled) return;

    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    // Center of the button
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // Distance from cursor to center
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;

    // Apply the magnetic pull (limiting it to 30px offset)
    // The divisor controls the "strength" of the pull
    x.set(distanceX * 0.35);
    y.set(distanceY * 0.35);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        ...style,
        x: springX,
        y: springY,
        display: 'inline-block',
        position: 'relative'
      }}
      className={className}
    >
      <button 
        onClick={onClick} 
        disabled={disabled}
        type={type}
        className="btn-o" // Reusing the global premium button style
        style={{ width: '100%', height: '100%' }}
      >
        <motion.span
          style={{
            display: 'inline-block',
          }}
        >
          {children}
        </motion.span>
      </button>
    </motion.div>
  );
};
