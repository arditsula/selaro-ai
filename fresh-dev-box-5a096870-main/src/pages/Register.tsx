import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, Mail, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { registerSchema } from '@/lib/validations';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = registerSchema.safeParse({ email, password, confirmPassword });
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError.message);
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Diese E-Mail ist bereits registriert');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Konto erfolgreich erstellt!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error('Ein Fehler ist aufgetreten');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: "linear-gradient(135deg, #1e1b4b 0%, #5b3df5 50%, #3b82f6 100%)",
      }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-fade-in">
        <div className="relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
              <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl scale-150" />
              <div className="relative h-20 w-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Sparkles className="h-10 w-10 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Selaro</h1>
            <p className="text-white/60 text-sm uppercase tracking-widest mt-1">AI Receptionist</p>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Konto erstellen</h2>
            <p className="text-white/60 text-sm">
              Registrieren Sie sich mit Ihrer E-Mail
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="email"
                placeholder="ihre@email.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-white/40 focus:ring-white/20"
                disabled={isLoading}
                maxLength={255}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="password"
                placeholder="Passwort"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-12 pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-white/40 focus:ring-white/20"
                disabled={isLoading}
                maxLength={128}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
              <Input
                type="password"
                placeholder="Passwort bestätigen"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 pl-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 rounded-xl focus:border-white/40 focus:ring-white/20"
                disabled={isLoading}
                maxLength={128}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white text-[#1e1b4b] hover:bg-white/90 rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-[#1e1b4b]/30 border-t-[#1e1b4b] rounded-full animate-spin" />
                  Wird erstellt...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Registrieren
                </span>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-white/60 text-sm">
              Bereits ein Konto?{' '}
              <Link to="/login" className="text-white hover:underline font-medium">
                Jetzt anmelden
              </Link>
            </p>
          </div>
        </div>

        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10" />
      </div>
    </div>
  );
}
