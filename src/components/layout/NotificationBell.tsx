import React from 'react';
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotificationStore } from '../../features/notifications/notificationStore';
import { useAuthStore } from '../../features/auth/authStore';
import { useNavigate } from 'react-router-dom';

const TypeIcons = {
    info: <Info size={16} className="text-blue" />,
    success: <CheckCircle size={16} className="text-green" />,
    warning: <AlertTriangle size={16} className="text-yellow-500" />,
    error: <AlertCircle size={16} className="text-red" />
};

export const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { 
        notifications, 
        unreadCount, 
        startListening, 
        stopListening, 
        markAsRead, 
        markAllAsRead 
    } = useNotificationStore();

    React.useEffect(() => {
        if (user && !user.isAnonymous) {
            startListening(user.id);
        }
        return () => {
            stopListening();
        };
    }, [user, startListening, stopListening]);

    if (!user || user.isAnonymous) return null;

    const handleAction = async (notifId: string, actionType?: string, actionData?: string) => {
        setIsOpen(false);
        await markAsRead(user.id, notifId);
        
        if (actionType === 'link' && actionData) {
            navigate(actionData);
        }
    };

    const handleMarkAllRead = async () => {
        await markAllAsRead(user.id);
    };

    return (
        <div className="nav-notifs relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-1.5 text-secondary hover:text-primary transition-all relative rounded-lg hover:bg-white/5"
            >
                <Bell size={16} />
                {unreadCount > 0 && (
                    <span 
                        className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-0.5 bg-red-500 rounded-full text-[8px] font-black text-white flex items-center justify-center animate-pulse"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-72 glass-card shadow-2xl border border-white/10 z-[60] animate-fade-in-up overflow-hidden">
                    <div className="flex justify-between items-center p-3 border-b border-white/5 bg-white/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted">Notificações</p>
                        {unreadCount > 0 && (
                            <button 
                                onClick={handleMarkAllRead}
                                className="text-[9px] text-accent-primary hover:underline font-bold"
                            >
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto p-1 custom-scrollbar">
                        {notifications.length === 0 ? (
                            <div className="text-center py-6 opacity-40">
                                <Bell size={24} className="mx-auto mb-2 opacity-50" />
                                <p className="text-[10px] font-bold">Sem novidades</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {notifications.map(n => (
                                    <button
                                        key={n.id}
                                        onClick={() => handleAction(n.id, n.actionType, n.actionData)}
                                        className={`w-full flex items-start gap-3 p-3 text-left rounded-lg transition-colors group ${n.isRead ? 'opacity-70 hover:bg-white/5' : 'bg-white/5 hover:bg-white/10 border-l-2 border-accent-primary'}`}
                                    >
                                        <div className="mt-0.5">
                                            {TypeIcons[n.type] || TypeIcons.info}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-[11px] font-bold mb-0.5 ${n.isRead ? 'text-primary' : 'text-accent-primary text-glow'}`}>{n.title}</p>
                                            <p className="text-[10px] text-secondary line-clamp-2 leading-snug">{n.message}</p>
                                            <p className="text-[8px] text-muted mt-1 uppercase tracking-wider">
                                                {new Date(n.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
