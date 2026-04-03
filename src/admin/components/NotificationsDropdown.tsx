import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, ShoppingCart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Notification } from '../constant/nav';

interface NotificationsDropdownProps {
  notifications: Notification[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) =>
  type === 'warning' ? (
    <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
  ) : (
    <ShoppingCart className="h-4 w-4 text-primary shrink-0 mt-0.5" />
  );

export const NotificationsDropdown: React.FC<NotificationsDropdownProps> = ({
  notifications,
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  const handleClick = (n: Notification) => {
    if (n.type === 'warning') {
      navigate('/admin/inventory/finished');
    } else if (n.type === 'order' && n.orderId) {
      navigate(`/admin/orders/${n.orderId}`);
    } else if (n.type === 'order') {
      navigate('/admin/orders');
    }
    onOpenChange(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground relative">
          <Bell className="h-4 w-4" />
          {notifications.length > 0 && <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-3 py-2 border-b border-border">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        {notifications.map((n) => (
          <DropdownMenuItem
            key={n.id}
            className="flex gap-3 px-3 py-2.5 cursor-pointer"
            onClick={() => handleClick(n)}
          >
            <NotificationIcon type={n.type} />
            <div className="min-w-0">
              <p className="text-[13px] text-foreground leading-tight">{n.message}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {n.time}
              </p>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
