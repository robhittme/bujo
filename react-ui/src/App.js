import { Routes, Route } from 'react-router-dom';

import './App.css';

import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="container">
      <Header />
      <Routes>
        <Route path="/*" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
    </div>
  );
}

export default App;
