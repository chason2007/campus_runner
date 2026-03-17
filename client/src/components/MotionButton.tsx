import { motion } from 'framer-motion';
import React from 'react';

interface MotionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const MotionButton: React.FC<MotionButtonProps> = ({
    children,
    variant = 'primary',
    style,
    className = '',
    ...props
}) => {
    const getStyles = () => {
        switch (variant) {
            case 'primary':
                return { background: 'var(--accent)', color: '#000', fontWeight: 700 };
            case 'secondary':
                return { background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)' };
            case 'ghost':
                return { background: 'transparent', color: 'var(--text2)', border: '1px solid var(--border)' };
            case 'danger':
                return { background: 'rgba(255, 107, 107, 0.1)', color: '#ff6b6b', border: '1px solid rgba(255, 107, 107, 0.2)' };
            default:
                return {};
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02, y: -2, boxShadow: '0 8px 25px rgba(0,212,255,0.25)' }}
            whileTap={{ scale: 0.96, y: 0 }}
            className={`motion-btn ${className}`}
            style={{
                padding: '10px 22px',
                borderRadius: '100px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                ...getStyles(),
                ...style
            }}
            {...props as any}
        >
            {children}
        </motion.button>
    );
};
