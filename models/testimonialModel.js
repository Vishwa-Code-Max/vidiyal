import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  service: {
    type: String,
    required: [true, 'Service is required'],
    enum: [
      'Photography',
      'Videography', 
      'Editing',
      'Branding',
      'Digital Marketing',
      'Brand Consulting',
      'Event Management'
    ]
  },
  review: {
    type: String,
    required: [true, 'Review is required'],
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  image: {
    type: String,
    default: '' // Optional
  },
  serviceLink: {
    type: String,
    default: '' // Optional
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
testimonialSchema.index({ service: 1, createdAt: -1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ id: 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;