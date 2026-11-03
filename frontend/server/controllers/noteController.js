const Note = require('../models/Note');
const Course = require('../models/Course');
const Semester = require('../models/Semester');
const Subject = require('../models/Subject');
const NoteEnrollment = require('../models/NoteEnrollment');
const SavedNote = require('../models/SavedNote');
const { isValidObjectId, parsePagination } = require('../utils/validators');
const { uploadToCloudinary, getFileTypeFromFilename } = require('../utils/upload');

 
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided for upload'
      });
    }

    const { folder } = req.body;
    const targetFolder = folder || 'quick_notes/subjects';

    const result = await uploadToCloudinary(req.file.buffer, {
      folder: targetFolder,
      resource_type: 'auto'
    });

    const fileType = getFileTypeFromFilename(req.file.originalname);

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully to Cloudinary',
      data: {
        fileUrl: result.secure_url,
        fileName: req.file.originalname,
        fileType,
        fileSize: result.bytes || req.file.size,
        publicId: result.public_id,
        format: result.format
      }
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error uploading file to Cloudinary'
    });
  }
};

  
const createNote = async (req, res) => {
  try {
    const {
      title,
      description,
      course,
      semester,
      subject,
      organizationType,
      unitName,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      pageCount,
      visibility,
      tags,
      language
    } = req.body;

    // Validate title
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Note title is required'
      });
    }

    if (title.trim().length > 200) {
      return res.status(400).json({
        success: false,
        message: 'Note title cannot exceed 200 characters'
      });
    }

    const isDraft = req.body.status && req.body.status.toUpperCase() === 'DRAFT';

    // Require either a direct file upload or a provided fileUrl (unless note is a DRAFT)
    if (!isDraft && !req.file && (!fileUrl || !fileUrl.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a note file or provide a valid file URL'
      });
    }

    // Validate ObjectIds for Course, Semester, Subject
    if (!isValidObjectId(course)) {
      return res.status(400).json({
        success: false,
        message: 'Valid course ID is required'
      });
    }

    if (!isValidObjectId(semester)) {
      return res.status(400).json({
        success: false,
        message: 'Valid semester ID is required'
      });
    }

    if (!isValidObjectId(subject)) {
      return res.status(400).json({
        success: false,
        message: 'Valid subject ID is required'
      });
    }

    // Organization type: UNIT or GENERAL
    const validOrgTypes = ['UNIT', 'GENERAL'];
    let resolvedOrgType;
    if (organizationType && validOrgTypes.includes(organizationType.toUpperCase())) {
      resolvedOrgType = organizationType.toUpperCase();
    } else {
      resolvedOrgType = unitName ? 'UNIT' : 'GENERAL';
    }

    // Handle file upload to Cloudinary (or use existing fileUrl)
    let finalFileUrl = fileUrl ? fileUrl.trim() : '';
    let finalFileName = fileName ? fileName.trim() : '';
    let finalFileType = fileType ? fileType.trim().toUpperCase() : '';
    let finalFileSize = fileSize !== undefined && fileSize !== null ? Number(fileSize) : null;

    if (req.file) {
      const targetFolder = 'quick_notes/subjects';

      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: targetFolder,
        resource_type: 'auto'
      });

      finalFileUrl = uploadResult.secure_url;
      finalFileName = finalFileName || req.file.originalname;
      finalFileType = finalFileType || getFileTypeFromFilename(req.file.originalname);
      finalFileSize = uploadResult.bytes || req.file.size;
    } else if (fileUrl && fileUrl.trim()) {
      if (!finalFileName) {
        finalFileName = 'attachment';
      }
      if (!finalFileType) {
        finalFileType = getFileTypeFromFilename(finalFileName);
      }
    } else if (isDraft) {
      // Draft notes without files are valid per Note model schema
      finalFileUrl = undefined;
      finalFileName = undefined;
      finalFileType = undefined;
    } else {
      return res.status(400).json({
        success: false,
        message: 'File name is required'
      });
    }

    const validFileTypes = ['PDF', 'DOC', 'DOCX', 'JPG', 'JPEG', 'PNG'];
    if (finalFileType && !validFileTypes.includes(finalFileType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type. Supported types: ${validFileTypes.join(', ')}`
      });
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) parsedTags = tags;
      else if (typeof tags === 'string') {
        try {
          parsedTags = JSON.parse(tags);
        } catch (e) {
          parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }
    }

    // Visibility handling: PRIVATE, PUBLIC, ENROLLED
    let resolvedVisibility = 'PRIVATE';
    if (visibility && ['PRIVATE', 'PUBLIC', 'ENROLLED'].includes(visibility.toUpperCase())) {
      resolvedVisibility = visibility.toUpperCase();
    }

    const userId = req.user.userId;
    const noteStatus = isDraft
      ? 'DRAFT'
      : (req.body.status && ['PENDING', 'PUBLISHED'].includes(req.body.status.toUpperCase())
        ? req.body.status.toUpperCase()
        : 'PUBLISHED');

    const notePayload = {
      title: title.trim(),
      description: description ? description.trim() : '',
      owner: userId,
      course,
      semester,
      subject,
      organizationType: resolvedOrgType,
      unitName: unitName ? unitName.trim() : null,
      pageCount: pageCount !== undefined && pageCount !== null ? Number(pageCount) : null,
      visibility: resolvedVisibility,
      status: noteStatus,
      tags: parsedTags,
      language: language && language.trim() ? language.trim() : 'English',
      views: 0,
      downloads: 0,
      saveCount: 0,
      createdBy: userId
    };

    if (finalFileUrl) notePayload.fileUrl = finalFileUrl;
    if (finalFileName) notePayload.fileName = finalFileName;
    if (finalFileType) notePayload.fileType = finalFileType;
    if (finalFileSize !== null && finalFileSize !== undefined) notePayload.fileSize = finalFileSize;

    // Create note record in MongoDB
    const newNote = await Note.create(notePayload);

    // Increment safe counters asynchronously for published notes
    if (noteStatus === 'PUBLISHED') {
      await Promise.all([
        Semester.findByIdAndUpdate(semester, { $inc: { noteCount: 1 } }),
        Subject.findByIdAndUpdate(subject, { $inc: { noteCount: 1 } })
      ]);
    }

    return res.status(201).json({
      success: true,
      message: 'Subject note created and uploaded successfully',
      data: newNote
    });
  } catch (error) {
    console.error('Error creating note:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error creating note'
    });
  }
};

 
const getMyNotes = async (req, res) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const { course, semester, subject, visibility, search, q, all } = req.query;

    const currentUserId = req.user.userId;
    const filter = {
      owner: currentUserId,
      status: { $ne: 'ARCHIVED' }
    };

    if (course && isValidObjectId(course)) {
      filter.course = course;
    }
    if (semester && isValidObjectId(semester)) {
      filter.semester = semester;
    }
    if (subject && isValidObjectId(subject)) {
      filter.subject = subject;
    }
    if (visibility && ['PRIVATE', 'PUBLIC'].includes(visibility.toUpperCase())) {
      filter.visibility = visibility.toUpperCase();
    }

    const searchTerm = search || q;
    if (searchTerm && searchTerm.trim()) {
      const sanitized = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { fileName: { $regex: sanitized, $options: 'i' } },
        { tags: { $regex: sanitized, $options: 'i' } }
      ];
    }

    const queryBuilder = Note.find(filter)
      .populate('course', 'name slug courseCode')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name slug subjectCode')
      .sort(sort);

    if (all !== 'true') {
      queryBuilder.skip(skip).limit(limit);
    }

    const [notes, total] = await Promise.all([
      queryBuilder.lean(),
      Note.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching personal notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching your notes'
    });
  }
};

 
const getPublicNotes = async (req, res) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const {
      course,
      semester,
      subject,
      fileType,
      visibility: visibilityQuery,
      search,
      q,
      sortBy,
      all
    } = req.query;

    const filter = {};

    // Allow exploring notes across all users (explore catalog), excluding ARCHIVED notes
    filter.status = { $ne: 'ARCHIVED' };

    // Public notes API must NEVER return PRIVATE notes
    if (visibilityQuery) {
      const normalizedVisibility = visibilityQuery.toUpperCase();
      if (normalizedVisibility === 'PUBLIC' || normalizedVisibility === 'ENROLLED') {
        filter.visibility = normalizedVisibility;
      } else {
        // If client explicitly queries PRIVATE (or invalid value) on public API, return no records
        filter.visibility = { $in: [] };
      }
    } else {
      // By default, exclude all PRIVATE notes from public API
      filter.visibility = { $ne: 'PRIVATE' };
    }

    if (course && isValidObjectId(course)) {
      filter.course = course;
    }
    if (semester && isValidObjectId(semester)) {
      filter.semester = semester;
    }
    if (subject && isValidObjectId(subject)) {
      filter.subject = subject;
    }
    if (fileType) {
      filter.fileType = fileType.trim().toUpperCase();
    }

    const searchTerm = search || q;
    if (searchTerm && searchTerm.trim()) {
      const sanitized = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
        { tags: { $regex: sanitized, $options: 'i' } }
      ];
    }

    // Default sorting options
    let resolvedSort = sort;
    if (sortBy === 'views') {
      resolvedSort = { views: -1 };
    } else if (sortBy === 'downloads') {
      resolvedSort = { downloads: -1 };
    } else if (sortBy === 'saves') {
      resolvedSort = { saveCount: -1 };
    }

    const queryBuilder = Note.find(filter)
      .populate('owner', 'name email')
      .populate('course', 'name slug courseCode isPublished isActive')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name slug subjectCode')
      .sort(resolvedSort);

    // If all === 'true' (used by Explore catalog), do not apply pagination limit
    if (all !== 'true') {
      queryBuilder.skip(skip).limit(limit);
    }

    const [notes, total] = await Promise.all([
      queryBuilder.lean(),
      Note.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      count: notes.length,
      total,
      page,
      totalPages: all === 'true' ? 1 : Math.ceil(total / limit) || 1,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching public/browse notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching notes'
    });
  }
};

const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const note = await Note.findById(id)
      .populate('owner', 'name email role')
      .populate('course', 'name slug courseCode isPublished')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name slug subjectCode');

    if (!note || note.status === 'ARCHIVED') {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const userId = req.user ? (req.user.userId || req.user.id) : null;
    const isOwner = userId && note.owner && note.owner._id.toString() === userId.toString();
    const isAdmin = req.user && req.user.role === 'ADMIN';

    // Status guard: DRAFT/PENDING/REJECTED notes accessible only to owner/admin
    if (note.status !== 'PUBLISHED' && !isOwner && !isAdmin) {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Visibility guard
    if (note.visibility === 'PRIVATE' && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this private note'
      });
    }

    if (note.visibility === 'ENROLLED' && !isOwner && !isAdmin) {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to access enrolled notes'
        });
      }
      const isEnrolled = await NoteEnrollment.exists({
        student: userId,
        note: note._id,
        status: 'ACTIVE'
      });
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'Access restricted to students enrolled in this note',
          isEnrollmentRequired: true
        });
      }
    }

    const noteData = note.toObject();

    // If viewer is not owner or admin, do not expose owner email or sensitive fields
    if (!isOwner && !isAdmin && noteData.owner) {
      delete noteData.owner.email;
      delete noteData.owner.role;
    }

    return res.status(200).json({
      success: true,
      data: noteData
    });
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching note details'
    });
  }
};

const updateNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const note = await Note.findById(id);
    if (!note || note.status === 'ARCHIVED') {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Ownership check
    const currentUserId = req.user.userId;
    const isOwner = note.owner.toString() === currentUserId.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to modify this note'
      });
    }

    const {
      title,
      description,
      course,
      semester,
      subject,
      lecture,
      organizationType,
      unitName,
      visibility,
      tags,
      language,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      pageCount
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Note title cannot be empty'
        });
      }
      if (title.trim().length > 200) {
        return res.status(400).json({
          success: false,
          message: 'Note title cannot exceed 200 characters'
        });
      }
      note.title = title.trim();
    }

    if (description !== undefined) {
      note.description = description.trim();
    }

    // If moving note hierarchy, validate consistency
    if (course || semester || subject) {
      const targetCourse = course || note.course;
      const targetSemester = semester || note.semester;
      const targetSubject = subject || note.subject;

      if (
        !isValidObjectId(targetCourse) ||
        !isValidObjectId(targetSemester) ||
        !isValidObjectId(targetSubject)
      ) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course, semester, or subject ID format'
        });
      }

      const [courseDoc, semesterDoc, subjectDoc] = await Promise.all([
        Course.findById(targetCourse),
        Semester.findById(targetSemester),
        Subject.findById(targetSubject)
      ]);

      if (!courseDoc || !courseDoc.isActive) {
        return res.status(404).json({ success: false, message: 'Target course not found or inactive' });
      }
      if (
        !semesterDoc ||
        !semesterDoc.isActive ||
        semesterDoc.course.toString() !== targetCourse.toString()
      ) {
        return res.status(400).json({ success: false, message: 'Target semester does not match course' });
      }
      if (
        !subjectDoc ||
        !subjectDoc.isActive ||
        subjectDoc.semester.toString() !== targetSemester.toString() ||
        subjectDoc.course.toString() !== targetCourse.toString()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Target subject does not match semester/course'
        });
      }

      note.course = targetCourse;
      note.semester = targetSemester;
      note.subject = targetSubject;
    }

    if (organizationType !== undefined) {
      const validOrgTypes = ['LECTURE', 'UNIT', 'GENERAL'];
      if (!validOrgTypes.includes(organizationType.toUpperCase())) {
        return res.status(400).json({ success: false, message: 'Invalid organization type' });
      }
      note.organizationType = organizationType.toUpperCase();
    }

    if (unitName !== undefined) {
      note.unitName = unitName ? unitName.trim() : null;
    }

    if (visibility !== undefined) {
      if (!['PRIVATE', 'PUBLIC', 'ENROLLED'].includes(visibility.toUpperCase())) {
        return res.status(400).json({ success: false, message: 'Visibility must be PRIVATE, PUBLIC, or ENROLLED' });
      }
      note.visibility = visibility.toUpperCase();
    }

    if (tags !== undefined) {
      if (Array.isArray(tags)) {
        note.tags = tags.map((t) => String(t).trim()).filter(Boolean);
      } else if (typeof tags === 'string') {
        try {
          note.tags = JSON.parse(tags);
        } catch (e) {
          note.tags = tags.split(',').map((t) => t.trim()).filter(Boolean);
        }
      }
    }

    if (language !== undefined && language.trim()) {
      note.language = language.trim();
    }

    // Direct file update via Cloudinary if new file is attached
    if (req.file) {
      const targetFolder = note.lecture ? 'niu_notes/lectures' : 'niu_notes/subjects';
      const uploadResult = await uploadToCloudinary(req.file.buffer, {
        folder: targetFolder,
        resource_type: 'auto'
      });
      note.fileUrl = uploadResult.secure_url;
      note.fileName = req.body.fileName || req.file.originalname;
      note.fileType = req.body.fileType
        ? req.body.fileType.toUpperCase()
        : getFileTypeFromFilename(req.file.originalname);
      note.fileSize = uploadResult.bytes || req.file.size;
    } else {
      if (fileUrl !== undefined && fileUrl.trim()) {
        note.fileUrl = fileUrl.trim();
      }
      if (fileName !== undefined && fileName.trim()) {
        note.fileName = fileName.trim();
      }
      if (fileType !== undefined) {
        const upper = fileType.trim().toUpperCase();
        if (!['PDF', 'DOC', 'DOCX', 'JPG', 'JPEG', 'PNG'].includes(upper)) {
          return res.status(400).json({ success: false, message: 'Invalid file type' });
        }
        note.fileType = upper;
      }
      if (fileSize !== undefined) {
        note.fileSize = fileSize !== null ? Number(fileSize) : null;
      }
    }

    if (pageCount !== undefined) {
      note.pageCount = pageCount !== null ? Number(pageCount) : null;
    }

    note.updatedBy = req.user.userId;
    await note.save();

    return res.status(200).json({
      success: true,
      message: 'Note updated successfully',
      data: note
    });
  } catch (error) {
    console.error('Error updating note:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error updating note'
    });
  }
};

 
const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const note = await Note.findById(id);
    if (!note || note.status === 'ARCHIVED') {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    // Ownership check
    const currentUserId = req.user.userId;
    const isOwner = note.owner.toString() === currentUserId.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this note'
      });
    }

    // Soft delete/archive the note
    note.status = 'ARCHIVED';
    note.updatedBy = currentUserId;
    await note.save();

    // Decrement parent structure note counters safely
    await Promise.all([
      Semester.findByIdAndUpdate(note.semester, { $inc: { noteCount: -1 } }),
      Subject.findByIdAndUpdate(note.subject, { $inc: { noteCount: -1 } }),
      SavedNote.deleteMany({ note: note._id })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Note deleted successfully',
      data: { id: note._id }
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting note'
    });
  }
};

 
const incrementNoteView = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const note = await Note.findById(id);
    if (!note || note.status === 'ARCHIVED') {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const userId = req.user ? (req.user.userId || req.user.id) : null;
    const isOwner = userId && note.owner.toString() === userId.toString();
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (note.visibility === 'PRIVATE' && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this note'
      });
    }

    if (note.visibility === 'ENROLLED' && !isOwner && !isAdmin) {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to view this enrolled course note'
        });
      }
      const isEnrolled = await NoteEnrollment.exists({
        student: userId,
        course: note.course,
        status: 'ACTIVE'
      });
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'Access restricted to students enrolled in this course',
          isEnrollmentRequired: true
        });
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(
      note._id,
      { $inc: { views: 1 } },
      { new: true, select: 'views' }
    );

    return res.status(200).json({
      success: true,
      data: { views: updatedNote.views }
    });
  } catch (error) {
    console.error('Error incrementing note view:', error);
    return res.status(500).json({
      success: false,
      message: 'Error incrementing view count'
    });
  }
};
 
const incrementNoteDownload = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const note = await Note.findById(id);
    if (!note || note.status === 'ARCHIVED') {
      return res.status(404).json({
        success: false,
        message: 'Note not found'
      });
    }

    const userId = req.user ? (req.user.userId || req.user.id) : null;
    const isOwner = userId && note.owner.toString() === userId.toString();
    const isAdmin = req.user && req.user.role === 'ADMIN';

    if (note.visibility === 'PRIVATE' && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to download this note'
      });
    }

    if (note.visibility === 'ENROLLED' && !isOwner && !isAdmin) {
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required to download this enrolled note'
        });
      }
      const isEnrolled = await NoteEnrollment.exists({
        student: userId,
        note: note._id,
        status: 'ACTIVE'
      });
      if (!isEnrolled) {
        return res.status(403).json({
          success: false,
          message: 'Access restricted to students enrolled in this note',
          isEnrollmentRequired: true
        });
      }
    }

    const updatedNote = await Note.findByIdAndUpdate(
      note._id,
      { $inc: { downloads: 1 } },
      { new: true, select: 'downloads fileUrl' }
    );

    return res.status(200).json({
      success: true,
      data: {
        downloads: updatedNote.downloads,
        fileUrl: updatedNote.fileUrl
      }
    });
  } catch (error) {
    console.error('Error incrementing download:', error);
    return res.status(500).json({
      success: false,
      message: 'Error incrementing download count'
    });
  }
};
 
const enrollInNote = async (req, res) => {
  try {
    const noteId = req.params.id || req.params.noteId || req.body.noteId;

    if (!isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const note = await Note.findById(noteId);
    if (!note || note.status === 'ARCHIVED') {
      return res.status(404).json({
        success: false,
        message: 'Note not found or unavailable for enrollment'
      });
    }

    const userId = req.user.userId || req.user.id;
    const isOwner = note.owner.toString() === userId.toString();
    const isAdmin = req.user.role === 'ADMIN';

    // Owner already has full access to their own note
    if (isOwner) {
      return res.status(200).json({
        success: true,
        message: 'You are the owner of this note. Full access granted.',
        isEnrolled: true,
        isOwner: true,
        data: {
          note: note._id,
          status: 'ACTIVE'
        }
      });
    }

    // Cannot enroll in private notes unless owner or admin
    if (note.visibility === 'PRIVATE' && !isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Cannot enroll in a private note'
      });
    }

    // Check existing enrollment
    let enrollment = await NoteEnrollment.findOne({
      student: userId,
      note: note._id
    });

    if (enrollment) {
      if (enrollment.status === 'ACTIVE') {
        return res.status(200).json({
          success: true,
          message: 'Already enrolled in this note',
          isEnrolled: true,
          data: enrollment
        });
      }

      // Reactivate previous enrollment
      enrollment.status = 'ACTIVE';
      enrollment.enrolledAt = new Date();
      enrollment.lastAccessedAt = new Date();
      await enrollment.save();

      return res.status(200).json({
        success: true,
        message: 'Note enrollment reactivated successfully',
        isEnrolled: true,
        data: enrollment
      });
    }

    try {
      enrollment = await NoteEnrollment.create({
        student: userId,
        note: note._id,
        status: 'ACTIVE',
        enrolledAt: new Date(),
        lastAccessedAt: new Date(),
        progress: 0
      });
    } catch (createError) {
      if (createError.code === 11000) {
        enrollment = await NoteEnrollment.findOne({
          student: userId,
          note: note._id
        });
        return res.status(200).json({
          success: true,
          message: 'Already enrolled in this note',
          isEnrolled: true,
          data: enrollment
        });
      }
      throw createError;
    }

    return res.status(201).json({
      success: true,
      message: 'Enrolled in note successfully',
      isEnrolled: true,
      data: enrollment
    });
  } catch (error) {
    console.error('Error enrolling in note:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error enrolling in note'
    });
  }
};

/**
 * @desc    Unenroll from a note
 * @route   DELETE /api/notes/:id/enroll OR POST /api/notes/:id/unenroll
 * @access  Private (Authenticated User - Student)
 */
const unenrollFromNote = async (req, res) => {
  try {
    const noteId = req.params.id || req.params.noteId || req.body.noteId;

    if (!isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const userId = req.user.userId || req.user.id;
    const enrollment = await NoteEnrollment.findOne({
      student: userId,
      note: noteId
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment record not found for this note'
      });
    }

    enrollment.status = 'CANCELLED';
    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: 'Unenrolled from note successfully',
      isEnrolled: false,
      data: enrollment
    });
  } catch (error) {
    console.error('Error unenrolling from note:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error unenrolling from note'
    });
  }
};

/**
 * @desc    Get notes the authenticated student is currently enrolled in
 * @route   GET /api/notes/enrolled/my
 * @access  Private (Authenticated User - Student)
 */
const getMyEnrolledNotes = async (req, res) => {
  try {
    const { page, limit, skip, sort } = parsePagination(req.query);
    const userId = req.user.userId || req.user.id;

    const filter = {
      student: userId,
      status: 'ACTIVE'
    };

    const [enrollments, total] = await Promise.all([
      NoteEnrollment.find(filter)
        .sort(sort || { enrolledAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'note',
          populate: [
            { path: 'owner', select: 'name email role' },
            { path: 'course', select: 'name slug courseCode' },
            { path: 'semester', select: 'name semesterNumber' },
            { path: 'subject', select: 'name slug subjectCode' }
          ]
        })
        .lean(),
      NoteEnrollment.countDocuments(filter)
    ]);

    const validEnrollments = enrollments.filter(
      (item) => item.note != null && item.note.status !== 'ARCHIVED'
    );

    return res.status(200).json({
      success: true,
      count: validEnrollments.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: validEnrollments
    });
  } catch (error) {
    console.error('Error fetching enrolled notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching enrolled notes'
    });
  }
};

/**
 * @desc    Check enrollment status for a specific note
 * @route   GET /api/notes/:id/enrollment
 * @access  Private (Authenticated User)
 */
const checkNoteEnrollment = async (req, res) => {
  try {
    const noteId = req.params.id || req.params.noteId;

    if (!isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const userId = req.user.userId || req.user.id;
    const enrollment = await NoteEnrollment.findOne({
      student: userId,
      note: noteId,
      status: 'ACTIVE'
    }).lean();

    return res.status(200).json({
      success: true,
      data: {
        isEnrolled: Boolean(enrollment),
        enrollment: enrollment || null
      }
    });
  } catch (error) {
    console.error('Error checking note enrollment:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking note enrollment status'
    });
  }
};

/**
 * @desc    Update progress on an enrolled note
 * @route   PATCH /api/notes/:id/progress
 * @access  Private (Authenticated User)
 */
const updateNoteProgress = async (req, res) => {
  try {
    const noteId = req.params.id || req.params.noteId;
    const { progress } = req.body;

    if (!isValidObjectId(noteId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid note ID format'
      });
    }

    const numericProgress = Number(progress);
    if (isNaN(numericProgress) || numericProgress < 0 || numericProgress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be a number between 0 and 100'
      });
    }

    const userId = req.user.userId || req.user.id;
    const enrollment = await NoteEnrollment.findOne({
      student: userId,
      note: noteId,
      status: 'ACTIVE'
    });

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Active enrollment not found for this note'
      });
    }

    enrollment.progress = numericProgress;
    enrollment.lastAccessedAt = new Date();
    if (numericProgress >= 100) {
      enrollment.status = 'COMPLETED';
    }

    await enrollment.save();

    return res.status(200).json({
      success: true,
      message: 'Note progress updated successfully',
      data: enrollment
    });
  } catch (error) {
    console.error('Error updating note progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating note progress'
    });
  }
};

const getAllNotesAdmin = async (req, res) => {
  try {
    const { search, q, visibility, status, course } = req.query;
    const filter = {
      status: { $ne: 'ARCHIVED' }
    };

    if (visibility) {
      filter.visibility = visibility.toUpperCase();
    }
    if (status) {
      filter.status = status.toUpperCase();
    }
    if (course) {
      filter.course = course;
    }

    const searchTerm = search || q;
    if (searchTerm && searchTerm.trim()) {
      const sanitized = searchTerm.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } }
      ];
    }

    const notes = await Note.find(filter)
      .populate('course', 'name slug courseCode')
      .populate('semester', 'name semesterNumber')
      .populate('subject', 'name slug subjectCode')
      .populate('owner', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching admin notes:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch notes'
    });
  }
};

module.exports = {
  uploadFile,
  createNote,
  getMyNotes,
  getPublicNotes,
  getAllNotesAdmin,
  getNoteById,
  updateNote,
  deleteNote,
  incrementNoteView,
  incrementNoteDownload,
  enrollInNote,
  unenrollFromNote,
  getMyEnrolledNotes,
  checkNoteEnrollment,
  updateNoteProgress
};
 