import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
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
    <div className="LoginPage">
      <div className="LoginContainer">
        <div className="LoginBlock">
          <div className="LoginHeader">
            <h1 className="AppTitle">Peer Evaluation</h1>
            <p className="AppSubtitle">Collaborative Peer Review Platform</p>
          </div>

          <div className="LoginForm">
            <div className="LoginInputs">
              <div className="LoginInputChunk">
                <label htmlFor="username">Username</label>
                <Textbox
                  placeholder='Enter your username...'
                  onInput={setUsername}
                  className='LoginInput'
                  value={username}
                />
              </div>

              <div className="LoginInputChunk">
                <label htmlFor="password">Password</label>
                <Textbox
                  type='password'
                  placeholder='Enter your password...'
                  onInput={setPassword}
                  className='LoginInput'
                  onKeyPress={handleKeyPress}
                  value={password}
                />
              </div>
            </div>

            {error && <div className="ErrorMessage">{error}</div>}

            <Button
              onClick={()=> attemptLogin()}
              className="LoginButton"
              children="Sign In"
            />

            <div className="LoginFooterLink">
              <p>Don't have an account? <a href="/signup">Sign Up</a></p>
            </div>

            <div className="QuickLoginSection">
              <div className="QuickLoginHeader">
                <span className="QuickLoginTitle">Quick Login (Test Accounts)</span>
              </div>
              <div className="QuickLoginGrid">
                {TEST_CREDENTIALS.map((cred, index) => (
                  <button
                    key={index}
                    type="button"
                    className="QuickLoginCard"
                    onClick={() => quickLogin(cred)}
                  >
                    <div className="QuickLoginRole">{cred.role}</div>
                    <div className="QuickLoginDescription">{cred.description}</div>
                    <div className="QuickLoginCredentials">
                      <span>{cred.username}</span> / <span>{cred.password}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="LoginFooter">
            <p className="Credits">Made by Harsh, Parag, Guntash, Allen & Kartik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
