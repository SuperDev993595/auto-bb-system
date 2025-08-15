const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { requireAdmin } = require('../middleware/auth');
const { handleUploadError } = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/upload/single
// @desc    Upload a single file
// @access  Private
router.post('/single', requireAdmin, (req, res) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const type = req.body.type || 'general';
        const uploadPath = path.join(__dirname, '..', 'uploads', type);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, PDFs, documents, and text files are allowed.'));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024 // 10MB limit
    }
  }).single('file');

  upload(req, res, (err) => {
    if (err) {
      return handleUploadError(err, res);
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
      }
    });
  });
});

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple', requireAdmin, (req, res) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => {
        const type = req.body.type || 'general';
        const uploadPath = path.join(__dirname, '..', 'uploads', type);
        
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|csv/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
      
      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Invalid file type. Only images, PDFs, documents, and text files are allowed.'));
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 5 // Maximum 5 files
    }
  }).array('files', 5);

  upload(req, res, (err) => {
    if (err) {
      return handleUploadError(err, res);
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path
    }));

    res.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      data: {
        files: uploadedFiles
      }
    });
  });
});

// @route   GET /api/upload/list
// @desc    List files in a directory
// @access  Private
router.get('/list', requireAdmin, (req, res) => {
  try {
    const type = req.query.type || 'general';
    const uploadPath = path.join(__dirname, '..', 'uploads', type);
    
    if (!fs.existsSync(uploadPath)) {
      return res.json({
        success: true,
        data: {
          files: []
        }
      });
    }

    const files = fs.readdirSync(uploadPath)
      .filter(file => {
        const filePath = path.join(uploadPath, file);
        return fs.statSync(filePath).isFile();
      })
      .map(file => {
        const filePath = path.join(uploadPath, file);
        const stats = fs.statSync(filePath);
        return {
          filename: file,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          url: `/uploads/${type}/${file}`
        };
      });

    res.json({
      success: true,
      data: {
        files
      }
    });

  } catch (error) {
    console.error('List files error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/upload/download/:filename
// @desc    Download a file
// @access  Private
router.get('/download/:filename', requireAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const type = req.query.type || 'general';
    const filePath = path.join(__dirname, '..', 'uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    res.download(filePath);

  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete a file
// @access  Private
router.delete('/:filename', requireAdmin, (req, res) => {
  try {
    const { filename } = req.params;
    const type = req.query.type || 'general';
    const filePath = path.join(__dirname, '..', 'uploads', type, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
