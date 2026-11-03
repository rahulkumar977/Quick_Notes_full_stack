import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { StudentStatsHeader } from '../../components/admin/students/StudentStatsHeader';
import { StudentFilterBar } from '../../components/admin/students/StudentFilterBar';
import { StudentTable } from '../../components/admin/students/StudentTable';
import { adminApi } from '../../services/adminApi';
import { RefreshCw, Users, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminUsersPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchStudents = useCallback(async () => {
    try {
      const res = await adminApi.getAllStudents({ role: 'STUDENT' });
      if (res?.success && Array.isArray(res.data)) {
        setStudents(res.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchStudents();
      toast.success('Student records refreshed');
    } catch {
      toast.error('Failed to refresh');
    } finally {
      setRefreshing(false);
    }
  };

  // Toggle student status (Active / Suspended)
  const handleToggleStatus = async (student) => {
    const id = student._id || student.id;
    const nextStatus = student.isActive === false ? true : false;
    setUpdatingId(id);

    try {
      const res = await adminApi.toggleStudentStatus(id, nextStatus);
      if (res?.success) {
        setStudents((prev) =>
          prev.map((s) => ((s._id || s.id) === id ? { ...s, isActive: nextStatus } : s))
        );
        toast.success(`Student ${nextStatus ? 'activated' : 'suspended'} successfully`);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update student status');
    } finally {
      setUpdatingId(null);
    }
  };

  // Filter students by search and status
  const filteredStudents = useMemo(() => {
    let list = students;

    if (statusFilter === 'active') {
      list = list.filter((s) => s.isActive !== false);
    } else if (statusFilter === 'suspended') {
      list = list.filter((s) => s.isActive === false);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((s) => {
        const name = (s.name || '').toLowerCase();
        const email = (s.email || '').toLowerCase();
        const course = (s.academicProfile?.courseName || '').toLowerCase();
        return name.includes(q) || email.includes(q) || course.includes(q);
      });
    }

    return list;
  }, [students, statusFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: students.length,
      active: students.filter((s) => s.isActive !== false).length,
      suspended: students.filter((s) => s.isActive === false).length,
      verified: students.filter((s) => s.isVerified).length,
    };
  }, [students]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: 'Admin', onClick: () => window.location.assign('/admin/dashboard') },
          { label: 'Student Records' }
        ]}
      />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--primary)]" />
            <span>Student Record Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Directory of registered students, academic departments, verification, and access controls.
          </p>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[var(--primary)]' : ''}`} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* 1. Student Stats Summary Component */}
      <StudentStatsHeader
        total={stats.total}
        active={stats.active}
        suspended={stats.suspended}
        verified={stats.verified}
      />

      {/* 2. Search & Filter Bar Component */}
      <StudentFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        totalCount={filteredStudents.length}
        onReset={handleResetFilters}
      />

      {/* 3. Student Records Table Component */}
      <StudentTable
        students={filteredStudents}
        loading={loading}
        onToggleStatus={handleToggleStatus}
        updatingId={updatingId}
      />
    </div>
  );
};

export default AdminUsersPage;
