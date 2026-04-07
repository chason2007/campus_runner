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
        className="cur"
        animate={{
          scale: isHovering ? 2.5 : 1,
          opacity: isHovering ? 0.5 : 1
        }}
        style={{
          x: mouseX,
          y: mouseY,
          left: 0,
          top: 0
        }}
      />
      <motion.div
        className="cur-r"
        animate={{
          scale: isHovering ? 1.5 : 1,
          borderColor: isHovering ? 'rgba(255,255,255,0.8)' : 'rgba(0, 212, 255, 0.4)'
        }}
        style={{
          x: followerX,
          y: followerY,
          left: 0,
          top: 0
        }}
      />
      <motion.div
        className="glow-orb"
        style={{
          x: mouseX,
          y: mouseY,
          left: 0,
          top: 0,
          transform: 'translate(-50%, -50%)' // Ensure it's centered on the point
        }}
      />
    </>
  );
};

export default Cursor;
