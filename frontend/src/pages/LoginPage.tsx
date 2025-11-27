import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Textbox from '../components/Textbox';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:5008';

type LoginMethod = 'password' | 'otp';
type OTPStep = 'email' | 'code';

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<LoginMethod>('password');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOTP] = useState('');
  const [error, setError] = useState('');
  const [otpStep, setOtpStep] = useState<OTPStep>('email');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();

  // Password login
  const loginWithPassword = async () => {
    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const credentials = btoa(`${username}:${password}`);
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
        toast.success('Login successful!');
        navigate('/home');
      }
    } catch (err) {
      setError('Invalid username or password');
      toast.error('Invalid username or password');
    } finally {
      setLoading(false);
    }
  };

  // Request OTP
  const requestOTP = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/request_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP');
      }

      toast.success('OTP sent to your email!');
      setOtpStep('code');
      setCountdown(600); // 10 minutes

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/verify_otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP');
      }

      if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
        toast.success('Login successful!');
        navigate('/home');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid OTP';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (loginMethod === 'password') {
        loginWithPassword();
      } else if (otpStep === 'email') {
        requestOTP();
      } else {
        verifyOTP();
      }
    }
  };

  const switchLoginMethod = (method: LoginMethod) => {
    setLoginMethod(method);
    setError('');
    setOTP('');
    setPassword('');
    setOtpStep('email');
    setCountdown(0);
  };

  const resetToEmail = () => {
    setOtpStep('email');
    setOTP('');
    setError('');
    setCountdown(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-800 to-blue-500 dark:from-gray-900 dark:to-gray-800 p-5">
      <div className="flex flex-col items-center justify-center w-full max-w-[450px]">
        <div className="flex flex-col items-stretch justify-start w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden min-h-[480px]">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 dark:from-gray-700 dark:to-gray-900 text-white dark:text-gray-100 px-7 py-10 pb-7 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Peer Evaluation</h1>
            <p className="m-0 text-base font-normal">Collaborative Peer Review Platform</p>
          </div>

          <div className="flex flex-col p-7 flex-1">
            {/* Login Method Tabs */}
            <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => switchLoginMethod('password')}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  loginMethod === 'password'
                    ? 'bg-white dark:bg-gray-600 text-blue-800 dark:text-blue-300 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                🔑 Password
              </button>
              <button
                onClick={() => switchLoginMethod('otp')}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-all ${
                  loginMethod === 'otp'
                    ? 'bg-white dark:bg-gray-600 text-blue-800 dark:text-blue-300 shadow'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                📧 Email Code
              </button>
            </div>

            {loginMethod === 'password' ? (
              <>
                <div className="flex flex-col gap-5 mb-6 w-full">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="username" className="text-base font-semibold text-blue-800 dark:text-blue-400">
                      Username
                    </label>
                    <Textbox
                      placeholder="Enter your username..."
                      onInput={setUsername}
                      value={username}
                      onKeyPress={handleKeyPress}
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="text-base font-semibold text-blue-800 dark:text-blue-400">
                      Password
                    </label>
                    <Textbox
                      type="password"
                      placeholder="Enter your password..."
                      onInput={setPassword}
                      value={password}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md px-3.5 py-3 mb-5 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="w-full mb-0">
                  <Button onClick={loginWithPassword} className="w-full" disabled={loading}>
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </div>
              </>
            ) : otpStep === 'email' ? (
              <>
                <div className="flex flex-col gap-5 mb-6 w-full">
                  <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="text-base font-semibold text-blue-800 dark:text-blue-400">
                      Email Address
                    </label>
                    <Textbox
                      placeholder="Enter your email..."
                      onInput={setEmail}
                      value={email}
                      onKeyPress={handleKeyPress}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md px-3.5 py-3 mb-5 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="w-full mb-4">
                  <Button onClick={requestOTP} className="w-full" disabled={loading}>
                    {loading ? 'Sending Code...' : 'Send Login Code'}
                  </Button>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
                    🔐 We'll send a one-time code to your email for secure login
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-5 mb-6 w-full">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                      📧 We've sent a 6-digit code to:
                    </p>
                    <p className="font-semibold text-blue-900 dark:text-blue-200">{email}</p>
                    {countdown > 0 && (
                      <p className="text-xs text-blue-700 dark:text-blue-400 mt-2">
                        ⏱️ Code expires in: <span className="font-mono font-bold">{formatTime(countdown)}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="otp" className="text-base font-semibold text-blue-800 dark:text-blue-400">
                      Enter 6-Digit Code
                    </label>
                    <Textbox
                      placeholder="000000"
                      onInput={(value) => setOTP(value.replace(/\D/g, '').slice(0, 6))}
                      value={otp}
                      onKeyPress={handleKeyPress}
                      className="text-center text-2xl font-mono tracking-widest"
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md px-3.5 py-3 mb-5 text-sm font-medium">
                    {error}
                  </div>
                )}

                <div className="w-full space-y-3">
                  <Button onClick={verifyOTP} className="w-full" disabled={loading || otp.length !== 6}>
                    {loading ? 'Verifying...' : 'Verify & Login'}
                  </Button>

                  <div className="flex gap-3">
                    <button
                      onClick={resetToEmail}
                      className="flex-1 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      ← Change Email
                    </button>
                    <button
                      onClick={requestOTP}
                      disabled={loading || countdown > 540}
                      className="flex-1 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <a
                  href="/signup"
                  className="text-blue-800 dark:text-blue-400 no-underline font-semibold transition-colors duration-300 ease hover:text-blue-500 dark:hover:text-blue-300 hover:underline"
                >
                  Sign Up
                </a>
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-7 py-5 text-center bg-gray-50 dark:bg-gray-900">
            <p className="m-0 text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">
              Made by Harsh, Parag, Guntash, Allen & Kartik
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
