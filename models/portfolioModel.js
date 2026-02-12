import mongoose from "mongoose";

const portfolioSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Photography",
        "Videography",
        "Editing",
        "Branding",
        "Digital Marketing",
        "Brand Consulting",
        "Event Management",
      ],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      enum: ["photo", "video"],
      default: "photo",
    },
    image: {
      type: String,
      required: function () {
        return this.type === "photo";
      },
    },
    videoUrl: {
      type: String,
      required: function () {
        return this.type === "video";
      },
    },
    // NEW FIELDS:
    marked: {
      type: Boolean,
      default: false,
    },
    productionType: {
      type: String,
      enum: ["UGC", "high production"],
      default: "UGC",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

portfolioSchema.index({ category: 1, createdAt: -1 });
portfolioSchema.index({ id: 1 });
portfolioSchema.index({ type: 1 });
portfolioSchema.index({ marked: 1 });
portfolioSchema.index({ productionType: 1 });

const Portfolio = mongoose.model("Portfolio", portfolioSchema);

export default Portfolio;
