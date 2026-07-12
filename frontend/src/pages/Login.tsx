import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Loader2, Activity, ScanFace, ArrowRight } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';

const loginSchema = z.object({
  email: z.string().email({ message: 'Valid email address required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  useEffect(() => {
    document.title = 'Login Portal';
    return () => {
      document.title = 'VaiRadiology';
    };
  }, []);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      const response = await api.post('/auth/login/', {
        email: data.email,
        password: data.password,
      });

      setAuth(response.data.access, response.data.refresh);
      
      navigate('/tasks');
    } catch (error: any) {
      if (error.response?.status === 401) {
        setAuthError('Unauthorized credentials. Please verify your access.');
      } else {
        setAuthError('Connection to server lost. Please try again.');
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans text-slate-900">
      
      
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12">
        
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-cyan-400 mb-8">
            <Activity size={32} />
            <span className="text-2xl font-bold tracking-tight text-white">VaiRadiology</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
            Precision Imaging <br/>
            <span className="text-cyan-400">Annotation Platform</span>
          </h1>
          <p className="text-slate-400 max-w-md text-lg">
            Manage diagnostic workflows, review patient scans and execute high-precision clinical annotations.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 text-slate-400 border-t border-slate-800 pt-6">
          <ScanFace size={24} className="text-cyan-500" />
          <span className="text-sm">HIPAA Compliant System Environment</span>
        </div>
      </div>

      
      <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.18),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.22),_transparent_35%),linear-gradient(135deg,_rgba(2,6,23,0.98),_rgba(15,23,42,0.96))]">
        <div className="w-full max-w-md space-y-8 bg-white/95 p-10 rounded-2xl shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_20px_60px_rgba(2,6,23,0.35)] border border-slate-100">
          
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Portal Access</h2>
            <p className="mt-2 text-sm text-slate-500">Please enter your credentials to proceed.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
          
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="dr.name@vairadiology.com"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.email ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-cyan-500'
                  } rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-slate-50 focus:bg-white`}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>}
            </div>

          
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  {...register('password')}
                  type="password"
                  placeholder="••••••••"
                  className={`block w-full pl-10 pr-3 py-3 border ${
                    errors.password ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 focus:ring-cyan-500'
                  } rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all bg-slate-50 focus:bg-white`}
                />
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            
            {authError && (
              <div className="p-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm flex items-center gap-2">
                <Activity className="w-4 h-4" />
                {authError}
              </div>
            )}

        
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}