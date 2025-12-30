import { useState } from 'react';
import { User, LogOut, ChevronDown, LayoutDashboard, CheckSquare, Settings, Users, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProfilePanel } from './ProfilePanel';

import logo from '@/assets/logo.svg';

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
    selectedTask?: any;
    taskViewMode?: string;
    onTaskViewChange?: (view: string) => void;
}

export const Sidebar = ({
    activeTab,
    onTabChange,
    selectedTask,
    taskViewMode,
    onTaskViewChange
}: SidebarProps) => {
    const [showProfilePanel, setShowProfilePanel] = useState(false);

    // Map tabs to icons for a better sidebar experience
    const tabs = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Volunteers', icon: Users },
        { name: 'Manage Tasks', icon: CheckSquare },
        { name: 'Settings', icon: Settings },
        { name: 'Reports', icon: FileText }
    ];

    return (
        <aside className="fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-white shadow-sm flex flex-col">
            {/* Brand / Logo Area */}
            <div className="flex h-40 items-center justify-center border-b border-border p-6">
                <img src={logo} alt="SoccerClub Logo" className="h-[90%] w-auto object-contain" />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {tabs.map((tab) => {
                    const isManageTasks = tab.name === 'Manage Tasks';
                    const hasSubItems = isManageTasks && selectedTask;
                    const isActive = activeTab === tab.name;

                    return (
                        <div key={tab.name}>
                            <Button
                                variant="ghost"
                                onClick={() => onTabChange(tab.name)}
                                className={cn(
                                    "w-full justify-between mb-1 group",
                                    isActive
                                        ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                                        : "text-foreground/80 hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <div className="flex items-center">
                                    <tab.icon className="mr-3 h-4 w-4" />
                                    {tab.name}
                                </div>
                                {hasSubItems && (
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                )}
                            </Button>

                            {/* Sub-menu Items */}
                            {hasSubItems && (
                                <div className="ml-4 pl-3 border-l border-border mt-1 space-y-1 mb-2">
                                    {['Rooster', 'Details', 'Assigned persons', 'E-mail template'].map((subItem) => (
                                        <Button
                                            key={subItem}
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onTaskViewChange?.(subItem);
                                            }}
                                            className={cn(
                                                "w-full justify-start h-8 text-sm font-normal",
                                                taskViewMode === subItem
                                                    ? "bg-[#d4af37] text-white font-medium hover:bg-[#d4af37]/90"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                                            )}
                                        >
                                            {subItem}
                                        </Button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Bottom Profile Section */}
            <div className="border-t border-border p-3">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="w-full justify-start pl-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground mr-3">
                                <User className="h-4 w-4" />
                            </div>
                            <span className="flex-1 text-left truncate">Admin User</span>
                            <ChevronDown className="h-4 w-4 ml-auto" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover z-50 ml-2">
                        <DropdownMenuItem onClick={() => setShowProfilePanel(true)}>
                            <User className="mr-2 h-4 w-4" />
                            My Profile
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                                sessionStorage.removeItem('token');
                                window.location.href = '/';
                            }}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>


            </div>

            <ProfilePanel
                isOpen={showProfilePanel}
                onClose={() => setShowProfilePanel(false)}
            />
        </aside>
    );
};
