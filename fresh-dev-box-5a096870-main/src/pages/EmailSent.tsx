import { Link } from 'react-router-dom';
import { Sparkles, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmailSent() {
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

          <div className="text-center">
            <div className="mb-6">
              <div className="mx-auto h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6 animate-scale-in">
                <CheckCircle className="h-10 w-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">
                E-Mail gesendet
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Bitte prüfen Sie Ihren Posteingang. Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts gesendet.
              </p>
            </div>

            <Link to="/login">
              <Button
                className="w-full h-12 bg-white text-[#1e1b4b] hover:bg-white/90 rounded-xl font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zurück zum Login
              </Button>
            </Link>
          </div>
        </div>

        <div className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-blue-500/20 rounded-3xl blur-xl -z-10" />
      </div>
    </div>
  );
}
