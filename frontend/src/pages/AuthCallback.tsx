import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';

/**
 * /auth/callback
 * This page handles the redirect from the Google OAuth flow.
 * The backend redirects here with a one-time `code` query parameter.
 * This component exchanges that code for the real JWT and user data.
 */
export default function AuthCallback() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setToken, setUser, startAutoLogout } = useAuthStore();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');

    if (!code) {
      setError('No authorization code received. Please try logging in again.');
      return;
    }

    const exchangeCodeForToken = async () => {
      try {
        const res = await authAPI.exchangeCode(code);
        const { token, user } = res.data;

        // Store in auth store (same as old login flow)
        setToken(token);
        setUser(user);
        startAutoLogout();

        // Navigate to dashboard
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        console.error('Code exchange failed:', err);
        const message = err.response?.data?.message || 'Authentication failed. Please try again.';
        setError(message);
      }
    };

    exchangeCodeForToken();
  }, [searchParams, setToken, setUser, startAutoLogout, navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
          <h1 className="text-2xl font-bold mb-4">PrepVerse</h1>
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">PrepVerse</h1>
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Completing sign in...</span>
        </div>
      </div>
    </div>
  );
}
