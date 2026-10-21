const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const prisma = require('../config/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const sanitizedName = file.originalname
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(ext, '');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter (PDF, DOC, DOCX) and size limit (5MB)
const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Only .pdf, .doc, and .docx resume files are allowed.'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ----------------------------------------------------
// 1. UPLOAD RESUME (Candidate)
// ----------------------------------------------------
router.post('/upload', requireAuth, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No resume file uploaded.' });
    }

    const userId = req.user.id;

    // Reset default flags for existing resumes
    await prisma.resume.updateMany({
      where: { userId },
      data: { isDefault: false },
    });

    // Save new resume
    const newResume = await prisma.resume.create({
      data: {
        userId,
        fileName: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        isDefault: true,
      },
    });

    // Increase profile completion score if candidate profile exists
    await prisma.candidateProfile.updateMany({
      where: { userId },
      data: {
        profileCompletion: 85,
      },
    });

    return res.status(201).json({
      message: 'Resume uploaded successfully!',
      resume: newResume,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    return res.status(500).json({ message: error.message || 'Failed to upload resume.' });
  }
});

// ----------------------------------------------------
// 2. SECURE DOWNLOAD RESUME
// ----------------------------------------------------
router.get('/download/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    // Authorization Check:
    // User is authorized if:
    // 1) User is the owner of the resume
    // 2) User is an ADMIN
    // 3) User is a RECRUITER and has a job application from this candidate
    let isAuthorized = req.user.id === resume.userId || req.user.role === 'ADMIN';

    if (!isAuthorized && req.user.role === 'RECRUITER') {
      const matchingApp = await prisma.jobApplication.findFirst({
        where: {
          candidateId: resume.userId,
          job: { recruiterId: req.user.id },
        },
      });
      if (matchingApp) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return res.status(403).json({ message: 'Unauthorized. You do not have permission to view this resume.' });
    }

    // Check if file exists on disk
    if (fs.existsSync(resume.filePath)) {
      return res.download(resume.filePath, resume.originalName);
    } else {
      // If mock seeded file or not on disk, send demo response
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}.txt"`);
      return res.send(`HireSphere Verified Resume Record:
Candidate Name: ${resume.user.name}
Resume Filename: ${resume.originalName}
Uploaded: ${resume.uploadedAt.toISOString()}
Verification: Active candidate profile verified by HireSphere.`);
    }
  } catch (error) {
    console.error('Download resume error:', error);
    return res.status(500).json({ message: 'Failed to download resume.' });
  }
});

// ----------------------------------------------------
// 3. DELETE RESUME
// ----------------------------------------------------
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findUnique({
      where: { id },
    });

    if (!resume) {
      return res.status(404).json({ message: 'Resume not found.' });
    }

    if (resume.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Unauthorized to delete this resume.' });
    }

    // Try to remove from filesystem if exists
    try {
      if (fs.existsSync(resume.filePath)) {
        fs.unlinkSync(resume.filePath);
      }
    } catch (err) {
      console.warn('Could not delete physical resume file:', err.message);
    }

    await prisma.resume.delete({ where: { id } });

    return res.json({ message: 'Resume removed successfully.' });
  } catch (error) {
    console.error('Delete resume error:', error);
    return res.status(500).json({ message: 'Failed to delete resume.' });
  }
});

module.exports = router;
