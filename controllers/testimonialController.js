import Testimonial from '../models/testimonialModel.js';

// Get all testimonials
export const getTestimonials = async (req, res) => {
  try {
    const { service, sort = '-createdAt' } = req.query;
    
    let query = {};
    if (service && service !== 'all') {
      query.service = service;
    }
    
    const testimonials = await Testimonial.find(query).sort(sort);
    
    res.status(200).json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

// Get single testimonial
export const getTestimonial = async (req, res) => {
  try {
    const testimonial = await Testimonial.findOne({ id: req.params.id });
    
    if (!testimonial) {
      return res.status(404).json({ 
        error: 'Testimonial not found' 
      });
    }
    
    res.status(200).json(testimonial);
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

// Create testimonial
export const createTestimonial = async (req, res) => {
  try {
    const { id, name, service, review, rating, image = '', serviceLink = '' } = req.body;
    
    // Validate required fields
    if (!id || !name || !service || !review || !rating) {
      return res.status(400).json({ 
        error: 'Please provide all required fields including id' 
      });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    // Check if testimonial with same id already exists
    const existingTestimonial = await Testimonial.findOne({ id });
    if (existingTestimonial) {
      return res.status(400).json({ 
        error: 'Testimonial with this ID already exists' 
      });
    }
    
    const testimonial = await Testimonial.create({
      id,
      name,
      service,
      review,
      rating,
      image,
      serviceLink
    });
    
    res.status(201).json(testimonial);
  } catch (error) {
    console.error('Error creating testimonial:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        error: 'Validation error',
        details: messages 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

// Update testimonial
export const updateTestimonial = async (req, res) => {
  try {
    const { name, service, review, rating, image, serviceLink } = req.body;
    
    const testimonial = await Testimonial.findOne({ id: req.params.id });
    
    if (!testimonial) {
      return res.status(404).json({ 
        error: 'Testimonial not found' 
      });
    }
    
    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ 
        error: 'Rating must be between 1 and 5' 
      });
    }
    
    // Update fields
    testimonial.name = name || testimonial.name;
    testimonial.service = service || testimonial.service;
    testimonial.review = review || testimonial.review;
    testimonial.rating = rating || testimonial.rating;
    testimonial.image = image || testimonial.image;
    testimonial.serviceLink = serviceLink || testimonial.serviceLink;
    testimonial.updatedAt = Date.now();
    
    await testimonial.save();
    
    res.status(200).json(testimonial);
  } catch (error) {
    console.error('Error updating testimonial:', error);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ 
        error: 'Validation error',
        details: messages 
      });
    }
    
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

// Delete testimonial
export const deleteTestimonial = async (req, res) => {
  try {
    
    const testimonial = await Testimonial.findOne({ id: req.params.id });
    
    if (!testimonial) {
      return res.status(404).json({ 
        error: 'Testimonial not found' 
      });
    }
    
    await testimonial.deleteOne();
    
    res.status(200).json({ 
      success: true, 
      message: 'Testimonial deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

// Get services (distinct service types)
export const getServices = async (req, res) => {
  try {
    const services = await Testimonial.distinct('service');
    
    res.status(200).json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};

// Get statistics
export const getStats = async (req, res) => {
  try {
    const total = await Testimonial.countDocuments();
    const averageRating = await Testimonial.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]);
    
    const serviceCounts = await Testimonial.aggregate([
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      total,
      averageRating: averageRating[0]?.avgRating || 0,
      serviceCounts
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Server error',
      message: error.message 
    });
  }
};