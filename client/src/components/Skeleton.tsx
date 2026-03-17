import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '20px',
    borderRadius = '4px',
    className = '',
    style
}) => {
    return (
        <div
            className={`skeleton-shimmer ${className}`}
            style={{
                width,
                height,
                borderRadius,
                background: 'rgba(255, 255, 255, 0.05)',
                position: 'relative',
                overflow: 'hidden',
                ...style
            }}
        />
    );
};

export const SkeletonCircle: React.FC<Omit<SkeletonProps, 'borderRadius'>> = (props) => (
    <Skeleton {...props} borderRadius="50%" />
);
