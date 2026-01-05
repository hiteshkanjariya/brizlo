import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  setMode,
  setColor,
  setContainer,
  setSidebar,
  setBorderRadius,
  resetToDefaults,
  ThemeMode,
  ThemeColor,
  ContainerType,
  SidebarType,
  BorderRadius,
} from '@/store/slices/themeSlice';
import { cn } from '@/lib/utils';
import {
  Sun,
  Moon,
  Monitor,
  Maximize,
  Square,
  PanelLeft,
  PanelLeftClose,
  RotateCcw,
  Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const themeColors: { value: ThemeColor; label: string; color: string }[] = [
  { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
  { value: 'green', label: 'Green', color: 'bg-green-500' },
  { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
  { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
  { value: 'red', label: 'Red', color: 'bg-red-500' },
];

const borderRadiusOptions: { value: BorderRadius; label: string }[] = [
  { value: 0, label: '0' },
  { value: 4, label: '4' },
  { value: 7, label: '7' },
  { value: 12, label: '12' },
];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { mode, color, container, sidebar, borderRadius } = useAppSelector((state) => state.theme);

  const handleReset = () => {
    dispatch(resetToDefaults());
    toast.success('Settings reset to defaults');
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Customize your admin panel appearance
            </p>
          </div>

          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Theme Mode */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5" />
                Theme Mode
              </CardTitle>
              <CardDescription>
                Choose between light, dark, or system-based theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <ThemeModeButton
                  icon={Sun}
                  label="Light"
                  isActive={mode === 'light'}
                  onClick={() => dispatch(setMode('light'))}
                />
                <ThemeModeButton
                  icon={Moon}
                  label="Dark"
                  isActive={mode === 'dark'}
                  onClick={() => dispatch(setMode('dark'))}
                />
                <ThemeModeButton
                  icon={Monitor}
                  label="System"
                  isActive={mode === 'system'}
                  onClick={() => dispatch(setMode('system'))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Theme Color */}
          <Card className="animate-slide-up" style={{ animationDelay: '50ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-primary" />
                Theme Color
              </CardTitle>
              <CardDescription>
                Select your preferred accent color
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {themeColors.map((themeColor) => (
                  <button
                    key={themeColor.value}
                    onClick={() => dispatch(setColor(themeColor.value))}
                    className={cn(
                      'group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200',
                      themeColor.color,
                      color === themeColor.value
                        ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                        : 'hover:scale-105'
                    )}
                    title={themeColor.label}
                  >
                    {color === themeColor.value && (
                      <Check className="h-5 w-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Container Layout */}
          <Card className="animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Maximize className="h-5 w-5" />
                Container Layout
              </CardTitle>
              <CardDescription>
                Choose between full width or boxed content area
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <ContainerButton
                  icon={Maximize}
                  label="Full Width"
                  isActive={container === 'full'}
                  onClick={() => dispatch(setContainer('full'))}
                />
                <ContainerButton
                  icon={Square}
                  label="Boxed"
                  isActive={container === 'boxed'}
                  onClick={() => dispatch(setContainer('boxed'))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Type */}
          <Card className="animate-slide-up" style={{ animationDelay: '150ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PanelLeft className="h-5 w-5" />
                Sidebar Type
              </CardTitle>
              <CardDescription>
                Toggle between full and collapsed sidebar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <ContainerButton
                  icon={PanelLeft}
                  label="Full Sidebar"
                  isActive={sidebar === 'full'}
                  onClick={() => dispatch(setSidebar('full'))}
                />
                <ContainerButton
                  icon={PanelLeftClose}
                  label="Mini Sidebar"
                  isActive={sidebar === 'mini'}
                  onClick={() => dispatch(setSidebar('mini'))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Border Radius */}
          <Card className="animate-slide-up lg:col-span-2" style={{ animationDelay: '200ms' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="h-5 w-5 rounded-lg border-2 border-foreground" />
                Border Radius
              </CardTitle>
              <CardDescription>
                Adjust the roundness of UI elements (cards, buttons, inputs)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap gap-4">
                  {borderRadiusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => dispatch(setBorderRadius(option.value))}
                      className={cn(
                        'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200',
                        borderRadius === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/50'
                      )}
                    >
                      <div
                        className="h-12 w-12 border-2 border-foreground bg-muted"
                        style={{ borderRadius: `${option.value}px` }}
                      />
                      <span className="text-sm font-medium">{option.label}px</span>
                    </button>
                  ))}
                </div>

                {/* Preview */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <Label className="mb-3 block text-sm font-medium text-muted-foreground">
                    Preview
                  </Label>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm">Primary Button</Button>
                    <Button size="sm" variant="secondary">
                      Secondary
                    </Button>
                    <Button size="sm" variant="outline">
                      Outline
                    </Button>
                    <div className="flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm">
                      Input Field
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

// Helper Components
function ThemeModeButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <Icon className={cn('h-6 w-6', isActive ? 'text-primary' : 'text-muted-foreground')} />
      <span className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
    </button>
  );
}

function ContainerButton({
  icon: Icon,
  label,
  isActive,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg border-2 p-4 transition-all duration-200',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
      <span className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
    </button>
  );
}
