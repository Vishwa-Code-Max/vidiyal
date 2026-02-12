import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Media = mongoose.model('Media', mediaSchema);

export default Media;