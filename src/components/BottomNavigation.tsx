import React from 'react';
import { Home, Camera, Cpu, Activity, Map } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home',    icon: Home,    label: 'Home'   },
  { id: 'report',  icon: Camera,  label: 'Report' },
  { id: 'ai',      icon: Cpu,     label: 'AI'     },
  { id: 'feed',    icon: Activity,label: 'Feed'   },
  { id: 'profile', icon: Map,     label: 'Map'    },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav
      className="shrink-0 w-full z-50"
      style={{
        background: 'rgba(15, 15, 19, 0.98)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-sm mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl transition-all duration-200 active:scale-95"
            >
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl -z-10"
                  style={{ background: 'rgba(124,111,255,0.12)' }}
                />
              )}
              <Icon
                className="w-5 h-5 mb-0.5 transition-all duration-200"
                style={{ color: isActive ? '#7C6FFF' : '#52525B', transform: isActive ? 'scale(1.1)' : 'scale(1)' }}
              />
              <span
                className="text-[9px] font-bold tracking-widest uppercase"
                style={{ color: isActive ? '#7C6FFF' : '#52525B' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavigation;