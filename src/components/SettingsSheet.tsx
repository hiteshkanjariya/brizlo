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
  Settings,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
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

export function SettingsSheet() {
  const dispatch = useAppDispatch();
  const { mode, color, container, sidebar, borderRadius } = useAppSelector((state) => state.theme);

  const handleReset = () => {
    dispatch(resetToDefaults());
    toast.success('Settings reset to defaults');
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground border-0"
        >
          <Settings className="h-5 w-5 animate-spin-slow" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[450px] p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <Settings className="h-5 w-5 text-primary" />
            Theme Settings
          </SheetTitle>
          <SheetDescription>
            Customize the appearance of your admin panel
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="space-y-6 p-6">
            {/* Theme Mode */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Theme Mode</Label>
              <div className="grid grid-cols-3 gap-2">
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
            </div>

            <Separator />

            {/* Theme Color */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Theme Color</Label>
              <div className="flex flex-wrap gap-3">
                {themeColors.map((themeColor) => (
                  <button
                    key={themeColor.value}
                    onClick={() => dispatch(setColor(themeColor.value))}
                    className={cn(
                      'group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
                      themeColor.color,
                      color === themeColor.value
                        ? 'ring-2 ring-offset-2 ring-offset-background ring-foreground scale-110'
                        : 'hover:scale-105'
                    )}
                    title={themeColor.label}
                  >
                    {color === themeColor.value && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Container Layout */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Container Layout</Label>
              <div className="grid grid-cols-2 gap-2">
                <OptionButton
                  icon={Maximize}
                  label="Full Width"
                  isActive={container === 'full'}
                  onClick={() => dispatch(setContainer('full'))}
                />
                <OptionButton
                  icon={Square}
                  label="Boxed"
                  isActive={container === 'boxed'}
                  onClick={() => dispatch(setContainer('boxed'))}
                />
              </div>
            </div>

            <Separator />

            {/* Sidebar Type */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Sidebar Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {/* Full Sidebar */}
                <button
                  onClick={() => dispatch(setSidebar('full'))}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200',
                    sidebar === 'full'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className="relative w-full h-16 rounded-md border border-border bg-muted/50 overflow-hidden">
                    {/* Full sidebar preview */}
                    <div className={cn(
                      'absolute left-0 top-0 h-full w-8 border-r border-border flex flex-col items-center pt-2 gap-1.5',
                      sidebar === 'full' ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <div className="w-4 h-1 rounded-full bg-foreground/30" />
                      <div className="w-5 h-1 rounded-full bg-foreground/20" />
                      <div className="w-5 h-1 rounded-full bg-foreground/20" />
                      <div className="w-5 h-1 rounded-full bg-foreground/20" />
                    </div>
                    {/* Content area */}
                    <div className="absolute left-9 top-2 right-2 space-y-1.5">
                      <div className="h-2 w-full rounded bg-foreground/10" />
                      <div className="h-2 w-3/4 rounded bg-foreground/10" />
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    sidebar === 'full' ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    Full Sidebar
                  </span>
                </button>

                {/* Mini Sidebar */}
                <button
                  onClick={() => dispatch(setSidebar('mini'))}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all duration-200',
                    sidebar === 'mini'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className="relative w-full h-16 rounded-md border border-border bg-muted/50 overflow-hidden">
                    {/* Mini sidebar preview */}
                    <div className={cn(
                      'absolute left-0 top-0 h-full w-4 border-r border-border flex flex-col items-center pt-2 gap-1.5',
                      sidebar === 'mini' ? 'bg-primary/20' : 'bg-muted'
                    )}>
                      <div className="w-2 h-2 rounded-sm bg-foreground/30" />
                      <div className="w-2 h-2 rounded-sm bg-foreground/20" />
                      <div className="w-2 h-2 rounded-sm bg-foreground/20" />
                    </div>
                    {/* Content area */}
                    <div className="absolute left-5 top-2 right-2 space-y-1.5">
                      <div className="h-2 w-full rounded bg-foreground/10" />
                      <div className="h-2 w-3/4 rounded bg-foreground/10" />
                    </div>
                  </div>
                  <span className={cn(
                    'text-xs font-medium',
                    sidebar === 'mini' ? 'text-foreground' : 'text-muted-foreground'
                  )}>
                    Mini Sidebar
                  </span>
                </button>
              </div>
            </div>

            <Separator />

            {/* Border Radius */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Border Radius</Label>
              <div className="flex flex-wrap gap-3">
                {borderRadiusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => dispatch(setBorderRadius(option.value))}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all duration-200',
                      borderRadius === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    )}
                  >
                    <div
                      className="h-8 w-8 border-2 border-foreground bg-muted"
                      style={{ borderRadius: `${option.value}px` }}
                    />
                    <span className="text-xs font-medium">{option.label}px</span>
                  </button>
                ))}
              </div>

              {/* Preview */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 mt-4">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground">
                  Preview
                </Label>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" className="h-7 text-xs">Primary</Button>
                  <Button size="sm" variant="secondary" className="h-7 text-xs">
                    Secondary
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Outline
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* Reset Button */}
            <Button variant="outline" onClick={handleReset} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
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
        'flex flex-col items-center gap-1.5 rounded-lg border-2 p-3 transition-all duration-200',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <Icon className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-muted-foreground')} />
      <span className={cn('text-xs font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
    </button>
  );
}

function OptionButton({
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
        'flex items-center gap-2 rounded-lg border-2 p-3 transition-all duration-200',
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      )}
    >
      <Icon className={cn('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')} />
      <span className={cn('text-sm font-medium', isActive ? 'text-foreground' : 'text-muted-foreground')}>
        {label}
      </span>
    </button>
  );
}
