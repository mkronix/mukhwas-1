import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserMenuProps {
    initials: string;
    name: string | undefined;
    email: string | undefined;
    onLogout: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({ initials, name, email, onLogout }) => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-semibold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2">
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Logout
            </DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
);