import { useState, useMemo } from 'react'; // Added useMemo
import { useNavigate } from 'react-router-dom';
import Textbox from '../components/Textbox';
import Button from '../components/Button';
import { tryLogin } from '../util/api';

interface TestCredential {
  username: string;
  password: string;
  role: string;
  description: string;
}

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const navigate = useNavigate();

  // Load TEST_CREDENTIALS from environment variable if available
  const TEST_CREDENTIALS: TestCredential[] = useMemo(() => {
    try {
      const envCreds = import.meta.env.VITE_TEST_CREDENTIALS;
      return envCreds ? JSON.parse(envCreds) : [];
    } catch (e) {
      console.error('Failed to parse VITE_TEST_CREDENTIALS:', e);
      return [];
    }
  }, []);

  const attemptLogin = async () => {
    setError(''); // Clear any previous errors
    const result = await tryLogin(username, password);

    if (result.error) {
      setError(result.message);
      return;
    }

    if (result.token) {
      navigate('/home');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      attemptLogin();
    }
  };

  const quickLogin = async (cred: TestCredential) => {
    setUsername(cred.username);
    setPassword(cred.password);
    setError('');
    const result = await tryLogin(cred.username, cred.password);

    if (result.error) {
      setError(result.message);
      return;
    }

    if (result.token) {
      navigate('/home');
    }
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
            <div className="flex flex-col gap-5 mb-6 w-full">
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-base font-semibold text-blue-800 dark:text-blue-400">Username</label>
                <Textbox
                  placeholder='Enter your username...'
                  onInput={setUsername}
                  value={username}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-base font-semibold text-blue-800 dark:text-blue-400">Password</label>
                <Textbox
                  type='password'
                  placeholder='Enter your password...'
                  onInput={setPassword}
                  onKeyPress={handleKeyPress}
                  value={password}
                />
              </div>
            </div>

            {error && <div className="text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md px-3.5 py-3 mb-5 text-sm font-medium">{error}</div>}

            <div className="w-full mb-0">
              <Button
                onClick={()=> attemptLogin()}
                className="w-full"
              >
                Sign In
              </Button>
            </div>

            <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Don't have an account? <a href="/signup" className="text-blue-800 dark:text-blue-400 no-underline font-semibold transition-colors duration-300 ease hover:text-blue-500 dark:hover:text-blue-300 hover:underline">Sign Up</a></p>
            </div>

            {TEST_CREDENTIALS.length > 0 && ( // Conditionally render Quick Login section
              <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-700">
                <div className="mb-3">
                  <button
                    type="button"
                    onClick={() => setShowQuickLogin(!showQuickLogin)}
                    className="flex items-center justify-between w-full cursor-pointer bg-transparent border-none p-0 font-sans text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <span className="text-sm font-semibold uppercase tracking-wider">Quick Login (Test Accounts)</span>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showQuickLogin ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="grid grid-cols-2 gap-[10px]">
                    {TEST_CREDENTIALS.map((cred, index) => (
                      <button
                        key={index}
                        type="button"
                        className="flex flex-col items-start bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer transition-all duration-200 ease text-left font-sans hover:bg-blue-50 dark:hover:bg-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-md"
                        onClick={() => quickLogin(cred)}
                      >
                        <div className="text-xs font-bold text-white bg-gradient-to-br from-blue-800 to-blue-500 dark:from-gray-700 dark:to-gray-900 py-1 px-2 rounded uppercase tracking-wider mb-1.5 self-start">{cred.role}</div>
                        <div className="text-sm text-gray-800 dark:text-gray-100 mb-1 font-semibold">{cred.description}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                          <span className="text-blue-800 dark:text-blue-400 font-semibold">{cred.username}</span> / <span className="text-blue-800 dark:text-blue-400 font-semibold">{cred.password}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-7 py-5 text-center bg-gray-50 dark:bg-gray-900">
            <p className="m-0 text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">Made by Harsh, Parag, Guntash, Allen & Kartik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
