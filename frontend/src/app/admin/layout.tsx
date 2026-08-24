'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  ClipboardList,
  MessageSquare,
  Users,
  Building,
  Settings,
  LogOut,
  Menu,
  X,
  Lock,
  Bell
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authenticate admin check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'admin') {
      router.push('/citizen/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="layout-loading">
        <div className="map-spinner" />
        <p>Checking admin privileges...</p>
        <style jsx>{`
          .layout-loading {
            height: 100vh;
            width: 100vw;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            background-color: var(--background);
          }
        `}</style>
      </div>
    );
  }

  const menuItems = [
    { title: 'Home', path: '/admin/dashboard', icon: <BarChart3 size={18} /> },
    { title: 'Reports', path: '/admin/complaints', icon: <ClipboardList size={18} /> },
    { title: 'AI Chat', path: '/admin/chat', icon: <MessageSquare size={18} /> },
    { title: 'Track', path: '/admin/users', icon: <Users size={18} /> },
    { title: 'Departments', path: '/admin/departments', icon: <Building size={18} /> },
    { title: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  const getPageTitle = () => {
    const matched = menuItems.find(item => pathname === item.path);
    return matched ? matched.title : 'Admin Management Portal';
  };

  return (
    <div className="app-shell light-theme-only">
      {/* Sidebar Navigation */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <Lock size={18} style={{ color: 'var(--primary)' }} />
          <span className="logo-text-civic">Admin Panel</span>
        </div>
        <nav className="sidebar-menu">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={idx}
                href={item.path}
                className={`menu-item-stitch ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer-stitch">
          <div className="user-profile-summary-stitch">
            <div className="profile-avatar-stitch" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
              AD
            </div>
            <div className="profile-info-stitch">
              <span className="profile-name-stitch">{user.name}</span>
              <span className="profile-id-stitch">Chief Administrator</span>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-signout-stitch">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <div className="main-content-stitch">
        <header className="top-navbar-stitch">
          <div className="nav-header-left">
            <button className="hamburger-stitch" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="nav-civiclink-logo">CivicLink Admin</span>
          </div>

          <div className="nav-header-right">
            <div className="notif-bell-container-stitch">
              <Bell size={20} style={{ color: 'var(--muted)' }} />
            </div>
            <div className="top-user-avatar">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" alt="Admin" />
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="main-content-scroll-stitch">{children}</main>
      </div>
    </div>
  );
}
