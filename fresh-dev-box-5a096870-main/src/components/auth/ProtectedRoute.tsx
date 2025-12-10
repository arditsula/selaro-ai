import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles } from 'lucide-react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #5b3df5 50%, #3b82f6 100%)",
        }}
      >
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl" />
            <div className="relative h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
          <p className="text-white/80 text-sm">Authentifizierung wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("PROTECTED ROUTE: No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("PROTECTED ROUTE: User authenticated, rendering children");
  return <>{children}</>;
}
