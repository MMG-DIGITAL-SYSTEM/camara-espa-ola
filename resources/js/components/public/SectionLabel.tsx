// resources/js/components/Public/SectionLabel.tsx
interface SectionLabelProps {
    number: string;
    children: React.ReactNode;
    className?: string;
}

export function SectionLabel({
    number,
    children,
    className = '',
}: SectionLabelProps) {
    return (
        <div className={`mb-6 flex items-center gap-3 ${className}`}>
            <span className="font-mono text-sm tracking-wider text-red-600">
                {number}
            </span>
            <span className="h-px w-12 bg-red-600/40"></span>
            <span className="text-sm font-medium tracking-wider text-gray-400 uppercase">
                {children}
            </span>
        </div>
    );
}
