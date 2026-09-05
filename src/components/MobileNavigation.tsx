import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Home, 
  User, 
  MessageSquare, 
  History, 
  LogOut,
  Wifi,
  WifiOff
} from 'lucide-react';

interface MobileNavigationProps {
  activeView: string;
  onViewChange: (view: string) => void;
  onLogout: () => void;
  isOnline?: boolean;
  currentUser?: any;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeView,
  onViewChange,
  onLogout,
  isOnline = true,
  currentUser
}) => {
  const navItems = [
    {
      id: 'home',
      label: 'Home',
      icon: Home,
      badge: null
    },
    {
      id: 'profile',
      label: 'Profil',
      icon: User,
      badge: null
    },
    {
      id: 'prompt',
      label: 'Prompt',
      icon: MessageSquare,
      badge: null
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      badge: null
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-50 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="h-3 w-3 text-green-500" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-500" />
          )}
          <span className="text-xs text-gray-600">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
        
        {currentUser && (
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-600 font-medium">
              {currentUser.username}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewChange(item.id)}
              className={`
                flex flex-col items-center justify-center h-16 w-16 p-1 rounded-xl
                ${isActive 
                  ? 'bg-blue-500 text-white shadow-md' 
                  : 'text-gray-600 hover:text-blue-500 hover:bg-blue-50'
                }
                transition-all duration-200 ease-in-out
              `}
            >
              <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-white' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-white' : ''}`}>
                {item.label}
              </span>
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          );
        })}
        
        {/* Logout Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="
            flex flex-col items-center justify-center h-16 w-16 p-1 rounded-xl
            text-red-500 hover:text-red-600 hover:bg-red-50
            transition-all duration-200 ease-in-out
          "
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-xs font-medium">Keluar</span>
        </Button>
      </div>
    </div>
  );
};

export default MobileNavigation;