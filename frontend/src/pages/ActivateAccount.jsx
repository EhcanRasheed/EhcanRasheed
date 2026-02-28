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
    background: '#0a0a0b',
    padding: '20px',
    fontFamily: "'Inter', sans-serif",
  },
  form: {
    backgroundColor: '#161618',
    borderRadius: '12px',
    padding: '48px 40px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    maxWidth: '420px',
    width: '100%',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  title: {
    fontSize: '28px',
    fontWeight: 800,
    background: '#c4a052',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '28px',
    letterSpacing: '-0.5px',
  },
  message: {
    fontSize: '14px',
    marginTop: '20px',
    padding: '16px',
    borderRadius: '12px',
    fontWeight: 500,
  },
  pendingMsg: {
    backgroundColor: 'rgba(196,160,82,0.06)',
    border: '1px solid rgba(196,160,82,0.15)',
    color: '#86868b',
  },
  successMsg: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    border: '1px solid rgba(34,197,94,0.25)',
    color: '#3faa72',
  },
  errorMsg: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.25)',
    color: '#dc4a4a',
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
    <div className="workspace" style={styles.container}>
      <div className="glass-card" style={styles.form}>
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
