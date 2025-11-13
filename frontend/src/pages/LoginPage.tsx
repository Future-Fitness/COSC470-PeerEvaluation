import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import Textbox from '../components/Textbox';
import Button from '../components/Button';
import { tryLogin } from '../util/api';

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
  }

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
                />
              </div>
            </div>

            {error && <div className="ErrorMessage">{error}</div>}

            <Button
              onClick={()=> attemptLogin()}
              className="LoginButton"
              children="Sign In"
            />
          </div>

          <div className="LoginFooter">
            <p className="Credits">Made by Harsh, Parag, Guntash, Allen & Kartik</p>
          </div>
        </div>
      </div>
    </div>
  );
}
