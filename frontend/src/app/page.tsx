'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, ShieldCheck, MapPin, Bot, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="landing-layout">
      {/* Navbar header */}
      <header className="landing-header container animate-fade-in">
        <div className="logo-group">
          <Sparkles size={24} style={{ color: 'var(--primary)' }} />
          <span className="logo-title">Citizen Connect</span>
        </div>
        <div className="nav-buttons">
          <Link href="/login" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Sign In
          </Link>
          <Link href="/register" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Register
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section container">
        <div className="hero-content animate-fade-in">
          <div className="hero-tag">
            <Sparkles size={12} />
            <span>AI-Powered Civic Management</span>
          </div>
          <h1>Empowering Communities through Smart Grievance Resolution</h1>
          <p>
            Report local civic issues, receive instant AI diagnostics, track work orders in real-time, and monitor neighborhood progress on an interactive map.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-primary" style={{ padding: '14px 28px' }}>
              <span>Get Started</span>
              <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn btn-secondary" style={{ padding: '14px 28px' }}>
              Citizen / Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="stats-section container animate-fade-in">
        <div className="stats-grid">
          <div className="stat-card">
            <h3>4,820+</h3>
            <p>Issues Resolved</p>
          </div>
          <div className="stat-card">
            <h3>98.2%</h3>
            <p>Department Accuracy</p>
          </div>
          <div className="stat-card">
            <h3>34 Hours</h3>
            <p>Avg Resolution Speed</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section container">
        <h2 className="section-title animate-fade-in">Designed for Modern Communities</h2>
        
        <div className="features-grid">
          <div className="feature-card animate-fade-in">
            <div className="f-icon-box blue"><Bot size={22} /></div>
            <h3>AI Complaint Summarizer</h3>
            <p>Converts detailed statements into brief updates, detects severity, and auto-routes issues to municipal departments.</p>
          </div>

          <div className="feature-card animate-fade-in">
            <div className="f-icon-box cyan"><MapPin size={22} /></div>
            <h3>Interactive Geo-Mapping</h3>
            <p>Explore resolved and active reports in your neighborhood. Filter cases by department and status overlay pins.</p>
          </div>

          <div className="feature-card animate-fade-in">
            <div className="f-icon-box purple"><ShieldCheck size={22} /></div>
            <h3>Real-time Status Tracking</h3>
            <p>Follow a structured audit timeline (Submitted, In Progress, Resolved) with notes sent by assigned municipal crews.</p>
          </div>

          <div className="feature-card animate-fade-in">
            <div className="f-icon-box green"><Users size={22} /></div>
            <h3>Government Action overrides</h3>
            <p>Allows municipal operators to review, reassign workloads, record resolution windows, and inspect analytics.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer container">
        <p>© 2026 Citizen Connect Platform. Built for active public service.</p>
      </footer>

      <style jsx>{`
        .landing-layout {
          min-height: 100vh;
          background: radial-gradient(circle at 10% 20%, rgba(99, 102, 241, 0.05) 0%, transparent 40%),
                      radial-gradient(circle at 90% 80%, rgba(6, 182, 212, 0.05) 0%, transparent 40%);
          display: flex;
          flex-direction: column;
        }

        .landing-header {
          height: 80px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-title {
          font-size: 18px;
          font-weight: 800;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .nav-buttons {
          display: flex;
          gap: 12px;
        }

        .hero-section {
          padding: 80px 24px;
          text-align: center;
          display: flex;
          justify-content: center;
        }

        .hero-content {
          max-width: 800px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }

        .hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 16px;
          background-color: var(--primary-light);
          color: var(--primary);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.02em;
          text-transform: uppercase;
        }

        .hero-content h1 {
          font-size: 46px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.03em;
        }

        @media (max-width: 600px) {
          .hero-content h1 {
            font-size: 32px;
          }
        }

        .hero-content p {
          font-size: 18px;
          max-width: 650px;
          color: var(--muted);
          line-height: 1.6;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-top: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* Stats styling */
        .stats-section {
          padding: 24px;
          margin-bottom: 40px;
        }

        .stats-grid {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 32px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          text-align: center;
          box-shadow: var(--shadow-md);
        }

        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .stat-card h3 {
          font-size: 32px;
          font-weight: 800;
          color: var(--primary);
        }

        .stat-card p {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          margin-top: 4px;
        }

        /* Features Section */
        .features-section {
          padding: 60px 24px;
        }

        .section-title {
          font-size: 28px;
          font-weight: 800;
          text-align: center;
          margin-bottom: 48px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 24px;
        }

        .feature-card {
          background-color: var(--card);
          border: 1px solid var(--card-border);
          border-radius: var(--radius-lg);
          padding: 32px;
          box-shadow: var(--shadow-sm);
          transition: all var(--transition-normal);
        }

        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg), var(--shadow-glow);
          border-color: rgba(99, 102, 241, 0.25);
        }

        .f-icon-box {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        }

        .f-icon-box.blue { background-color: rgba(99, 102, 241, 0.1); color: var(--primary); }
        .f-icon-box.cyan { background-color: rgba(6, 182, 212, 0.1); color: var(--accent); }
        .f-icon-box.purple { background-color: rgba(168, 85, 247, 0.1); color: hsl(271, 91%, 65%); }
        .f-icon-box.green { background-color: rgba(16, 185, 129, 0.1); color: var(--status-resolved); }

        .feature-card h3 {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .feature-card p {
          font-size: 13.5px;
          color: var(--muted);
          line-height: 1.5;
        }

        .landing-footer {
          margin-top: auto;
          padding: 32px 24px;
          text-align: center;
          border-top: 1px solid var(--card-border);
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
