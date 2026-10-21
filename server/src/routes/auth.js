const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { requireAuth, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// Helper to generate JWT
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
};

// ----------------------------------------------------
// 1. REGISTER
// ----------------------------------------------------
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role = 'CANDIDATE', companyName, designation } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = ['CANDIDATE', 'RECRUITER'].includes(role.toUpperCase())
      ? role.toUpperCase()
      : 'CANDIDATE';

    // Create user in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          passwordHash,
          phone: phone ? phone.trim() : null,
          role: assignedRole,
          emailVerified: true,
          isActive: true,
        },
      });

      // If candidate, initialize empty profile
      if (assignedRole === 'CANDIDATE') {
        await tx.candidateProfile.create({
          data: {
            userId: user.id,
            profileCompletion: 30,
          },
        });
      }

      // If recruiter with company name, ensure company exists or create
      if (assignedRole === 'RECRUITER' && companyName) {
        const slug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const existingCompany = await tx.company.findFirst({
          where: {
            OR: [{ name: companyName.trim() }, { slug }],
          },
        });

        if (!existingCompany) {
          await tx.company.create({
            data: {
              name: companyName.trim(),
              slug: slug || `company-${Date.now()}`,
              location: 'India',
              description: `${companyName} is an employer on HireSphere.`,
            },
          });
        }
      }

      // Welcome Notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Welcome to HireSphere!',
          message: assignedRole === 'CANDIDATE'
            ? 'Complete your profile and upload your resume to get noticed by top recruiters.'
            : 'Start hiring top talent by posting your first job opening.',
          type: 'SYSTEM',
          link: assignedRole === 'CANDIDATE' ? '/candidate/dashboard' : '/recruiter/dashboard',
        },
      });

      return user;
    });

    const token = generateToken(newUser.id, newUser.role);

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        avatar: newUser.avatar,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Internal server error during registration.' });
  }
});

// ----------------------------------------------------
// 2. LOGIN
// ----------------------------------------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'This account has been deactivated or suspended.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id, user.role);

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

// ----------------------------------------------------
// 3. GET CURRENT USER DETAILS & PROFILE (/me)
// ----------------------------------------------------
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        candidateProfile: {
          include: {
            skills: true,
            experiences: true,
            educations: true,
          },
        },
        resumes: {
          orderBy: { uploadedAt: 'desc' },
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true,
            jobAlerts: true,
            notifications: {
              where: { isRead: false },
            },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const { passwordHash, ...safeUserData } = user;
    return res.json({ user: safeUserData });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Failed to retrieve profile details.' });
  }
});

// ----------------------------------------------------
// 4. UPDATE CANDIDATE PROFILE
// ----------------------------------------------------
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      phone,
      headline,
      summary,
      location,
      currentSalary,
      expectedSalary,
      noticePeriod,
      preferredLocations,
      preferredRoles,
      skills,
      experiences,
      educations,
    } = req.body;

    // Update user basic details if provided
    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(phone && { phone: phone.trim() }),
      },
    });

    // Calculate dynamic profile completion score
    let score = 30; // base for email + name
    if (headline && headline.trim().length > 5) score += 15;
    if (summary && summary.trim().length > 20) score += 15;
    if (location && location.trim().length > 2) score += 10;
    if (skills && skills.length > 0) score += 10;
    if (experiences && experiences.length > 0) score += 10;
    if (educations && educations.length > 0) score += 10;
    score = Math.min(score, 100);

    // Update or upsert candidate profile
    const updatedProfile = await prisma.candidateProfile.upsert({
      where: { userId },
      update: {
        headline,
        summary,
        location,
        currentSalary: currentSalary ? parseFloat(currentSalary) : null,
        expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
        noticePeriod,
        preferredLocations,
        preferredRoles,
        profileCompletion: score,
      },
      create: {
        userId,
        headline,
        summary,
        location,
        currentSalary: currentSalary ? parseFloat(currentSalary) : null,
        expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
        noticePeriod,
        preferredLocations,
        preferredRoles,
        profileCompletion: score,
      },
    });

    // If skills are provided as an array of strings or objects, update them
    if (Array.isArray(skills)) {
      await prisma.candidateSkill.deleteMany({
        where: { candidateProfileId: updatedProfile.id },
      });

      const skillRecords = skills.map((s) => {
        if (typeof s === 'string') {
          return { candidateProfileId: updatedProfile.id, name: s.trim() };
        }
        return {
          candidateProfileId: updatedProfile.id,
          name: s.name.trim(),
          yearsOfExp: s.yearsOfExp ? parseFloat(s.yearsOfExp) : 1.0,
          proficiency: s.proficiency || 'INTERMEDIATE',
        };
      });

      if (skillRecords.length > 0) {
        await prisma.candidateSkill.createMany({ data: skillRecords });
      }
    }

    // Return the updated full profile
    const fullUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        candidateProfile: {
          include: {
            skills: true,
            experiences: true,
            educations: true,
          },
        },
        resumes: true,
      },
    });

    const { passwordHash, ...safeUserData } = fullUser;
    return res.json({
      message: 'Profile updated successfully!',
      user: safeUserData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ message: 'Failed to update profile.' });
  }
});

module.exports = router;
