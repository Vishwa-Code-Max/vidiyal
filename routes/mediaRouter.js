import express from 'express';
import {
  uploadMedia,
  handleMediaMulterError,
  requireFiles
} from '../middleware/multerMediaMiddleware.js';
import {
  getMedia,
  uploadMediaController,
  deleteMedia
} from '../controllers/mediaController.js';

const router = express.Router();

// Media routes
router.route('/')
  .get(getMedia)
  .post(
    uploadMedia.array('images', 20),
    handleMediaMulterError,
    requireFiles,
    uploadMediaController
  );

router.route('/:id')
  .delete(deleteMedia);

export default router;