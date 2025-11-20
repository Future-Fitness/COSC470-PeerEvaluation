import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Textbox from '../components/Textbox';
import Button from '../components/Button';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const validateForm = () => {
    if (!username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }
    if (!password) {
      setError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const attemptSignup = async () => {
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    try {
      // For now, this is a placeholder. Connect to actual signup endpoint when available
      setSuccess('Signup functionality coming soon! Please use test credentials to login.');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (err) {
      setError('An error occurred during signup');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      attemptSignup();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full bg-gradient-to-br from-blue-800 to-blue-500 dark:from-gray-900 dark:to-gray-800 p-5">
      <div className="flex flex-col items-center justify-center w-full max-w-[450px]">
        <div className="flex flex-col items-stretch justify-start w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden min-h-[480px]">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 dark:from-gray-700 dark:to-gray-900 text-white dark:text-gray-100 px-7 py-10 pb-7 text-center">
            <h1 className="mb-2 text-4xl font-bold tracking-tight">Peer Evaluation</h1>
            <p className="m-0 text-base font-normal">Create Your Account</p>
          </div>

          <div className="flex flex-col p-7 flex-1">
            <div className="flex flex-col gap-5 mb-6 w-full">
              <div className="flex flex-col gap-2">
                <label htmlFor="username" className="text-base font-semibold text-blue-800 dark:text-blue-400">Username</label>
                <Textbox
                  placeholder='Choose a username...'
                  onInput={setUsername}
                  value={username}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-base font-semibold text-blue-800 dark:text-blue-400">Email</label>
                <Textbox
                  type='email'
                  placeholder='Enter your email...'
                  onInput={setEmail}
                  value={email}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="text-base font-semibold text-blue-800 dark:text-blue-400">Password</label>
                <Textbox
                  type='password'
                  placeholder='Create a password...'
                  onInput={setPassword}
                  value={password}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-base font-semibold text-blue-800 dark:text-blue-400">Confirm Password</label>
                <Textbox
                  type='password'
                  placeholder='Confirm your password...'
                  onInput={setConfirmPassword}
                  onKeyPress={handleKeyPress}
                  value={confirmPassword}
                />
              </div>
            </div>

            {error && <div className="text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md px-3.5 py-3 mb-5 text-sm font-medium">{error}</div>}
            {success && <div className="text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 rounded-md px-3.5 py-3 mb-5 text-sm font-medium">{success}</div>}

            <Button
              onClick={() => attemptSignup()}
              className="w-full"
            >
              Create Account
            </Button>

            <div className="text-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Already have an account? <a href="/" className="text-blue-800 dark:text-blue-400 no-underline font-semibold transition-colors duration-300 ease hover:text-blue-500 dark:hover:text-blue-300 hover:underline">Sign In</a></p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 px-7 py-5 text-center bg-gray-50 dark:bg-gray-900">
            <p className="m-0 text-sm text-gray-500 dark:text-gray-400 font-medium tracking-wide">Made by Harsh, Parag, Guntash, Allen & Kartik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
