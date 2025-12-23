import { useState } from 'react';
import { User, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProfilePanel } from './ProfilePanel';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const tabs = ['Dashboard', 'Volunteers', 'Slots', 'Settings', 'Reports'];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border bg-card shadow-sm">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - Navigation */}
        <nav className="flex items-center gap-1">
          {tabs.map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'secondary' : 'ghost'}
              onClick={() => onTabChange(tab)}
              className="font-medium"
            >
              {tab === 'Dashboard' && <LayoutDashboard className="mr-2 h-4 w-4" />}
              {tab}
            </Button>
          ))}
        </nav>

        {/* Right side - Profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <User className="h-4 w-4" />
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover z-50">
            <DropdownMenuItem onClick={() => setShowProfilePanel(true)}>
              <User className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Profile Panel */}
      <ProfilePanel 
        isOpen={showProfilePanel} 
        onClose={() => setShowProfilePanel(false)} 
      />
    </header>
  );
};
