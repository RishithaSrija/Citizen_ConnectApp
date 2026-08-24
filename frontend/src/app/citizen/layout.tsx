'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Home,
  PlusCircle,
  Bot,
  BarChart3,
  User,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
  Check
} from 'lucide-react';

export default function CitizenLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Authenticate user check
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'citizen') {
      router.push('/admin/dashboard');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="layout-loading">
        <div className="map-spinner" />
        <p>Checking authentication...</p>
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
    { title: 'Home', path: '/citizen/dashboard', icon: <Home size={18} /> },
    { title: 'Report', path: '/citizen/report', icon: <PlusCircle size={18} /> },
    { title: 'AI Chat', path: '/citizen/assistant', icon: <Bot size={18} /> },
    { title: 'Track', path: '/citizen/track', icon: <BarChart3 size={18} /> },
    { title: 'Profile', path: '/citizen/profile', icon: <User size={18} /> },
  ];

  const getPageTitle = () => {
    const matched = menuItems.find(item => pathname === item.path);
    return matched ? matched.title : 'CivicLink';
  };

  return (
    <div className="app-shell light-theme-only">
      {/* Sidebar Navigation (Desktop) */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <span className="logo-text-civic">CivicLink</span>
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
            <div className="profile-avatar-stitch">
              JD
            </div>
            <div className="profile-info-stitch">
              <span className="profile-name-stitch">John Doe</span>
              <span className="profile-id-stitch">Citizen ID: 4829</span>
            </div>
          </div>
          <button onClick={logout} className="btn btn-secondary btn-signout-stitch" title="Sign Out">
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <div className="main-content-stitch">
        {/* Top Navbar Header */}
        <header className="top-navbar-stitch">
          <div className="nav-header-left">
            <button className="hamburger-stitch" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="nav-civiclink-logo">CivicLink</span>
          </div>

          <div className="nav-header-right">
            {/* Notification Bell */}
            <div className="notif-bell-container-stitch" onClick={() => setNotifOpen(!notifOpen)}>
              <Bell size={20} style={{ color: 'var(--muted)' }} />
              {unreadCount > 0 && <span className="notif-badge-stitch" />}
            </div>

            {/* Notification Dropdown Drawer */}
            {notifOpen && (
              <div className="notif-dropdown-stitch animate-fade-in">
                <div className="notif-dropdown-header-stitch">
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="btn-mark-all-stitch">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="notif-dropdown-body-stitch">
                  {notifications.length === 0 ? (
                    <div className="notif-empty-stitch">No updates or notifications.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className={`notif-item-stitch ${notif.readStatus ? 'read' : 'unread'}`}>
                        <p className="notif-message-stitch">{notif.message}</p>
                        <div className="notif-meta-stitch">
                          <span className="notif-time-stitch">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                          {!notif.readStatus && (
                            <button onClick={() => markAsRead(notif.id)} className="btn-mark-read-stitch" title="Mark read">
                              <Check size={10} />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            
            <div className="top-user-avatar" onClick={() => router.push('/citizen/profile')}>
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" alt="Profile" />
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="main-content-scroll-stitch">{children}</main>

        {/* Bottom Mobile Navigation Bar */}
        <div className="bottom-nav-bar-stitch">
          {menuItems.map((item, idx) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={idx}
                href={item.path}
                className={`bottom-nav-item-stitch ${isActive ? 'active' : ''}`}
              >
                <div className="nav-capsule-stitch">
                  {item.icon}
                  {isActive && <span className="nav-capsule-text">{item.title}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
