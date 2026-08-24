'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, AlertCircle, Shield, User } from 'lucide-react';

export default function LoginPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if session is already active
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/citizen/dashboard');
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError('');
    setSubmitting(true);

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Authentication failed. Please verify credentials.');
      setSubmitting(false);
    }
  };

  // Quick Login Helpers
  const handleQuickLogin = async (role: 'citizen' | 'admin') => {
    setError('');
    setSubmitting(true);

    const targetEmail = role === 'admin' ? 'admin@citizenconnect.gov' : 'citizen@gmail.com';
    const targetPass = role === 'admin' ? 'admin123' : 'citizen123';

    setEmail(targetEmail);
    setPassword(targetPass);

    const res = await login(targetEmail, targetPass);
    if (!res.success) {
      setError(res.error || 'Authentication failed.');
      setSubmitting(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-card animate-fade-in">
        <Link href="/" className="login-logo-group">
          <Sparkles size={26} style={{ color: 'var(--primary)' }} />
          <h3>Citizen Connect</h3>
        </Link>
        <span className="login-subtitle">Access your citizen dashboard or administrator console.</span>

        {error && (
          <div className="form-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={16} />
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-divider">
          <span>or testing quick-links</span>
        </div>

        {/* Quick Testing buttons */}
        <div className="quick-login-buttons">
          <button
            type="button"
            className="btn btn-secondary btn-quick"
            onClick={() => handleQuickLogin('citizen')}
            disabled={submitting}
          >
            <User size={16} />
            <span>Quick Citizen Login</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-quick"
            onClick={() => handleQuickLogin('admin')}
            disabled={submitting}
          >
            <Shield size={16} style={{ color: 'var(--primary)' }} />
            <span>Quick Admin Login</span>
          </button>
        </div>

        <span className="register-footer-text">
          New to Citizen Connect? <Link href="/register">Create citizen account</Link>
        </span>
      </div>

      <style jsx>{`
        .login-layout {
          height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.06) 0%, transparent 60%);
          padding: 24px;
        }

        .login-card {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 40px;
          max-width: 440px;
          width: 100%;
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-logo-group {
          display: flex;
          align-items: center;
          gap: 8px;
          justify-content: center;
          align-self: center;
        }

        .login-logo-group h3 {
          font-size: 20px;
          font-weight: 800;
        }

        .login-subtitle {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .input-icon-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
        }

        .form-error-banner {
          background-color: var(--priority-high-bg);
          color: var(--priority-high);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
        }

        .login-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--muted);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          margin: 10px 0;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--muted-light);
        }

        .login-divider:not(:empty)::before {
          margin-right: 10px;
        }

        .login-divider:not(:empty)::after {
          margin-left: 10px;
        }

        .quick-login-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .btn-quick {
          justify-content: center;
          font-size: 12.5px;
          padding: 10px;
          background-color: var(--card-hover);
        }

        .btn-quick:hover {
          border-color: var(--primary);
        }

        .register-footer-text {
          font-size: 13px;
          color: var(--muted);
          text-align: center;
          margin-top: 12px;
        }

        .register-footer-text a {
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
