import { useAppSelector } from '@/store/hooks';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { TopNavbar } from './TopNavbar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { sidebar, container } = useAppSelector((state) => state.theme);
  const isCollapsed = sidebar === 'mini';

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <TopNavbar />

      <main
        className={cn(
          'min-h-screen pt-16 transition-all duration-300',
          isCollapsed ? 'pl-16' : 'pl-64'
        )}
      >
        <div
          className={cn(
            'mx-auto p-6',
            container === 'boxed' ? 'max-w-7xl' : 'max-w-full'
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
