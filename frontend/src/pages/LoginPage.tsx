import { useState } from 'react';
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

const TEST_CREDENTIALS: TestCredential[] = [
  { username: 'test', password: '1234', role: 'Student', description: 'Test Student Account' },
  { username: 'test2', password: '1234', role: 'Teacher', description: 'Test Teacher Account' },
  { username: 'alice', password: 'password123', role: 'Student', description: 'Alice (Student)' },
  { username: 'professor', password: 'password123', role: 'Teacher', description: 'Professor Account' },
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showQuickLogin, setShowQuickLogin] = useState(false);
  const navigate = useNavigate();

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
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-800 to-blue-500 p-5">
      <div className="flex flex-col items-center justify-center w-full max-w-[450px]">
        <div className="flex flex-col items-stretch justify-start w-full bg-white rounded-xl shadow-2xl overflow-hidden min-h-[480px]">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white px-7 py-10 pb-7 text-center">
            <h1 className="mb-2 text-4xl font-bold text-white tracking-tight">Peer Evaluation</h1>
            <p className="m-0 text-base text-white/80 font-normal">Collaborative Peer Review Platform</p>
          </div>

          <div className="flex flex-col p-7 flex-1">
            <div className="flex flex-col gap-5 mb-6 w-full">
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-base font-semibold text-blue-800">Username</label>
                <Textbox
                  placeholder='Enter your username...'
                  onInput={setUsername}
                  className='px-3.5 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 ease bg-white focus:outline-none focus:border-blue-500 focus:bg-blue-50 focus:ring-2 focus:ring-blue-500/50'
                  value={username}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password">Password</label>
                <Textbox
                  type='password'
                  placeholder='Enter your password...'
                  onInput={setPassword}
                  className='px-3.5 py-3 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 ease bg-white focus:outline-none focus:border-blue-500 focus:bg-blue-50 focus:ring-2 focus:ring-blue-500/50'
                  onKeyPress={handleKeyPress}
                  value={password}
                />
              </div>
            </div>

            {error && <div className="text-red-600 bg-red-100 border border-red-300 rounded-md px-3.5 py-3 mb-5 text-sm font-medium">{error}</div>}

            <div className="w-full mb-0">
              <Button
                onClick={()=> attemptLogin()}
                className="w-full bg-gradient-to-br from-blue-800 to-blue-500 text-white py-3 px-6 text-base font-semibold border-none rounded-lg cursor-pointer transition-all duration-300 ease hover:-translate-y-0.5 hover:shadow-lg hover:brightness-105"
              >
                Sign In
              </Button>
            </div>

            <div className="text-center mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Don't have an account? <a href="/signup" className="text-blue-800 no-underline font-semibold transition-colors duration-300 ease hover:text-blue-500 hover:underline">Sign Up</a></p>
            </div>

            <div className="mt-5 pt-5 border-t border-gray-200">
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => setShowQuickLogin(!showQuickLogin)}
                  className="flex items-center justify-between w-full cursor-pointer bg-transparent border-none p-0 font-sans text-gray-500 hover:text-blue-600 transition-colors"
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
                      className="flex flex-col items-start bg-gray-50 border border-gray-200 rounded-lg p-3 cursor-pointer transition-all duration-200 ease text-left font-sans hover:bg-blue-50 hover:border-blue-500 hover:-translate-y-0.5 hover:shadow-md"
                      onClick={() => quickLogin(cred)}
                    >
                      <div className="text-xs font-bold text-white bg-gradient-to-br from-blue-800 to-blue-500 py-1 px-2 rounded uppercase tracking-wider mb-1.5 self-start">{cred.role}</div>
                      <div className="text-sm text-gray-800 mb-1 font-semibold">{cred.description}</div>
                      <div className="text-xs text-gray-500 font-mono">
                        <span className="text-blue-800 font-semibold">{cred.username}</span> / <span className="text-blue-800 font-semibold">{cred.password}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-7 py-5 text-center bg-gray-50">
            <p className="m-0 text-sm text-gray-500 font-medium tracking-wide">Made by Harsh, Parag, Guntash, Allen & Kartik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
