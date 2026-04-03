import React from 'react';
import { Menu, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NotificationsDropdown } from './NotificationsDropdown';
import { NOTIFICATIONS } from '../constant/nav';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface TopbarProps {
    pageTitle: string;
    initials: string;
    staffName: string | undefined;
    staffEmail: string | undefined;
    notifOpen: boolean;
    searchOpen: boolean;
    onMenuOpen: () => void;
    onNotifOpenChange: (open: boolean) => void;
    onSearchToggle: () => void;
    onLogout: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
    pageTitle,
    initials,
    staffName,
    staffEmail,
    notifOpen,
    searchOpen,
    onMenuOpen,
    onNotifOpenChange,
    onSearchToggle,
    onLogout,
}) => (
    <header className="h-14 border-b border-border bg-card/80 backdrop-blur-lg flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
        <div className="flex items-center gap-3">
            <button
                onClick={onMenuOpen}
                className="lg:hidden text-muted-foreground hover:text-foreground"
            >
                <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-foreground">{pageTitle}</h1>
        </div>

        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={onSearchToggle}
            >
                <Search className="h-4 w-4" />
            </Button>

            <NotificationsDropdown
                notifications={NOTIFICATIONS}
                open={notifOpen}
                onOpenChange={onNotifOpenChange}
            />

            <ThemeToggle />

            <UserMenu
                initials={initials}
                name={staffName}
                email={staffEmail}
                onLogout={onLogout}
            />
        </div>
    </header>
);