import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { authApi } from '../../services/authApi';
import {
  LayoutDashboard,
  Users,
  FileText,
  ArrowLeft,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { Logo } from '../common/Logo';

export const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth || {});
  const [mobileOpen, setMobileOpen] = useState(false);

  // Exact 3 primary admin routes requested by user
  const adminNavItems = [
    { id: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: '/admin/users', label: 'Student Record', icon: Users },
    { id: '/admin/notes', label: 'Notes Repository', icon: FileText },
  ];

  const isNavActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch(logoutAction());
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row antialiased text-slate-900 dark:text-slate-100">
      {/* ================= DESKTOP ADMIN SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 shrink-0 sticky top-0 h-screen select-none border-r border-slate-800 z-30">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-black text-sm shadow-xs">
              A
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white block">Quick NIU Notes</span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                Admin  
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 space-y-1">
          <div className="px-3 py-2 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Administration
          </div>
          <nav className="space-y-1.5">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = isNavActive(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-[var(--primary)] text-white shadow-xs font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          {/* Switch to Student Mode */}
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-slate-700/60"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
            <span>Switch to Student App</span>
          </button>

          {/* User profile & logout */}
          <div className="pt-2 flex items-center justify-between px-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@portal'}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE HEADER & DRAWER ================= */}
      <div className="md:hidden bg-slate-900 text-white border-b border-slate-800 px-4 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center font-black text-xs">
            A
          </div>
          <span className="font-bold text-sm">Admin Console</span>
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-300 hover:text-white"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 p-4 space-y-2 z-40">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                  active ? 'bg-[var(--primary)] text-white' : 'text-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-xs text-indigo-400 flex items-center gap-1 font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Student App</span>
            </button>
            <button onClick={handleLogout} className="text-xs text-rose-400 font-semibold">
              Logout
            </button>
          </div>
        </div>
      )}

      {/* ================= MAIN ADMIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 hidden md:flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-[11px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 rounded-md flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>System Administrator</span>
            </span>
            <span className="text-xs text-slate-400 hidden lg:inline">
              University Study Notes & Records Control Hub
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              {user?.email}
            </span>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="text-xs text-[var(--primary)] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Exit Admin</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </header>

        {/* Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
