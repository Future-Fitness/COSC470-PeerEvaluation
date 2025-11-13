import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SignupPage.css';
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
    <div className="SignupPage">
      <div className="SignupContainer">
        <div className="SignupBlock">
          <div className="SignupHeader">
            <h1 className="AppTitle">Peer Evaluation</h1>
            <p className="AppSubtitle">Create Your Account</p>
          </div>

          <div className="SignupForm">
            <div className="SignupInputs">
              <div className="SignupInputChunk">
                <label htmlFor="username">Username</label>
                <Textbox
                  placeholder='Choose a username...'
                  onInput={setUsername}
                  className='SignupInput'
                />
              </div>

              <div className="SignupInputChunk">
                <label htmlFor="email">Email</label>
                <Textbox
                  type='email'
                  placeholder='Enter your email...'
                  onInput={setEmail}
                  className='SignupInput'
                />
              </div>

              <div className="SignupInputChunk">
                <label htmlFor="password">Password</label>
                <Textbox
                  type='password'
                  placeholder='Create a password...'
                  onInput={setPassword}
                  className='SignupInput'
                />
              </div>

              <div className="SignupInputChunk">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <Textbox
                  type='password'
                  placeholder='Confirm your password...'
                  onInput={setConfirmPassword}
                  className='SignupInput'
                  onKeyPress={handleKeyPress}
                />
              </div>
            </div>

            {error && <div className="ErrorMessage">{error}</div>}
            {success && <div className="SuccessMessage">{success}</div>}

            <Button
              onClick={() => attemptSignup()}
              children="Create Account"
            />

            <div className="SignupFooterLink">
              <p>Already have an account? <a href="/">Sign In</a></p>
            </div>
          </div>

          <div className="SignupFooter">
            <p className="Credits">Made by Harsh, Parag, Guntash, Allen & Kartik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
