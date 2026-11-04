import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { GridBackground } from '../../components/common/GridBackground';
import {
  ArrowRight,
  BookOpen,
  Layers,
  UploadCloud,
  Compass,
  Laptop,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  Lock,
  Globe,
  GraduationCap,
  Flame,
  Star,
  TrendingUp,
  Download,
  Check,
  Zap,
  FolderGit2,
  Award,
  ChevronRight
} from 'lucide-react';

export const LandingPage = () => {
  const navigate = useNavigate();
  const [activeHeroTab, setActiveHeroTab] = useState('notes');

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-[#07080b]/90 square-grid-pattern text-slate-900 dark:text-slate-100 flex flex-col antialiased transition-colors duration-200">
      <Navbar />

      {/* ================= HERO SECTION WITH COMMON GRID BACKGROUND ================= */}
      <GridBackground
        as="section"
        gridSize={48}
        showGlow={true}
        mask="fade-bottom"
        className="pt-14 pb-24 md:pt-20 md:pb-32"
      >
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Creative Animated Top Badge */}
          <div className="hidden sm:inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary-light/80 dark:bg-primary-dark/30 backdrop-blur-md text-xs font-semibold text-primary-dark dark:text-yellow-300 shadow-xs mb-8 hover:scale-105 transition-all cursor-pointer"
               onClick={() => navigate('/explore')}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>All-New Semester Notes & Solved Papers Hub</span>
            <ChevronRight className="w-3.5 h-3.5 text-primary/70 dark:text-yellow-300/70" />
          </div>

          {/* Main Hero Headings */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-4xl mx-auto">
            Supercharge Your Studies with{' '}
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-amber-600 via-[var(--primary)] to-yellow-500 dark:from-yellow-300 dark:via-yellow-400 dark:to-amber-200 bg-clip-text text-transparent">
                Every Note Organized
              </span>
              <span className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary dark:via-yellow-300 to-transparent opacity-60 rounded-full" />
            </span>{' '}
            in One Place.
          </h1>

          {/* Hero CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-primary hover:bg-primary-hover rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer backdrop-blur-sm"
            >
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>Explore All Notes</span>
            </button>
          </div>

          {/* Social Proof Pill Strip */}
          <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex -space-x-2 overflow-hidden">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-[10px] ring-2 ring-white dark:ring-slate-950">RK</span>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500 text-white font-bold text-[10px] ring-2 ring-white dark:ring-slate-950">PS</span>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500 text-white font-bold text-[10px] ring-2 ring-white dark:ring-slate-950">AD</span>
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-purple-500 text-white font-bold text-[10px] ring-2 ring-white dark:ring-slate-950">NM</span>
            </div>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span>
              <strong className="text-slate-800 dark:text-slate-200 font-semibold">4.9/5</strong> from 2,500+ students
            </span>
          </div>

          {/* ================= CREATIVE ANIMATED SHOWCASE MOCKUP ================= */}
          <div className="mt-14 relative max-w-4xl mx-auto">
            
            {/* Floating Glass Card 1 - Top Left */}
            <div className="hidden sm:flex absolute -top-6 -left-6 z-20 items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl text-left animate-float-slow">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">Verified Note</span>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded">100% Free</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">B.Tech CSE • 1.4k Reads</p>
              </div>
            </div>

            {/* Floating Glass Card 2 - Bottom Right */}
            <div className="hidden sm:flex absolute -bottom-6 -right-6 z-20 items-center gap-3 p-3.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xl text-left animate-float-reverse">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Flame className="w-5 h-5 fill-amber-500/20" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">14-Day Study Streak</span>
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded">Top 5%</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="w-[85%] h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full" />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Exam Ready</span>
                </div>
              </div>
            </div>

            {/* Main Window Frame */}
            <div className="relative rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden text-left transition-all">
              
              {/* App Window Titlebar with URL Bar & Interactive Tabs */}
              <div className="bg-slate-100/90 dark:bg-slate-850 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-400/90" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/90" />
                    <div className="w-3 h-3 rounded-full bg-emerald-400/90" />
                  </div>
                  
                </div>

                {/* Interactive Demo Tab Switcher */}
                <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-slate-950 p-1 rounded-xl text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('notes')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeHeroTab === 'notes'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Live Notes
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('syllabus')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeHeroTab === 'syllabus'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHeroTab('pyq')}
                    className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                      activeHeroTab === 'pyq'
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Solved Papers
                  </button>
                </div>
              </div>

              {/* Product Preview Body */}
              <div className="p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-950/60 min-h-[300px]">
                {activeHeroTab === 'notes' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 animate-fadeIn">
                    {/* Left Mini Sidebar Preview */}
                    <div className="hidden md:block md:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                      <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center justify-between">
                        <span>Course Subjects</span>
                        <span className="text-primary dark:text-yellow-300">Sem 1</span>
                      </div>
                      <div className="space-y-1.5 text-xs font-medium">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-primary-light text-primary-dark dark:bg-primary-dark/40 dark:text-yellow-200 font-semibold border border-primary/20">
                          <span className="flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5" />
                            Programming in C
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-primary/20 dark:bg-primary/40 rounded">14 notes</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                          <span>Mathematics I</span>
                          <span className="text-[10px] text-slate-400">10 notes</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                          <span>Applied Physics</span>
                          <span className="text-[10px] text-slate-400">8 notes</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors">
                          <span>Digital Logic & Design</span>
                          <span className="text-[10px] text-slate-400">6 notes</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Interactive Card Preview */}
                    <div className="col-span-12 md:col-span-8 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <span>Unit 2: Operators & Expressions</span>
                            <Sparkles className="w-3.5 h-3.5 text-primary dark:text-yellow-300" />
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Verified lecture materials & question solutions</p>
                        </div>
                        <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-lg border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Faculty Verified
                        </span>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2 hover:border-primary/60 dark:hover:border-primary/60 transition-all hover:shadow-md group">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-yellow-300 transition-colors">
                            Complete Operators in C - Handwritten Class Notes
                          </span>
                          <span className="text-[11px] text-primary dark:text-yellow-300 font-semibold bg-primary-light dark:bg-primary-dark/40 px-2 py-0.5 rounded">
                            PDF • 12 pages
                          </span>
                        </div>
                         
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                        
                          <button
                            type="button"
                            onClick={() => navigate('/explore')}
                            className="inline-flex items-center gap-1 text-primary dark:text-yellow-300 font-semibold hover:underline cursor-pointer"
                          >
                            <span>Read Note</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-2 hover:border-primary/60 dark:hover:border-primary/60 transition-all hover:shadow-md group">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-primary dark:group-hover:text-yellow-300 transition-colors">
                            Top 15 Solved Exam Questions on Pointers & Arrays
                          </span>
                          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            PYQ • 6 pages
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 dark:text-slate-500">
                          <span className="flex items-center gap-1.5">
                            <Download className="w-3 h-3 text-slate-400" />
                            842 Downloads this week
                          </span>
                          <button
                            type="button"
                            onClick={() => navigate('/explore')}
                            className="inline-flex items-center gap-1 text-primary dark:text-yellow-300 font-semibold hover:underline cursor-pointer"
                          >
                            <span>Download PDF</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeHeroTab === 'syllabus' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Semester 1 Curriculum Progress</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Track subject-wise syllabus coverage and note readiness</p>
                      </div>
                      <span className="text-xs font-bold text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 px-2.5 py-1 rounded-lg">
                        78% Exam Ready
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>Unit 1: Fundamentals</span>
                          <span className="text-emerald-500">100%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="w-full h-full bg-emerald-500 rounded-full" />
                        </div>
                        <p className="text-[11px] text-slate-400">6 notes available • Complete</p>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>Unit 2: Pointers & Arrays</span>
                          <span className="text-primary dark:text-yellow-300">85%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="w-[85%] h-full bg-primary rounded-full" />
                        </div>
                        <p className="text-[11px] text-slate-400">8 notes available • Active</p>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold">
                          <span>Unit 3: File Handling</span>
                          <span className="text-amber-500">50%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="w-[50%] h-full bg-amber-500 rounded-full" />
                        </div>
                        <p className="text-[11px] text-slate-400">3 notes available • High Priority</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeHeroTab === 'pyq' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Past 5 Years University Solved Papers</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Official semester exam question sheets with answers</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/explore')}
                        className="text-xs font-bold text-primary dark:text-yellow-300 hover:underline"
                      >
                        Browse All 50+ PYQs →
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Winter 2024 End-Semester Paper</div>
                          <div className="text-[11px] text-slate-400">Programming in C • 100 Marks Solved</div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-primary-light text-primary-dark dark:bg-primary-dark/40 dark:text-yellow-300 rounded-lg">
                          Solved PDF
                        </span>
                      </div>

                      <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Summer 2024 Mid-Semester Paper</div>
                          <div className="text-[11px] text-slate-400">Mathematics I • Step-by-step calculus</div>
                        </div>
                        <span className="text-xs font-semibold px-2 py-1 bg-primary-light text-primary-dark dark:bg-primary-dark/40 dark:text-yellow-300 rounded-lg">
                          Solved PDF
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Subtle Floating Bottom Badge */}
            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Updated daily with notes from verified toppers & university faculties</span>
            </div>
          </div>
        </div>
      

      {/* ================= 5 PRODUCT SECTIONS ================= */}
      {/* 1. Organize Your Semester */}
      <section className="py-20   transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 px-3 py-1 rounded-full">
                Hierarchical Architecture
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                1. Organize Your Semester
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Never lose a sheet or lecture slide again. NIU Notes mirrors your real university structure:
                <strong className="text-slate-900 dark:text-slate-200"> Course → Semester → Subject → Lecture → Note</strong>. Access all semesters at any time, including past revisions.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Semester-wise cards:</strong> Semester 1 through 8 remain fully visible and openable.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Subject breakdown:</strong> Real syllabus subjects with active lecture and notes counters.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Lecture granularity:</strong> Specific topics and handouts indexed under corresponding lectures.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">B.Tech CSE Semesters</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Semester 1</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">42 Notes</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">5 Subjects</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border-2 border-primary shadow-xs">
                  <div className="text-xs font-bold text-primary dark:text-yellow-300">Semester 2 (Current)</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">18 Notes</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">5 Subjects</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Semester 3</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">Upcoming</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">6 Subjects</div>
                </div>
                <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">Semester 4</div>
                  <div className="text-base font-bold text-slate-900 dark:text-white mt-1">Upcoming</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">6 Subjects</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Upload Your Own Notes */}
      <section className="py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">Upload Note Dialog</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">Ready</span>
              </div>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Course & Subject:</span> B.Tech CSE • Programming in C
                </div>
                <div className="border-2 border-dashed border-primary/40 dark:border-primary/50 rounded-xl p-6 text-center bg-primary-light/40 dark:bg-primary-dark/20">
                  <UploadCloud className="w-8 h-8 text-primary dark:text-yellow-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Drag & drop your PDF, DOCX or images</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Up to 25MB supported</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl border border-primary bg-primary-light/50 dark:bg-primary-dark/30 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-primary dark:text-yellow-300" />
                    <span className="font-semibold text-slate-900 dark:text-slate-100">Private Only</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    <span className="font-semibold text-slate-600 dark:text-slate-400">Public Discovery</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 px-3 py-1 rounded-full">
                Simple Content Creation
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                2. Upload Your Own Notes
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Digitize your handwritten pages, class lecture summaries, and previous exam solutions in seconds.
                Tag them by subject, unit, or lecture number so they are always in their rightful place.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Private vs Public switch:</strong> Keep personal revision private or contribute publicly to help classmates.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Multi-format support:</strong> PDF handouts, scans, typed DOCX, and slide decks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Explore Notes From Other Courses */}
      <section className="py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 px-3 py-1 rounded-full">
                Cross-Curricular Discovery
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                3. Explore Notes From Other Courses
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Studying for electives, competitive tests, or coding interviews? Discover verified notes across B.Tech, BCA, MCA, and specialized industry tracks for free.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Preview before enrolling:</strong> Read public lecture notes without any friction.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Free Course Enrollments:</strong> Add courses like C++, Python, and Web Development directly to your dashboard.</p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Featured Free Courses</div>
              <div className="space-y-2.5">
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">C++ Programming</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">BCA & Elective • 124 Notes • 230 Students</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/course-details')}
                    className="px-3 py-1 text-xs font-semibold text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 hover:bg-primary-border/60 rounded-lg cursor-pointer"
                  >
                    Explore →
                  </button>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Python Programming</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Elective Track • 98 Notes • 310 Students</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/course-details')}
                    className="px-3 py-1 text-xs font-semibold text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 hover:bg-primary-border/60 rounded-lg cursor-pointer"
                  >
                    Explore →
                  </button>
                </div>
                <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Web Development Foundations</h5>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Full Stack • 145 Notes • 420 Students</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/course-details')}
                    className="px-3 py-1 text-xs font-semibold text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 hover:bg-primary-border/60 rounded-lg cursor-pointer"
                  >
                    Explore →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Study Anywhere */}
      <section className="py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-850 p-4 font-mono text-xs text-slate-700 dark:text-slate-300 overflow-hidden flex flex-col justify-between border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="font-bold text-primary dark:text-yellow-300 text-sm"># Operators in C - Complete Lecture Summary</div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-1">Instructor: Prof. Sharma | Course: CS101</div>
                  <p className="mt-3 text-slate-600 dark:text-slate-400 text-xs leading-relaxed font-sans">
                    In C programming, operators are symbols that tell the compiler to perform specific mathematical or logical manipulations...
                  </p>
                </div>
                <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 font-sans text-xs border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span>Page 1 of 12</span>
                  <span className="text-primary dark:text-yellow-300 font-semibold cursor-pointer">Download Offline PDF</span>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 px-3 py-1 rounded-full">
                Distraction-Free Reader
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                4. Study Anywhere
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Read notes comfortably on laptop, tablet, or phone with a clean document reader. High-contrast typography, chapter bookmarks, and single-click downloads for offline exam prep.
              </p>
              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Bookmarking:</strong> Save notes with 1 click to read during exam week.</p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary dark:text-yellow-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-700 dark:text-slate-300"><strong className="text-slate-900 dark:text-slate-100">Fast search:</strong> Locate formulas, definitions, and questions instantly.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Simple Student Dashboard */}
      <section className="py-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-primary dark:text-yellow-300 bg-primary-light dark:bg-primary-dark/40 px-3 py-1 rounded-full">
                Personalized Workspace
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                5. Simple Student Dashboard
              </h2>
              <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                Start every morning with your personalized hub. See your notes count, enrolled electives, saved study material, and quickly jump back right where you left off.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xl font-bold text-primary dark:text-yellow-300">42</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">My Notes</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xl font-bold text-primary dark:text-yellow-300">5</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Enrolled Courses</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xl font-bold text-primary dark:text-yellow-300">18</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Saved Notes</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <div className="text-xl font-bold text-primary dark:text-yellow-300">76</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Notes Read</div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                  RK
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Good morning, Rahul 👋</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">B.Tech Computer Science Engineering • Semester 2</p>
                </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Quick Resume</div>
                <div className="text-xs text-primary dark:text-yellow-300 font-medium">Programming in C / Lecture 3 - Operators</div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-3/4 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      </GridBackground>

      {/* ================= FINAL CTA SECTION ================= */}
      <section className="py-20 bg-slate-900 dark:bg-slate-850 text-white relative overflow-hidden border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Start organizing your notes today.
          </h2>
          <p className="text-slate-300 text-base max-w-xl mx-auto leading-relaxed">
            Join students from B.Tech, BCA, and MCA in building the cleanest academic notes repository.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-950 bg-white hover:bg-slate-100 rounded-xl shadow-lg transition-colors cursor-pointer"
            >
              Create Free Account
            </button>
            <button
              type="button"
              onClick={() => navigate('/explore')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Browse Public Notes
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
