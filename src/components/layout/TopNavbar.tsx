import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebar } from '@/store/slices/themeSlice';
import { logout } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';
import {
  Bell,
  Search,
  PanelLeftClose,
  PanelLeft,
  User,
  Settings,
  LogOut,
  UserPlus,
  Server,
  FileBarChart,
  CheckCircle2,
  Clock,
  ChevronRight,
  Command,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

const notifications = [
  {
    id: 1,
    title: 'New user registered',
    description: 'John Doe created an account',
    time: '2 minutes ago',
    icon: UserPlus,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    unread: true,
  },
  {
    id: 2,
    title: 'Server update completed',
    description: 'All systems are running smoothly',
    time: '1 hour ago',
    icon: Server,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    unread: true,
  },
  {
    id: 3,
    title: 'Weekly report generated',
    description: 'Your analytics report is ready',
    time: '3 hours ago',
    icon: FileBarChart,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    unread: true,
  },
];

export function TopNavbar() {
  const dispatch = useAppDispatch();
  const { sidebar } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);
  const location = useLocation();
  const isCollapsed = sidebar === 'mini';
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    setShowLogoutDialog(false);
  };

  const toggleSidebar = () => {
    dispatch(setSidebar(isCollapsed ? 'full' : 'mini'));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/users') return 'Users';
    if (path === '/profile') return 'Profile';
    if (path === '/settings') return 'Settings';
    if (path === '/roles') return 'Roles';
    if (path === '/permissions') return 'Permissions';
    if (path === '/analytics') return 'Analytics';
    if (path === '/documents') return 'Documents';
    if (path === '/messages') return 'Messages';
    if (path === '/notifications') return 'Notifications';
    return 'Dashboard';
  };

  return (
    <>
      <header
        className={cn(
          'fixed right-0 top-0 z-30 flex h-16 items-center border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300',
          isCollapsed ? 'left-16' : 'left-64'
        )}
      >
        <div className="flex w-full items-center justify-between px-4 lg:px-6">
          {/* Left Section */}
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle */}
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSidebar}
                  className="h-9 w-9 shrink-0 hover:bg-muted"
                >
                  {isCollapsed ? (
                    <PanelLeft className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-6 hidden sm:block" />

            {/* Page Title */}
            <div className="hidden sm:flex items-center gap-2">
              <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
              <Badge variant="secondary" className="bg-primary/10 text-primary text-xs font-medium hidden md:flex">
                <Sparkles className="h-3 w-3 mr-1" />
                Pro
              </Badge>
            </div>
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <Input
                placeholder="Search anything..."
                className="w-full bg-muted/50 pl-10 pr-12 h-10 border-transparent focus:border-primary/50 focus:bg-background transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
                <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground flex">
                  <Command className="h-3 w-3" />
                  K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="h-9 w-9 md:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-96 p-0">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <Bell className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm">Notifications</span>
                      <p className="text-xs text-muted-foreground">Stay updated</p>
                    </div>
                  </div>
                  <Badge className="bg-primary text-primary-foreground text-xs font-medium">
                    {unreadCount} new
                  </Badge>
                </div>

                {/* Notifications List */}
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={cn(
                        'flex items-start gap-3 p-4 transition-colors hover:bg-muted/50 cursor-pointer',
                        notification.unread && 'bg-primary/5',
                        index !== notifications.length - 1 && 'border-b border-border/50'
                      )}
                    >
                      <div className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                        notification.bgColor
                      )}>
                        <notification.icon className={cn('h-5 w-5', notification.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium truncate">{notification.title}</p>
                          {notification.unread && (
                            <span className="h-2 w-2 rounded-full bg-primary shrink-0 animate-pulse" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {notification.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{notification.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="border-t border-border p-2 bg-muted/30">
                  <Button variant="ghost" className="w-full justify-center text-sm text-primary hover:text-primary hover:bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark all as read
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-6 mx-1 hidden sm:block" />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2 h-10 hover:bg-muted/50 rounded-xl">
                  <Avatar className="h-8 w-8 border-2 border-primary/20 ring-2 ring-background">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-sm font-semibold">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-semibold leading-none">
                      {user?.name}
                    </span>
                    <span className="text-xs text-muted-foreground capitalize leading-none mt-1">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90 hidden lg:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-0">
                {/* User Header */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-b border-border">
                  <Avatar className="h-12 w-12 border-2 border-primary/20 shadow-lg ring-2 ring-background">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user?.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    <Badge className="mt-1.5 text-xs capitalize bg-primary/10 text-primary border-0">
                      {user?.role}
                    </Badge>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg">
                    <Link to="/profile">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">Profile</span>
                        <p className="text-xs text-muted-foreground">View your profile</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg">
                    <Link to="/settings">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium">Settings</span>
                        <p className="text-xs text-muted-foreground">Manage preferences</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="my-0" />

                {/* Logout */}
                <div className="p-2">
                  <DropdownMenuItem
                    onClick={() => setShowLogoutDialog(true)}
                    className="flex items-center gap-3 px-3 py-2.5 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-destructive/10">
                      <LogOut className="h-4 w-4 text-destructive" />
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">Logout</span>
                      <p className="text-xs text-destructive/70">Sign out of your account</p>
                    </div>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <LogOut className="h-7 w-7 text-destructive" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              Are you sure you want to logout?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              You will be signed out of your account and redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="flex-1">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Yes, logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
