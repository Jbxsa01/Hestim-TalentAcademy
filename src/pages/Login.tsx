import React, { useState, useEffect } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { APP_LOGO } from '../lib/constants';

const Login = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();

  // If user is already logged in, redirect to dashboard
  useEffect(() => {
    console.log('🔍 Login: Checking auth state', {
      user: user?.email,
      profile: profile ? 'exists' : 'null',
      authLoading,
    });

    if (!authLoading) {
      if (user && profile) {
        console.log('✅ User authenticated and profile loaded, redirecting to dashboard');
        navigate('/dashboard');
      } else if (user && !profile) {
        console.log('⏳ User authenticated but profile still loading...');
      }
    }
  }, [user, profile, authLoading, navigate]);

  const handleLogin = async () => {
    console.log('🔘 Login button clicked');
    setLoading(true);
    setError('');
    try {
      console.log('🔄 Starting popup flow with Google...');
      const result = await signInWithPopup(auth, googleProvider);
      console.log('✅ Google popup successful:', result.user.email);
      // Navigation will happen automatically via useEffect when profile loads
    } catch (err: any) {
      console.error('❌ Login error:', err);
      setLoading(false);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Connexion annulée.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Les popups sont bloquées. Veuillez vérifier vos paramètres de navigateur.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In n\'est pas activé.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('Domaine non autorisé. Contactez l\'administrateur.');
      } else {
        setError('Erreur de connexion. Veuillez réessayer.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
      {/* Decorative Background Shapes */}
      <div className="fixed top-20 left-5 w-72 h-72 bg-blue-100 rounded-full opacity-10 -z-10"></div>
      <div className="fixed top-40 right-10 w-96 h-96 bg-pink-100 rounded-full opacity-10 -z-10"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md px-6"
      >
        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-[40px] p-10 shadow-xl">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <img src={APP_LOGO} alt="HESTIM" className="h-12 w-auto" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-black text-text-main text-center mb-2">Connexion</h1>
          <p className="text-center text-sm text-text-muted mb-8">HESTIM Talent Academy</p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-danger text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="font-bold">{error}</span>
            </motion.div>
          )}

          {/* Google Login Button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full relative group"
          >
            <div className={`px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
              loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-primary hover:bg-primary-hover text-white shadow-lg hover:shadow-xl active:scale-95'
            }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400/30 border-t-gray-400 rounded-full animate-spin" />
                  <span>Connexion...</span>
                </>
              ) : (
                <>
                  <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-5 h-5"
                  />
                  <span>Google</span>
                </>
              )}
            </div>
          </button>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-gray-100 text-center">
            <p className="text-[10px] text-text-muted/50 uppercase tracking-widest font-bold">
              🔒 Sécurisé par Google
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
