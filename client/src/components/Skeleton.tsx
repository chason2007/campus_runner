import React from 'react';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
    style?: React.CSSProperties;
    glass?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '20px',
    borderRadius = '12px',
    className = '',
    style,
    glass = true
}) => {
    return (
        <div
            className={`skeleton-shimmer skeleton-pulse ${glass ? 'glass' : ''} ${className}`}
            style={{
                width,
                height,
                borderRadius,
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
