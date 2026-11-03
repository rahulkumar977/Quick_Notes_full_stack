import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Logo } from '../common/Logo';
import { logout as logoutAction } from '../../store/slices/authSlice';
import { toggleTheme, selectThemeMode } from '../../store/slices/themeSlice';
import { authApi } from '../../services/authApi';
 
import {
  LayoutDashboard,
  GraduationCap,
  FolderOpen,
  Briefcase,
  Bookmark,
  BookMarked,
  Compass,
  Settings,
  HelpCircle,
  Bell, 
  Menu,
  X,
  LogOut,
  ChevronDown,
  ExternalLink,
  Sun,
  Moon,
  RefreshCw,
  Video,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchMyCourses } from '../../store/slices/courseSlice';
import {
  setSearchQuery,
  setSelectedCourseId,
  setSelectedSemesterNum,
  setSortBy,
  resetFilters,
  selectExploreCourses,
  selectExploreFilters,
  selectFilteredExploreNotes,
  selectSavedNoteIds,
  selectEnrolledCourseIds,
  fetchExploreData,
} from '../../store/slices/exploreSlice';
import { fetchDashboardStats } from '../../store/slices/dashboardSlice';
import { ExploreFilterBar } from '../student/exploreNotes/ExploreFilterBar';

export const StudentLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const themeMode = useSelector(selectThemeMode);
  const { user: authUser, role: currentRole } = useSelector((state) => state.auth);
  const user = authUser || CURRENT_STUDENT;

  const courses = useSelector(selectExploreCourses);
  const filters = useSelector(selectExploreFilters);
  const filteredNotes = useSelector(selectFilteredExploreNotes);
  const savedNoteIds = useSelector(selectSavedNoteIds) || [];
  const enrolledCourseIds = useSelector(selectEnrolledCourseIds) || [];

  // Ensure explore courses/notes catalog is loaded for the search & filter
  useEffect(() => {
    if (!courses || courses.length === 0) {
      dispatch(fetchExploreData());
    }
  }, [dispatch, courses]);

  // Navigate to /student/explore when user searches or filters from another page
  const handleSearchChange = (val) => {
    dispatch(setSearchQuery(val));
    if (location.pathname !== '/student/explore' && val.trim().length > 0) {
      navigate('/student/explore');
    }
  };

  const handleCourseChange = (val) => {
    dispatch(setSelectedCourseId(val));
    if (location.pathname !== '/student/explore') {
      navigate('/student/explore');
    }
  };

  const handleSemesterChange = (val) => {
    dispatch(setSelectedSemesterNum(val));
    if (location.pathname !== '/student/explore') {
      navigate('/student/explore');
    }
  };

  const handleSortChange = (val) => {
    dispatch(setSortBy(val));
    if (location.pathname !== '/student/explore') {
      navigate('/student/explore');
    }
  };


  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [globalRefreshing, setGlobalRefreshing] = useState(false);

  const handleGlobalRefresh = async () => {
    setGlobalRefreshing(true);
    try {
      window.dispatchEvent(new CustomEvent('app:refresh'));
      const promises = [dispatch(fetchExploreData())];
      if (
        location.pathname.startsWith('/student/my-study') ||
        location.pathname.startsWith('/student/add-notes') ||
        location.pathname.startsWith('/student/dashboard')
      ) {
        promises.push(dispatch(fetchMyCourses()));
        promises.push(dispatch(fetchDashboardStats()));
      }
      await Promise.allSettled(promises);
      toast.success('Page refreshed');
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => setGlobalRefreshing(false), 500);
    }
  };

  const mainNavItems = [
    { id: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: '/student/add-notes', label: 'Add Notes', icon: FolderOpen },
    { id: '/student/my-study', label: 'My Study', icon: GraduationCap },
    { id: '/student/saved-notes', label: 'Saved Notes', icon: Bookmark, badge: savedNoteIds.length },
    { id: '/student/enrolled-notes', label: 'Enrolled Notes', icon: BookMarked, badge: enrolledCourseIds.length },
    { id: '/student/meetings', label: 'Study Rooms', icon: Video },
  ];

  const exploreNavItems = [
    { id: '/student/explore', label: 'Explore Notes', icon: Compass },
    { id: '/student/placement-notes', label: 'Placement Notes', icon: Briefcase },
  ];

 

  const isNavActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      dispatch(logoutAction());
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row antialiased text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 sticky top-0 h-screen shrink-0 z-30 select-none transition-colors duration-200">
        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <Logo onClick={() => navigate('/')} />
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* MAIN SECTION */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Main
            </div>
            <nav className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-colors cursor-pointer rounded-xl ${
                      active
                        ? 'bg-primary-light text-primary-dark dark:bg-primary-dark/40 dark:text-yellow-200 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-primary dark:text-yellow-300' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        active ? 'bg-primary/20 text-primary-dark dark:bg-primary/40 dark:text-yellow-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* EXPLORE SECTION */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
              Explore
            </div>
            <nav className="space-y-1">
              {exploreNavItems.map((item) => {
                const Icon = item.icon;
                const active = isNavActive(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary-light text-primary-dark dark:bg-primary-dark/40 dark:text-yellow-200 font-semibold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? 'text-primary dark:text-yellow-300' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* BOTTOM SECTION & USER PROFILE */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
            <button
              onClick={() => navigate('/student/settings')}
              className="flex items-center gap-1.5 hover:text-primary dark:hover:text-yellow-300 cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              onClick={() => dispatch(toggleTheme())}
              className="flex items-center gap-1.5 hover:text-primary dark:hover:text-yellow-300 cursor-pointer"
              title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {themeMode === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Dark</span>
                </>
              )}
            </button>
          </div>

          {/* Current Student Profile Box */}
          <div className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-primary/20 dark:ring-primary/40 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-primary-light dark:bg-primary-dark/40 border border-primary-border/60 dark:border-primary/40 text-primary-dark dark:text-yellow-200 font-bold text-xs flex items-center justify-center shrink-0">
                  {user?.name?.[0]?.toUpperCase() || 'S'}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.academicCourseCode}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex">
          {/* Backdrop click to dismiss */}
          <div
            className="fixed inset-0"
            onClick={() => setMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl p-4 z-10 border-r border-slate-200/80 dark:border-slate-800 transition-colors">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <Logo onClick={() => { navigate('/student/dashboard'); setMobileSidebarOpen(false); }} />
              <button
                type="button"
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav list */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-1">Main</p>
                {mainNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        navigate(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-primary-light text-primary-dark dark:bg-primary-dark/40 dark:text-yellow-200 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${active ? 'text-primary dark:text-yellow-300' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-1">Explore</p>
                {exploreNavItems.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        navigate(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                        active
                          ? 'bg-primary-light text-primary-dark dark:bg-primary-dark/40 dark:text-yellow-200 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-primary dark:text-yellow-300' : 'text-slate-400 dark:text-slate-500'}`} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Preferences / Quick links */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1">
                <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-1">Preferences</p>

                {/* Mobile Appearance Toggle */}
                <button
                  type="button"
                  onClick={() => dispatch(toggleTheme())}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    {themeMode === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-400" />
                    )}
                    <span>Appearance</span>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {themeMode === 'dark' ? 'Dark' : 'Light'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate('/student/settings');
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    isNavActive('/student/settings')
                      ? 'bg-primary-light text-primary-dark dark:bg-primary-dark/40 dark:text-yellow-200 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate('/');
                    setMobileSidebarOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 text-slate-400" />
                  <span>Help & Support</span>
                </button>
              </div>
            </div>

            {/* User Profile & Logout */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                {user?.avatar ? (
                  <img src={user.avatar} className="w-9 h-9 rounded-full object-cover ring-2 ring-primary/20 dark:ring-primary/40 shrink-0" alt={user.name || 'User'} />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-light dark:bg-primary-dark/40 border border-primary-border/60 dark:border-primary/40 text-primary-dark dark:text-yellow-200 font-bold text-sm flex items-center justify-center shrink-0">
                    {user?.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Student'}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user?.email || user?.academicCourseCode || 'student@domain.com'}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP HEADER */}
        <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 transition-colors duration-200">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors shrink-0"
            aria-label="Open mobile menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Header Search & Course Filter Bar */}
          <ExploreFilterBar
            searchQuery={filters.searchQuery}
            onSearchChange={handleSearchChange}
            courses={courses}
            selectedCourseId={filters.selectedCourseId}
            onCourseChange={handleCourseChange}
            selectedSemesterNum={filters.selectedSemesterNum}
            onSemesterChange={handleSemesterChange}
            sortBy={filters.sortBy}
            onSortChange={handleSortChange}
            onResetFilters={() => dispatch(resetFilters())}
            totalNotes={filteredNotes.length}
          />

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Global Refresh Button */}
            <button
              type="button"
              onClick={handleGlobalRefresh}
              disabled={globalRefreshing}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700/80 shadow-xs"
              title="Refresh Page Data"
              aria-label="Refresh page data"
            >
              <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-all ${globalRefreshing ? 'animate-spin text-[var(--primary)] dark:text-yellow-300' : 'hover:rotate-45'}`} />
            </button>

            {/* Dark Mode Toggle Button in Navbar */}
            <button
              type="button"
              onClick={() => dispatch(toggleTheme())}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 border border-slate-200/70 dark:border-slate-700/80 shadow-xs"
              title={themeMode === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {themeMode === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-indigo-200 dark:ring-indigo-900"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold text-xs flex items-center justify-center">
                    {user?.name?.[0]?.toUpperCase() || 'S'}
                  </div>
                )}
                <span className="hidden lg:inline text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {user.name.split(' ')[0]}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                    <div className="mt-1.5 inline-block text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-md">
                      {user.academicCourseCode} • Sem {user.currentSemester}
                    </div>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        navigate('/student/my-study');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
                    >
                      My Academic Study
                    </button>
                    
                    <button
                      onClick={() => {
                        navigate('/student/settings');
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium cursor-pointer"
                    >
                      Account Settings
                    </button>
                  </div>
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-medium cursor-pointer"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
