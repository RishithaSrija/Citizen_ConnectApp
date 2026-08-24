'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Mail, Lock, User, Phone, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const { user, register, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push('/citizen/dashboard');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !phone) {
      setError('All fields are required.');
      return;
    }

    setError('');
    setSubmitting(true);

    const res = await register(name, email, password, phone);
    if (!res.success) {
      setError(res.error || 'Failed to create account.');
      setSubmitting(false);
    }
  };

  return (
    <div className="login-layout">
      <div className="login-card animate-fade-in" style={{ maxWidth: '480px' }}>
        <Link href="/" className="login-logo-group">
          <Sparkles size={26} style={{ color: 'var(--primary)' }} />
          <h3>Citizen Connect</h3>
        </Link>
        <span className="login-subtitle">Register a new citizen account to file and track neighborhood issues.</span>

        {error && (
          <div className="form-error-banner">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={16} />
              <input
                type="text"
                id="name"
                placeholder="Aria Sterling"
                value={name}
                onChange={e => setName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={16} />
              <input
                type="email"
                id="email"
                placeholder="aria@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Contact Number</label>
            <div className="input-icon-wrapper">
              <Phone className="input-icon" size={16} />
              <input
                type="tel"
                id="phone"
                placeholder="+1 555-0199"
                value={phone}
                onChange={e => setPhone(e.target.value)}
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
                placeholder="Minimum 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Register Account'}
          </button>
        </form>

        <span className="register-footer-text">
          Already have an account? <Link href="/login">Sign In</Link>
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
