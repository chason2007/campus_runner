import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const Cursor: React.FC = () => {
  const mouseX = useSpring(0, { damping: 20, stiffness: 250 });
  const mouseY = useSpring(0, { damping: 20, stiffness: 250 });

  const followerX = useSpring(0, { damping: 40, stiffness: 150 });
  const followerY = useSpring(0, { damping: 40, stiffness: 150 });

  const [isHovering, setIsHovering] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Use CSS media query — much more reliable than maxTouchPoints
    // which is falsely > 0 on many Windows desktop browsers (Chrome/Edge)
    const isTouchOnly = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    setIsTouchDevice(isTouchOnly);
  }, []);

  useEffect(() => {
    const moveMouse = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      followerX.set(e.clientX);
      followerY.set(e.clientY);

      // Check if hovering over interactive element
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, select, textarea, [role="button"]') !== null;
      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', moveMouse);
    return () => window.removeEventListener('mousemove', moveMouse);
  }, [mouseX, mouseY, followerX, followerY]);

  if (isTouchDevice) return null;

  return (
    <>
      <motion.div
        className={`cur ${isHovering ? 'h' : ''}`}
        style={{
          x: mouseX,
          y: mouseY,
          left: 0,
          top: 0
        }}
      />
      <motion.div
        className={`cur-r ${isHovering ? 'h' : ''}`}
        style={{
          x: followerX,
          y: followerY,
          left: 0,
          top: 0
        }}
      />
      <motion.div
        className="glow-orb"
        animate={{
          left: mouseX.get(),
          top: mouseY.get()
        }}
        transition={{ type: 'tween', ease: 'linear', duration: 0.1 }}
      />
    </>
  );
};

export default Cursor;
