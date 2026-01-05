import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAppSelector } from '@/store/hooks';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Camera,
  Pencil,
  Save,
  X,
  Bell,
  Lock,
  Globe,
  Briefcase,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  company: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const mockProfileData = {
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  bio: 'Full-stack developer with 8+ years of experience in building scalable web applications. Passionate about clean code and user experience.',
  company: 'Tech Corp Inc.',
  website: 'https://example.com',
  joinDate: 'January 2024',
  lastActive: '2 hours ago',
};

export default function ProfilePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
    marketing: false,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: mockProfileData.phone,
      location: mockProfileData.location,
      bio: mockProfileData.bio,
      company: mockProfileData.company,
      website: mockProfileData.website,
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-primary/10 text-primary border-primary/20',
    manager: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    user: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <AdminLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>
        </div>

        {/* Profile Header Card */}
        <Card className="border-0 shadow-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <Badge variant="outline" className={roleColors[user?.role || 'user']}>
                    <Shield className="mr-1 h-3 w-3" />
                    {user?.role}
                  </Badge>
                </div>
                <p className="text-muted-foreground">{user?.email}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {mockProfileData.joinDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {mockProfileData.location}
                  </span>
                </div>
              </div>
              <Button
                variant={isEditing ? 'outline' : 'default'}
                onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                className="shrink-0"
              >
                {isEditing ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your personal details and public profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="name"
                          {...register('name')}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Your name"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          {...register('email')}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="your@email.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="phone"
                          {...register('phone')}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="location"
                          {...register('location')}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="City, Country"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="company"
                          {...register('company')}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="Your company"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          id="website"
                          {...register('website')}
                          disabled={!isEditing}
                          className="pl-10"
                          placeholder="https://example.com"
                        />
                      </div>
                      {errors.website && (
                        <p className="text-sm text-destructive">{errors.website.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      {...register('bio')}
                      disabled={!isEditing}
                      placeholder="Tell us about yourself..."
                      className="min-h-[120px] resize-none"
                    />
                    {errors.bio && (
                      <p className="text-sm text-destructive">{errors.bio.message}</p>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={handleCancel}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!isDirty}>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </form>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Password & Security
                </CardTitle>
                <CardDescription>
                  Manage your password and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                  <div className="space-y-1">
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline">Change Password</Button>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">
                        Use an authenticator app to generate verification codes
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <p className="font-medium">SMS Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Receive verification codes via SMS
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Active Sessions</h4>
                  <div className="rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="font-medium">Current Session</p>
                        <p className="text-sm text-muted-foreground">
                          Chrome on macOS • San Francisco, CA
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">
                        Active
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose how you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch
                      checked={notifications.email}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, email: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Push Notifications</p>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications in browser
                      </p>
                    </div>
                    <Switch
                      checked={notifications.push}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, push: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Product Updates</p>
                      <p className="text-sm text-muted-foreground">
                        Get notified about new features and updates
                      </p>
                    </div>
                    <Switch
                      checked={notifications.updates}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, updates: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <p className="font-medium">Marketing Emails</p>
                      <p className="text-sm text-muted-foreground">
                        Receive tips, offers, and promotional content
                      </p>
                    </div>
                    <Switch
                      checked={notifications.marketing}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
