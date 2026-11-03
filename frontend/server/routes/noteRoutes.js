const express = require('express');
const router = express.Router();

const {
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
} = require('../controllers/noteController');

const {
  authenticate,
  optionalAuthenticate,
  authorizeRoles
} = require('../middleware/authMiddleware');

const { upload } = require('../utils/upload');

// Standalone Cloudinary file upload
router.post('/upload', authenticate, upload.single('file'), uploadFile);

// Base note creation (supports direct multipart/form-data with Cloudinary upload or JSON)
router.post('/', authenticate, upload.single('file'), createNote);

// Specific collections before :id to prevent route shadowing
router.get('/my', authenticate, getMyNotes);
router.get('/public', optionalAuthenticate, getPublicNotes);
router.get('/admin/all', authenticate, authorizeRoles('ADMIN'), getAllNotesAdmin);
router.get('/enrolled/my', authenticate, getMyEnrolledNotes);

// Specific note operations by ID
router
  .route('/:id')
  .get(optionalAuthenticate, getNoteById)
  .patch(authenticate, upload.single('file'), updateNote)
  .delete(authenticate, deleteNote);

// Atomic counters
router.post('/:id/view', authenticate, incrementNoteView);
router.post('/:id/download', authenticate, incrementNoteDownload);

// Note enrollment operations
router
  .route('/:id/enroll')
  .post(authenticate, enrollInNote)
  .delete(authenticate, unenrollFromNote);

router.post('/:id/unenroll', authenticate, unenrollFromNote);
router.get('/:id/enrollment', authenticate, checkNoteEnrollment);
router.patch('/:id/progress', authenticate, updateNoteProgress);

module.exports = router;
