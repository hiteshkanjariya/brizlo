import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  LogOut,
  Shield,
  FileText,
  BarChart3,
  UserCircle,
  Bell,
  Lock,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
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

interface NavItem {
  title: string;
  icon: React.ElementType;
  href?: string;
  roles?: string[];
  children?: { title: string; href: string; icon: React.ElementType }[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  {
    title: 'Management',
    icon: Users,
    roles: ['admin', 'manager'],
    children: [
      { title: 'Users', href: '/users', icon: Users },
      { title: 'Roles', href: '/roles', icon: Lock },
      { title: 'Permissions', href: '/permissions', icon: Shield },
    ],
  },
  {
    title: 'Reports',
    icon: BarChart3,
    children: [
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
      { title: 'Documents', href: '/documents', icon: FileText },
    ],
  },
  {
    title: 'Support',
    icon: HelpCircle,
    children: [
      { title: 'Messages', href: '/messages', icon: MessageSquare },
      { title: 'Notifications', href: '/notifications', icon: Bell },
    ],
  },
  { title: 'Profile', icon: UserCircle, href: '/profile' },
];

export function AdminSidebar() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { sidebar } = useAppSelector((state) => state.theme);
  const { user } = useAppSelector((state) => state.auth);
  const isCollapsed = sidebar === 'mini';
  const [openGroups, setOpenGroups] = useState<string[]>(['Management', 'Reports']);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) =>
      prev.includes(title)
        ? prev.filter((g) => g !== title)
        : [...prev, title]
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    setShowLogoutDialog(false);
  };

  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return user && item.roles.includes(user.role);
  });

  const isActiveRoute = (href: string) => location.pathname === href;
  const isGroupActive = (children?: { href: string }[]) =>
    children?.some((child) => location.pathname === child.href);

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r border-sidebar-border bg-sidebar transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-16' : 'w-64'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            'flex h-16 items-center border-b border-sidebar-border px-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/20">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <span className="font-display text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  AdminHub
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {filteredNavItems.map((item) => {
              if (item.children) {
                // Collapsible group
                const isOpen = openGroups.includes(item.title);
                const hasActiveChild = isGroupActive(item.children);

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.title} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            'flex w-full items-center justify-center rounded-lg px-2 py-2.5 text-sm font-medium transition-all duration-200',
                            hasActiveChild
                              ? 'bg-primary/10 text-primary'
                              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                          )}
                        >
                          <item.icon className="h-5 w-5 shrink-0" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium p-0" sideOffset={8}>
                        <div className="py-2">
                          <p className="px-3 pb-2 font-semibold text-sm border-b border-border">{item.title}</p>
                          <div className="pt-2 space-y-0.5">
                            {item.children.map((child) => (
                              <Link
                                key={child.href}
                                to={child.href}
                                className={cn(
                                  'flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors',
                                  isActiveRoute(child.href) && 'bg-primary/10 text-primary'
                                )}
                              >
                                <child.icon className="h-4 w-4" />
                                {child.title}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <Collapsible
                    key={item.title}
                    open={isOpen}
                    onOpenChange={() => toggleGroup(item.title)}
                  >
                    <CollapsibleTrigger
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                        hasActiveChild
                          ? 'bg-primary/10 text-primary'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 shrink-0 transition-transform duration-200',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                      <div className="mt-1 space-y-1 pl-4">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            to={child.href}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                              isActiveRoute(child.href)
                                ? 'bg-primary text-primary-foreground shadow-sm'
                                : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                            )}
                          >
                            <child.icon className="h-4 w-4 shrink-0" />
                            <span>{child.title}</span>
                          </Link>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              }

              // Regular link
              const isActive = item.href && isActiveRoute(item.href);
              const NavContent = (
                <Link
                  to={item.href!}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isCollapsed && 'justify-center px-2'
                  )}
                >
                  <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-primary-foreground')} />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.title} delayDuration={0}>
                    <TooltipTrigger asChild>{NavContent}</TooltipTrigger>
                    <TooltipContent side="right" className="font-medium" sideOffset={8}>
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return <div key={item.title}>{NavContent}</div>;
            })}
          </nav>

          {/* User Section */}
          <div className="border-t border-sidebar-border p-3">
            {user && !isCollapsed && (
              <div className="mb-3 flex items-center gap-3 rounded-lg bg-gradient-to-r from-sidebar-accent/50 to-sidebar-accent/30 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
                    {user.name}
                  </p>
                  <p className="truncate text-xs text-sidebar-foreground/70 capitalize">
                    {user.role}
                  </p>
                </div>
              </div>
            )}

            {/* Collapsed user avatar */}
            {user && isCollapsed && (
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            )}

            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLogoutDialog(true)}
                  className={cn(
                    'h-9 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive',
                    !isCollapsed && 'flex-1 w-full'
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  {!isCollapsed && <span className="ml-2">Logout</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={8}>Logout</TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </aside>

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
