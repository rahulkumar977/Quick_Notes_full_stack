import React from 'react';
import { Navigate } from 'react-router-dom';

// Layouts
import { StudentLayout } from '../components/layout/StudentLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { VerifyEmailPage } from '../pages/public/VerifyEmailPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/public/ResetPasswordPage';
import { ExploreNotesPage as StudentExploreNotesPage } from '../pages/student/exploreNotes/ExploreNotesPage';
import { ExploreNotesPage as PublicExploreNotesPage } from '../pages/public/ExploreNotesPage';
import { PdfPreViewPage } from '../pages/student/exploreNotes/PdfPreViewPage';
import { CourseDetailsPage } from '../pages/public/CourseDetailsPage';
 

// Student Pages
import { DashboardPage } from '../pages/student/DashboardPage';
import { MyStudyPage } from '../pages/student/myStudyNote/MyStudyPage';
import { SemesterPage } from '../pages/student/myStudyNote/SemesterPage';
import { PlacementNotes } from '../pages/student/placmentNotes/PlacementNotes';
import { SavedNotesPage } from '../pages/student/savedNotes/SavedNotesPage';
import { EnrolledCoursesPage } from '../pages/student/EnrolledCoursesPage';
import { SettingsPage } from '../pages/student/settings/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminUsersPage } from '../pages/admin/AdminUsersPage';
import { AdminCoursesPage } from '../pages/admin/AdminCoursesPage';
import { AdminSubjectsPage } from '../pages/admin/AdminSubjectsPage';
import { AdminNotesPage } from '../pages/admin/AdminNotesPage';
import { AddCoursePage } from '../pages/student/addCourses/AddCoursePage';
import { MeetingLobbyPage } from '../pages/student/meetings/MeetingLobbyPage';
import { MeetingRoomPage } from '../pages/student/meetings/MeetingRoomPage';


export const routesConfig = [
  // ================= PUBLIC ROUTES =================
  {
    path: '/',
    element: <LandingPage />,
    isPrivate: false,
    name: 'Landing',
  },
  {
    path: '/login',
    element: <LoginPage />,
    isPrivate: false,
    restrictedForAuth: true,
    name: 'Login',
  },
  {
    path: '/signup',
    element: <RegisterPage />,
    isPrivate: false,
    restrictedForAuth: true,
    name: 'Signup',
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
    isPrivate: false,
    name: 'Verify Email',
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    isPrivate: false,
    name: 'Forgot Password',
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
    isPrivate: false,
    name: 'Reset Password',
  },
  {
    path: '/explore',
    element: <PublicExploreNotesPage />,
    isPrivate: false,
    restrictedForAuth: true,
    redirectPath: '/student/explore',
    name: 'Explore Notes',
  },
  {
    path: '/course-details',
    element: <CourseDetailsPage />,
    isPrivate: false,
    name: 'Course Details',
  },
   

  // ================= STUDENT PRIVATE ROUTES =================
  {
    path: '/student/dashboard',
    element: (
      <StudentLayout>
        <DashboardPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'Student Dashboard',
  },
  {
    path: '/student/add-notes',
    element: (
      <StudentLayout>
        <AddCoursePage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'Add Course',
  },
  {
    path: '/student/my-study',
    element: (
      <StudentLayout>
        <MyStudyPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'My Study',
  },
  {
    path: '/student/my-study/semester',
    element: (
      <StudentLayout>
        <SemesterPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'Semester Notes',
  },
  {
    path: '/student/placement-notes',
    element: (
      <StudentLayout>
        <PlacementNotes />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'Placement Notes',
  },
  {
    path: '/student/saved-notes',
    element: (
      <StudentLayout>
        <SavedNotesPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'Saved Notes',
  },
  {
    path: '/student/enrolled-notes',
    element: (
      <StudentLayout>
        <EnrolledCoursesPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'Enrolled Notes',
  },
  {
    path: '/student/explore',
    element: (
      <StudentLayout>
        <StudentExploreNotesPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'Explore Notes',
  },
  {
    path: '/student/explore/preview',
    element: (
      <StudentLayout>
        <PdfPreViewPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'PDF Preview',
  },
  {
    path: '/student/settings',
    element: (
      <StudentLayout>
        <SettingsPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT'],
    name: 'Settings',
  },
  {
    path: '/student/meetings',
    element: (
      <StudentLayout>
        <MeetingLobbyPage />
      </StudentLayout>
    ),
    isPrivate: true,
    allowedRoles: ['STUDENT', 'ADMIN'],
    name: 'Study Rooms',
  },
  {
    path: '/student/meetings/:roomId',
    element: <MeetingRoomPage />,
    isPrivate: true,
    allowedRoles: ['STUDENT', 'ADMIN'],
    name: 'Meeting Room',
  },

  // ================= ADMIN PRIVATE ROUTES =================
  {
    path: '/admin/dashboard',
    element: (
      <AdminLayout>
        <AdminDashboardPage />
      </AdminLayout>
    ),
    isPrivate: true,
    allowedRoles: ['ADMIN'],
    name: 'Admin Dashboard',
  },
  {
    path: '/admin/users',
    element: (
      <AdminLayout>
        <AdminUsersPage />
      </AdminLayout>
    ),
    isPrivate: true,
    allowedRoles: ['ADMIN'],
    name: 'Admin Users',
  },
  {
    path: '/admin/students',
    element: (
      <AdminLayout>
        <AdminUsersPage />
      </AdminLayout>
    ),
    isPrivate: true,
    allowedRoles: ['ADMIN'],
    name: 'Student Record',
  },
  {
    path: '/admin/courses',
    element: (
      <AdminLayout>
        <AdminCoursesPage />
      </AdminLayout>
    ),
    isPrivate: true,
    allowedRoles: ['ADMIN'],
    name: 'Admin Courses',
  },
  {
    path: '/admin/subjects',
    element: (
      <AdminLayout>
        <AdminSubjectsPage />
      </AdminLayout>
    ),
    isPrivate: true,
    allowedRoles: ['ADMIN'],
    name: 'Admin Subjects',
  },
  {
    path: '/admin/notes',
    element: (
      <AdminLayout>
        <AdminNotesPage />
      </AdminLayout>
    ),
    isPrivate: true,
    allowedRoles: ['ADMIN'],
    name: 'Admin Notes',
  },

  // ================= FALLBACK ROUTE =================
  {
    path: '*',
    element: <Navigate to="/" replace />,
    isPrivate: false,
    name: 'Not Found Redirect',
  },
];

export default routesConfig;
