import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

function Login() {
  const { setAuth } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const signIn = async (username, password) => {
    try {
      const res = await fetch('http://localhost:4444/auth/sign-in',
        {
          method: 'POST',
          headers: {
            'content-Type': 'application/json'
          },
          body: JSON.stringify({ username, password })
        })
      const t = await res.json();
      const accessToken = t.token;
      console.log({accessToken})
      setAuth({ accessToken })
      navigate('/dashboard', { state: { from: location }, replace: true})
    } catch (err) {
      throw new Error(err)
    }

  }
  const handleSubmit = (event) => {
    event.preventDefault();
    signIn(username, password);
    console.log(`Username: ${username} Password: ${password}`);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="formBasicUsername" className='form-control'>
        <Form.Control type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
      </Form.Group>

      <Form.Group controlId="formBasicPassword" className='form-control'>
        <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Form.Group>

      <Button variant="primary" type="submit">
        Submit
    </Button>
    </Form>
  );
}

export default Login;

