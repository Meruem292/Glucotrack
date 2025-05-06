import { useState } from "react";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";
import { ref, set } from "firebase/database";
import { auth, database } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import GlucoLogo from "@/components/GlucoLogo";

export default function Auth() {
  const { toast } = useToast();
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  
  // Sign In state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  // Sign Up state
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [deviceId, setDeviceId] = useState("");

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter both email and password"
      });
      return;
    }
    
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Success",
        description: "Signed in successfully"
      });
    } catch (error: any) {
      console.error("Sign in error:", error);
      let errorMessage = "Failed to sign in";
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName || !signupEmail || !signupPassword || !deviceId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill all fields"
      });
      return;
    }
    
    if (signupPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password should be at least 6 characters"
      });
      return;
    }
    
    try {
      setLoading(true);
      
      // Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, signupEmail, signupPassword);
      const user = userCredential.user;
      
      // Update the user profile with the display name
      await updateProfile(user, {
        displayName: fullName
      });
      
      // Save additional user data to Firebase Realtime Database
      await set(ref(database, `users/${user.uid}/profile`), {
        deviceId: deviceId,
        health: {
          age: 0,
          weight: 0,
          height: 0,
          condition: "None"
        }
      });
      
      toast({
        title: "Success",
        description: "Account created successfully"
      });
    } catch (error: any) {
      console.error("Sign up error:", error);
      let errorMessage = "Failed to create account";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email already in use";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col auth-bg text-white" id="auth-container">
      {/* Auth Tabs */}
      <div className="mb-6 mt-10 flex justify-center px-4">
        <div className="inline-flex rounded-lg bg-[#1a1a1a]/20 p-1">
          <button 
            className={`rounded-md px-6 py-2 font-medium ${isSignIn ? 'bg-[#2e67d3] text-white' : 'text-white/70'}`}
            onClick={() => setIsSignIn(true)}
          >
            Sign In
          </button>
          <button 
            className={`rounded-md px-6 py-2 font-medium ${!isSignIn ? 'bg-[#2e67d3] text-white' : 'text-white/70'}`}
            onClick={() => setIsSignIn(false)}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* App Logo */}
      <div className="mb-8 text-center">
        <div className="flex justify-center">
          <GlucoLogo size={80} />
        </div>
        <h1 className="mt-2 text-2xl font-bold text-white">GLUCOTRACK</h1>
        <p className="mt-1 text-sm text-white/70">Health Monitoring System</p>
      </div>

      {/* Sign In Form */}
      {isSignIn && (
        <div className="px-6" id="signin-form">
          <div className="mx-auto w-full max-w-md rounded-xl bg-[#1a1a1a]/60 p-6">
            <form className="space-y-4" onSubmit={handleSignIn}>
              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-white/70">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="your@email.com" 
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a1a]/60 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#2e67d3]" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-white/70">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  placeholder="••••••••" 
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a1a]/60 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#2e67d3]" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input 
                    id="remember-me" 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-white/10 bg-[#1a1a1a]/60 accent-[#2e67d3]" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">Remember me</label>
                </div>
                <a href="#" className="text-sm font-medium text-[#4285F4] hover:text-[#5a95ff]">Forgot password?</a>
              </div>
              <button 
                type="submit" 
                className="w-full rounded-lg bg-[#4285F4] px-4 py-3 font-medium text-white transition duration-200 hover:bg-[#2e67d3] disabled:opacity-70"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Signing In...
                  </span>
                ) : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Sign Up Form */}
      {!isSignIn && (
        <div className="px-6" id="signup-form">
          <div className="mx-auto w-full max-w-md rounded-xl bg-[#1a1a1a]/60 p-6">
            <form className="space-y-4" onSubmit={handleSignUp}>
              <div>
                <label htmlFor="fullname" className="mb-1 block text-sm font-medium text-white/70">Full Name</label>
                <input 
                  type="text" 
                  id="fullname" 
                  placeholder="John Doe" 
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a1a]/60 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#2e67d3]" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-email" className="mb-1 block text-sm font-medium text-white/70">Email</label>
                <input 
                  type="email" 
                  id="signup-email" 
                  placeholder="your@email.com" 
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a1a]/60 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#2e67d3]" 
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="signup-password" className="mb-1 block text-sm font-medium text-white/70">Password</label>
                <input 
                  type="password" 
                  id="signup-password" 
                  placeholder="At least 6 characters" 
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a1a]/60 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#2e67d3]" 
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="device-id" className="mb-1 block text-sm font-medium text-white/70">Arduino Device ID</label>
                <input 
                  type="text" 
                  id="device-id" 
                  placeholder="e.g. GT-12345" 
                  className="w-full rounded-lg border border-white/10 bg-[#1a1a1a]/60 px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-[#2e67d3]" 
                  value={deviceId}
                  onChange={(e) => setDeviceId(e.target.value)}
                  required
                />
                <p className="mt-1 text-xs text-white/50">Enter the ID found on your Arduino device</p>
              </div>
              <div className="pt-2">
                <button 
                  type="submit" 
                  className="w-full rounded-lg bg-[#4285F4] px-4 py-3 font-medium text-white transition duration-200 hover:bg-[#2e67d3] disabled:opacity-70"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                      Creating Account...
                    </span>
                  ) : "Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
