import React, { useState, useEffect, useCallback } from 'react';
import { Breadcrumb } from '../../components/common/Breadcrumb';
import { AdminStatsGrid } from '../../components/admin/dashboard/AdminStatsGrid';
import { AdminRecentActivity } from '../../components/admin/dashboard/AdminRecentActivity';
import { AdminQuickActions } from '../../components/admin/dashboard/AdminQuickActions';
import { adminApi } from '../../services/adminApi';
import { RefreshCw, ShieldCheck, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminDashboardPage = () => {
  const [data, setData] = useState({
    stats: {},
    recentStudents: [],
    recentNotes: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await adminApi.getAdminStats();
      if (res?.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadStats();
      toast.success('Admin metrics refreshed');
    } catch {
      toast.error('Failed to refresh stats');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Breadcrumb */}
      <Breadcrumb items={[{ label: 'Admin Dashboard' }]} />

       
 

      {/* 1. Core Metrics Grid Component */}
      <AdminStatsGrid stats={data.stats} />

      {/* 2. Quick Portals Component */}
      <AdminQuickActions />

      {/* 3. Recent Activity Component */}
      <AdminRecentActivity
        recentStudents={data.recentStudents}
        recentNotes={data.recentNotes}
      />
    </div>
  );
};

export default AdminDashboardPage;
