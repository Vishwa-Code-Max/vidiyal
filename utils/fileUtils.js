// utils/fileUtils.js
import fs from 'fs';
import path from 'path';

export const deleteFile = (filePath) => {
  if (filePath && filePath.startsWith('uploads/')) {
    const absolutePath = path.join(process.cwd(), filePath);
    fs.unlink(absolutePath, (err) => {
      if (err && err.code !== 'ENOENT') {
        // Log error but don't throw to prevent blocking the main operation
        console.error('Error deleting file:', err.message);
      }
    });
  }
};

export const convertToUrl = (filePath, req) => {
  if (!filePath) return '';
  if (filePath.startsWith('http')) return filePath;
  if (filePath.startsWith('uploads/')) {
    return `${req.protocol}://${req.get('host')}/${filePath}`;
  }
  return filePath;
};

export const generateProjectId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  return `port-${randomNum}${year}${month}`;
};