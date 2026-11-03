const Note = require('../models/Note');
const SavedNote = require('../models/SavedNote');
const NoteEnrollment = require('../models/NoteEnrollment');
const User = require('../models/User');
const Course = require('../models/Course');
const Semester = require('../models/Semester');

const getStudentDashboardStats = async (req, res) => {
  try {
    const currentUserId = req.user.userId;

    // Parallel fetch for optimal response times
    const [
      myNotesCount,
      enrolledNotesCount,
      savedNotesCount,
      notesViewsAgg,
      recentNotes,
      userDoc,
      notesActivities,
      savedActivities
    ] = await Promise.all([
      Note.countDocuments({ owner: currentUserId, status: { $ne: 'ARCHIVED' } }),
      NoteEnrollment.countDocuments({ student: currentUserId, status: 'ACTIVE' }),
      SavedNote.countDocuments({ student: currentUserId }),
      Note.aggregate([
        { $match: { owner: currentUserId, status: { $ne: 'ARCHIVED' } } },
        { $group: { _id: null, totalViews: { $sum: '$views' }, totalDownloads: { $sum: '$downloads' } } }
      ]),
      Note.find({
        status: { $in: ['PUBLISHED', 'DRAFT'] },
        $or: [
          { owner: currentUserId },
          { visibility: 'PUBLIC' }
        ]
      })
        .populate('course', 'name slug courseCode')
        .populate('semester', 'name semesterNumber')
        .populate('subject', 'name slug subjectCode')
        .populate('owner', 'name')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
      User.findById(currentUserId).select('lastLogin createdAt updatedAt').lean(),
      Note.find({ owner: currentUserId }).select('createdAt').sort({ createdAt: -1 }).limit(100).lean(),
      SavedNote.find({ student: currentUserId }).select('savedAt createdAt').sort({ savedAt: -1 }).limit(100).lean()
    ]);

    const totalViews = (notesViewsAgg && notesViewsAgg[0]?.totalViews) || 0;

    // Helper to format Date to YYYY-MM-DD
    const toYMD = (d) => {
      if (!d) return null;
      const date = new Date(d);
      if (isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    // Calculate daily active dates set
    const activeDatesSet = new Set();

    // Today is automatically marked active since student is active right now
    const todayStr = toYMD(new Date());
    if (todayStr) activeDatesSet.add(todayStr);

    if (userDoc?.lastLogin) {
      const d = toYMD(userDoc.lastLogin);
      if (d) activeDatesSet.add(d);
    }

    notesActivities.forEach((n) => {
      const d = toYMD(n.createdAt);
      if (d) activeDatesSet.add(d);
    });

    savedActivities.forEach((s) => {
      const d = toYMD(s.savedAt || s.createdAt);
      if (d) activeDatesSet.add(d);
    });
    const activeDates = Array.from(activeDatesSet).sort().reverse();
    // Calculate current consecutive day streak
    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(today);
    let dateStr = toYMD(checkDate);

    // If today is active, start counting from today; otherwise check yesterday
    if (!activeDatesSet.has(dateStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = toYMD(checkDate);
    }

    while (activeDatesSet.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
      dateStr = toYMD(checkDate);
    }
    // Calculate longest historical streak
    let longestStreak = currentStreak;
    if (activeDates.length > 0) {
      let tempStreak = 1;
      const sortedAsc = Array.from(activeDatesSet).sort();
      for (let i = 1; i < sortedAsc.length; i++) {
        const prev = new Date(sortedAsc[i - 1]);
        const curr = new Date(sortedAsc[i]);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > longestStreak) longestStreak = tempStreak;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
    }
    return res.status(200).json({
      success: true,
      data: {
        stats: {
          myNotesCount: myNotesCount || 0,
          enrolledCoursesCount: enrolledNotesCount || 0,
          enrolledNotesCount: enrolledNotesCount || 0,
          savedNotesCount: savedNotesCount || 0,
          notesReadCount: totalViews || myNotesCount * 2 + savedNotesCount || 0
        },
        streak: {
          currentStreak: Math.max(currentStreak, 1),
          longestStreak: Math.max(longestStreak, currentStreak, 1),
          activeDates
        },
        recentNotes: recentNotes || []
      }
    });
  } catch (error) {
    console.error('Error fetching student dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics'
    });
  }
};
const getAdminDashboardStats = async (req, res) => {
  try {
    const [
      totalStudents,
      activeStudents,
      verifiedStudents,
      totalCourses,
      totalSemesters,
      totalNotes,
      publicNotes,
      privateNotes,
      notesViewsAgg,
      recentStudents,
      recentNotes
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'STUDENT', isActive: true }),
      User.countDocuments({ role: 'STUDENT', isVerified: true }),
      Course.countDocuments({ isActive: true }),
      Semester.countDocuments({ isActive: true }),
      Note.countDocuments({ status: { $ne: 'ARCHIVED' } }),
      Note.countDocuments({ status: { $ne: 'ARCHIVED' }, visibility: 'PUBLIC' }),
      Note.countDocuments({ status: { $ne: 'ARCHIVED' }, visibility: 'PRIVATE' }),
      Note.aggregate([
        { $match: { status: { $ne: 'ARCHIVED' } } },
        { $group: { _id: null, totalViews: { $sum: '$views' }, totalDownloads: { $sum: '$downloads' } } }
      ]),
      User.find({ role: 'STUDENT' })
        .select('name email academicProfile isActive isVerified createdAt lastLogin')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Note.find({ status: { $ne: 'ARCHIVED' } })
        .populate('course', 'name slug courseCode')
        .populate('semester', 'name semesterNumber')
        .populate('subject', 'name slug subjectCode')
        .populate('owner', 'name email')
        .sort({ createdAt: -1 })
        .limit(6)
        .lean()
    ]);

    const totalViews = (notesViewsAgg && notesViewsAgg[0]?.totalViews) || 0;
    const totalDownloads = (notesViewsAgg && notesViewsAgg[0]?.totalDownloads) || 0;

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          activeStudents,
          verifiedStudents,
          totalCourses,
          totalSemesters,
          totalNotes,
          publicNotes,
          privateNotes,
          totalViews,
          totalDownloads
        },
        recentStudents: recentStudents || [],
        recentNotes: recentNotes || []
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats'
    });
  }
};

module.exports = {
  getStudentDashboardStats,
  getAdminDashboardStats
};