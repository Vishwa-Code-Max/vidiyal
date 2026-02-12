import Media from '../models/mediaModel.js';
import path from 'path';
import fs from 'fs';

// Get all media
export const getMedia = async (req, res) => {
  try {
    const media = await Media.find().sort({ createdAt: -1 });
    
    // Convert local file paths to URLs
    const mediaWithUrls = media.map(item => {
      const mediaObj = item.toObject();
      mediaObj.image = convertToUrl(mediaObj.image, req);
      return mediaObj;
    });
    
    res.status(200).json(mediaWithUrls);
  } catch (error) {
    console.error('Error getting media:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

// Upload multiple images
export const uploadMediaController = async (req, res) => {
  try {
    console.log('Upload media controller called');
    console.log('Request files:', req.files);
    console.log('Request body:', req.body);
    
    const files = req.files;
    
    if (!files || files.length === 0) {
      return res.status(400).json({ 
        error: 'No files uploaded',
        message: 'Please select at least one image to upload.' 
      });
    }
    
    console.log(`Processing ${files.length} file(s)...`);
    
    // Process each uploaded file
    const mediaPromises = files.map(file => {
      // Generate unique ID
      const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1E9);
      
      // Store relative path
      const imagePath = `uploads/media/${file.filename}`;
      
      return Media.create({
        id: `media-${uniqueId}`,
        image: imagePath,
        createdAt: new Date()
      });
    });
    
    // Wait for all media to be created
    const createdMedia = await Promise.all(mediaPromises);
    
    // Convert file paths to URLs for response
    const mediaWithUrls = createdMedia.map(item => {
      const mediaObj = item.toObject();
      mediaObj.image = convertToUrl(mediaObj.image, req);
      return mediaObj;
    });
    
    console.log('Upload successful:', mediaWithUrls.length, 'files uploaded');
    
    res.status(201).json(mediaWithUrls);
    
  } catch (error) {
    console.error('Error uploading media:', error);
    
    // Clean up uploaded files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        const filePath = path.join(process.cwd(), 'uploads', 'media', file.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        error: 'Validation error',
        details: Object.values(error.errors).map(err => err.message)
      });
    }
    
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
};

// Delete media
export const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find media by ID
    const media = await Media.findOne({ id });
    
    if (!media) {
      return res.status(404).json({ 
        error: 'Not found',
        message: 'Media file not found.' 
      });
    }
    
    // Delete file from filesystem
    const filePath = path.join(process.cwd(), media.image);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    }
    
    // Delete from database
    await Media.deleteOne({ id });
    
    res.status(200).json({ 
      success: true,
      message: 'Media deleted successfully.' 
    });
    
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({ 
      error: 'Delete failed',
      message: error.message 
    });
  }
};

// Helper function to convert file path to URL
const convertToUrl = (filePath, req) => {
  if (!filePath) return '';
  
  // If it's already a full URL, return as is
  if (filePath.startsWith('http')) {
    return filePath;
  }
  
  // Convert relative path to full URL
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  return `${baseUrl}/${filePath.replace(/\\/g, '/')}`;
};