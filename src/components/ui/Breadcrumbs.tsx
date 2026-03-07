import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    label: string;
    path?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <nav className="flex items-center gap-2 text-xs text-muted mb-6 overflow-x-auto whitespace-nowrap pb-2 lg:pb-0 no-scrollbar">
            <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
                <Home size={14} />
                <span>Home</span>
            </Link>

            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <ChevronRight size={12} className="opacity-40 shrink-0" />
                    {item.path ? (
                        <Link to={item.path} className="hover:text-primary transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-secondary font-medium">{item.label}</span>
                    )}
                </React.Fragment>
            ))}
        </nav>
    );
};

export default Breadcrumbs;
