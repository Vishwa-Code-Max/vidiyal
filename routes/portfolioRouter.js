// routes/portfolioRouter.js
import express from 'express';
import { upload, handleMulterError } from '../middleware/multerMiddleware.js';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getCategories
} from '../controllers/portfolioController.js';

const router = express.Router();

// Portfolio routes
router.route('/')
  .get(getProjects)
  .post(
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 }
    ]),
    handleMulterError,
    createProject
  );

router.route('/categories')
  .get(getCategories);

router.route('/:id')
  .get(getProject)
  .put(
    upload.fields([
      { name: 'image', maxCount: 1 },
      { name: 'video', maxCount: 1 }
    ]),
    handleMulterError,
    updateProject
  )
  .delete(deleteProject);

export default router;