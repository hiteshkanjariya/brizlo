import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/store/hooks';
import { signUp } from '@/store/slices/authSlice';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, ArrowRight, Eye, EyeOff, Building2, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const signUpSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters'),
  business_code: z.string().min(3, 'Business code must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await dispatch(signUp({
        business_code: data.business_code,
        password: data.password,
        business_name: data.business_name
      })).unwrap();
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error as string || 'Sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden w-1/2 flex-col justify-between bg-primary p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/20">
            <Shield className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-primary-foreground">
            Admin Panel
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="font-display text-4xl font-bold text-primary-foreground">
            Start your journey<br />today.
          </h1>
          <p className="max-w-md text-lg text-primary-foreground/80">
            Create your business account and get access to powerful management tools and analytics.
          </p>
        </div>

        <p className="text-sm text-primary-foreground/60">
          © 2024 Admin Panel. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-semibold">Admin Panel</span>
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-3xl font-bold">Create an account</h2>
            <p className="text-muted-foreground">
              Enter your business information to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="business_name"
                  type="text"
                  placeholder="e.g. Test System"
                  {...register('business_name')}
                  className={`pl-10 ${errors.business_name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.business_name && (
                <p className="text-sm text-destructive">{errors.business_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_code">Business Code</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="business_code"
                  type="text"
                  placeholder="e.g. hites123"
                  {...register('business_code')}
                  className={`pl-10 ${errors.business_code ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.business_code && (
                <p className="text-sm text-destructive">{errors.business_code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  {...register('password')}
                  className={errors.password ? 'border-destructive pr-10' : 'pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create account
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
