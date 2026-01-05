import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Eye, EyeOff, Shield, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

// Enhanced password validation with security requirements
const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
  password: z.string().min(1, "Password is required")
});

const signupSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .max(254, "Email is too long"),
  password: passwordSchema,
  confirmPassword: z.string(),
  fullName: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Rate limiting constants
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);
  
  const { signIn, signUp, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Handle lockout countdown
  useEffect(() => {
    if (lockoutUntil) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, lockoutUntil - Date.now());
        setLockoutRemaining(Math.ceil(remaining / 1000));
        if (remaining <= 0) {
          setLockoutUntil(null);
          setLoginAttempts(0);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [lockoutUntil]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (from) {
        navigate(from, { replace: true });
      } else {
        navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
      }
    }
  }, [user, isAdmin, navigate, location.state]);

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["bg-destructive", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"];

  const validateForm = () => {
    setErrors({});
    try {
      if (isLogin) {
        loginSchema.parse({ email, password });
      } else {
        signupSchema.parse({ email, password, confirmPassword, fullName });
      }
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      toast({
        title: "Too Many Attempts",
        description: `Please wait ${lockoutRemaining} seconds before trying again.`,
        variant: "destructive"
      });
      return;
    }
    
    if (!validateForm()) return;
    
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        
        if (error) {
          // Increment login attempts on failure
          const newAttempts = loginAttempts + 1;
          setLoginAttempts(newAttempts);
          
          if (newAttempts >= MAX_ATTEMPTS) {
            const lockoutTime = Date.now() + LOCKOUT_DURATION;
            setLockoutUntil(lockoutTime);
            toast({
              title: "Account Temporarily Locked",
              description: "Too many failed attempts. Please try again in 5 minutes.",
              variant: "destructive"
            });
            return;
          }
          
          // Generic error message to prevent user enumeration
          toast({
            title: "Login Failed",
            description: `Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`,
            variant: "destructive"
          });
          return;
        }

        // Reset attempts on successful login
        setLoginAttempts(0);
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in."
        });
      } else {
        const { error } = await signUp(email, password, fullName);
        
        if (error) {
          // Generic error to prevent user enumeration
          if (error.message.includes("User already registered") || 
              error.message.includes("already exists")) {
            toast({
              title: "Sign Up Failed",
              description: "Unable to create account. Please check your details or try logging in.",
              variant: "destructive"
            });
          } else {
            toast({
              title: "Sign Up Failed",
              description: "Unable to create account. Please try again.",
              variant: "destructive"
            });
          }
          return;
        }

        toast({
          title: "Account Created!",
          description: "Welcome to PPSWZ. You can now access your dashboard."
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isLogin ? "Login" : "Sign Up"} - PPSWZ</title>
        <meta name="description" content="Access your PPSWZ member account or create a new one" />
      </Helmet>

      <div className="min-h-screen bg-gradient-sand flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-card border-border/50">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl font-heading font-bold text-primary-foreground">P</span>
              </div>
              <div>
                <CardTitle className="text-2xl font-heading">
                  {isLogin ? "Welcome Back" : "Join PPSWZ"}
                </CardTitle>
                <CardDescription>
                  {isLogin 
                    ? "Sign in to access your member dashboard" 
                    : "Create an account to become a member"}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={`pl-10 ${errors.fullName ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={isLogin ? "Enter your password" : "Create a strong password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                      disabled={isLoading || !!lockoutUntil}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                  )}
                  
                  {/* Password strength indicator for signup */}
                  {!isLogin && password && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              i < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${passwordStrength >= 4 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        Password strength: {strengthLabels[passwordStrength - 1] || "Very Weak"}
                      </p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        <span className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {password.length >= 8 ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          8+ characters
                        </span>
                        <span className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[A-Z]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Uppercase
                        </span>
                        <span className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[a-z]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Lowercase
                        </span>
                        <span className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[0-9]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Number
                        </span>
                        <span className={`flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                          {/[^A-Za-z0-9]/.test(password) ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          Special char
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password field for signup */}
                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-destructive' : ''}`}
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-destructive">{errors.confirmPassword}</p>
                    )}
                    {confirmPassword && password === confirmPassword && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Passwords match
                      </p>
                    )}
                  </div>
                )}

                {/* Lockout warning */}
                {lockoutUntil && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm text-destructive flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Account locked. Try again in {lockoutRemaining}s
                    </p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full gap-2" 
                  disabled={isLoading || !!lockoutUntil}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      {isLogin ? "Secure Sign In" : "Create Secure Account"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrors({});
                      setPassword("");
                      setConfirmPassword("");
                    }}
                    className="ml-1 text-primary font-medium hover:underline"
                    disabled={isLoading}
                  >
                    {isLogin ? "Sign up" : "Sign in"}
                  </button>
                </p>
              </div>

              <div className="mt-4 text-center">
                <a href="/" className="text-sm text-muted-foreground hover:text-primary">
                  ← Back to Home
                </a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default Auth;
