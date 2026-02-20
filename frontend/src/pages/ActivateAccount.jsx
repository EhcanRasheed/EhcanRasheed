import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f5f1ed',
    padding: '20px',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '30px',
  },
  message: {
    fontSize: '16px',
    marginTop: '20px',
    padding: '16px',
    borderRadius: '10px',
    color: '#000',
  },
  pendingMsg: {
    backgroundColor: '#ecf0f1',
    border: '2px solid #95a5a6',
    color: '#2c3e50',
  },
  successMsg: {
    backgroundColor: '#d5f4e6',
    border: '2px solid #27ae60',
    color: '#27ae60',
  },
  errorMsg: {
    backgroundColor: '#fadbd8',
    border: '2px solid #e74c3c',
    color: '#c0392b',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
};

export default function ActivateAccount() {
  const query = useQuery();
  const token = query.get('token');
  const { activateAccount } = useAuth();
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Missing activation token');
        return;
      }
      try {
        const res = await activateAccount(token);
        setStatus('success');
        setMessage(res.message || 'Account activated. Redirecting to login...');
        // optionally redirect to login after short delay
        setTimeout(() => navigate('/login'), 2500);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.message || err.message || 'Activation failed');
      }
    };
    run();
  }, [token, activateAccount, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h2 style={styles.title}>✉️ Activate Account</h2>
        <div style={{ ...styles.icon }}>
          {status === 'pending' && '⏳'}
          {status === 'success' && '✅'}
          {status === 'error' && '❌'}
        </div>
        <div style={{ 
          ...styles.message,
          ...(status === 'pending' ? styles.pendingMsg : {}),
          ...(status === 'success' ? styles.successMsg : {}),
          ...(status === 'error' ? styles.errorMsg : {})
        }}>
          {status === 'pending' && 'Activating your account...'}
          {status === 'success' && message}
          {status === 'error' && message}
        </div>
      </div>
    </div>
  );
}
