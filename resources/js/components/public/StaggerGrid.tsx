// resources/js/components/Public/StaggerGrid.tsx
import { useEffect, useRef, useState } from 'react';

interface StaggerGridProps {
    children: React.ReactNode[];
    columns?: {
        sm?: number;
        md?: number;
        lg?: number;
        xl?: number;
    };
    className?: string;
    staggerDelay?: number;
    threshold?: number;
}

export function StaggerGrid({
    children,
    columns = { sm: 1, md: 2, lg: 3, xl: 3 },
    className = '',
    staggerDelay = 100,
    threshold = 0.1,
}: StaggerGridProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold },
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [threshold]);

    const gridCols = `grid-cols-${columns.sm || 1} md:grid-cols-${columns.md || 2} lg:grid-cols-${columns.lg || 3}`;

    return (
        <div ref={ref} className={`grid gap-6 ${gridCols} ${className}`}>
            {children.map((child, index) => (
                <div
                    key={index}
                    className={`transition-all duration-700 ease-out ${
                        isVisible
                            ? 'translate-y-0 opacity-100'
                            : 'translate-y-12 opacity-0'
                    }`}
                    style={{ transitionDelay: `${index * staggerDelay}ms` }}
                >
                    {child}
                </div>
            ))}
        </div>
    );
}
