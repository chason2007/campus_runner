import { useLocation, useNavigate } from 'react-router-dom';
import '../pages/Dashboard.css';

interface NavItem {
    label: string;
    icon: string;
    tab?: string;
    path?: string;
    action?: () => void;
}

interface Props {
    items: NavItem[];
    activeTab?: string;
    onTabChange?: (tab: string) => void;
}

export function DashboardMobileNav({ items, activeTab, onTabChange }: Props) {
    const location = useLocation();
    const navigate = useNavigate();

    return (
        <div className="db-mobile-nav">
            {items.map((item, i) => {
                const isActive = item.tab ? activeTab === item.tab : location.pathname === item.path;
                
                return (
                    <button 
                        key={i}
                        type="button"
                        className={`db-nav-item bg-transparent border-none ${isActive ? 'active' : ''}`}
                        onClick={() => {
                            if (item.action) item.action();
                            else if (item.tab && onTabChange) onTabChange(item.tab);
                            else if (item.path) navigate(item.path);
                        }}
                    >
                        <span className="db-nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
