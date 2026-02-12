import express from 'express';
import {
  getTestimonials,
  getTestimonial,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getServices,
  getStats
} from '../controllers/testimonialController.js';

const router = express.Router();

// Testimonial routes
router.route('/')
  .get(getTestimonials)
  .post(createTestimonial);

router.route('/services')
  .get(getServices);

router.route('/stats')
  .get(getStats);

router.route('/:id')
  .get(getTestimonial)
  .put(updateTestimonial)
  .delete(deleteTestimonial);

export default router;