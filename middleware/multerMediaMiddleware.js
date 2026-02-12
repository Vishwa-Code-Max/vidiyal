import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads/media directory exists
const ensureUploadsDir = () => {
  const uploadsDir = path.join(process.cwd(), 'uploads', 'media');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads/media directory');
  }
  return uploadsDir;
};

// Configure storage for media (images only)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = ensureUploadsDir();
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `media-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.'), false);
  }
};

// Create multer instance for media
const uploadMedia = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 20 // Max 20 files at once
  }
});

// Middleware for handling multer errors
const handleMediaMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err.code);
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({ 
          error: 'File too large',
          message: 'Each image must be less than 10MB.'
        });
      
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          error: 'Too many files',
          message: 'Maximum 20 images can be uploaded at once.'
        });
      
      default:
        return res.status(400).json({ 
          error: 'File upload error',
          message: err.message
        });
    }
  } else if (err) {
    // Non-multer errors (e.g., from fileFilter)
    console.error('File validation error:', err.message);
    return res.status(400).json({ 
      error: 'File validation error',
      message: err.message
    });
  }
  
  next();
};

// Check if files were uploaded
const requireFiles = (req, res, next) => {
  console.log('Checking for files:', req.files);
  
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ 
      error: 'No files',
      message: 'No files were uploaded. Please select at least one image.'
    });
  }
  next();
};

export {
  uploadMedia,
  handleMediaMulterError,
  requireFiles
};