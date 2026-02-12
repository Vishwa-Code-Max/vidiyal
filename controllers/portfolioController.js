// controllers/portfolioController.js
import Portfolio from "../models/portfolioModel.js";
import {
  deleteFile,
  convertToUrl,
  generateProjectId,
} from "../utils/fileUtils.js";

// Get all projects with optional filtering by new fields
export const getProjects = async (req, res) => {
  try {
    const { category, sort = '-createdAt', marked, productionType } = req.query;
    
    let query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (marked === 'true') {
      query.marked = true;
    } else if (marked === 'false') {
      query.marked = false;
    }

    if (productionType && productionType !== 'all') {
      query.productionType = productionType;
    }
    
    let sortOption = sort;
    if (sort === 'marked-first') {
      sortOption = { marked: -1, createdAt: -1 };
    }
    
    const projects = await Portfolio.find(query).sort(sortOption);
    
    const projectsWithUrls = projects.map(project => {
      const projectObj = project.toObject();
      projectObj.image = convertToUrl(projectObj.image, req);
      projectObj.videoUrl = convertToUrl(projectObj.videoUrl, req);
      return projectObj;
    });
    
    res.status(200).json(projectsWithUrls);
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error'
    });
  }
};

// Get single project
export const getProject = async (req, res) => {
  try {
    const project = await Portfolio.findOne({ id: req.params.id });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const projectObj = project.toObject();
    projectObj.image = convertToUrl(projectObj.image, req);
    projectObj.videoUrl = convertToUrl(projectObj.videoUrl, req);

    res.status(200).json(projectObj);
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
};

export const createProject = async (req, res) => {
  try {
    const {
      id,
      title,
      description,
      category,
      type,
      imageUrl,
      videoUrl,
      marked,
      productionType,
    } = req.body;

    const files = req.files;

    if (!title || !description || !category || !type) {
      return res.status(400).json({
        error: "Title, description, category, and type are required",
      });
    }

    let projectId = id;
    if (!projectId) {
      projectId = generateProjectId();
    }

    const existingProject = await Portfolio.findOne({ id: projectId });
    if (existingProject) {
      return res.status(400).json({
        error: "Project with this ID already exists",
      });
    }

    let imagePath = "";
    let videoPath = "";

    if (type === "photo") {
      if (files && files.image && files.image[0]) {
        imagePath = `uploads/${files.image[0].filename}`;
      } else if (imageUrl) {
        imagePath = imageUrl;
      } else {
        return res.status(400).json({
          error: "Image is required for photo projects",
        });
      }
    } else if (type === "video") {
      if (files && files.video && files.video[0]) {
        videoPath = `uploads/${files.video[0].filename}`;
      } else if (videoUrl) {
        videoPath = videoUrl;
      } else {
        return res.status(400).json({
          error: "Video is required for video projects",
        });
      }
    }

    const isMarked = marked === "true" || marked === true;

    const project = await Portfolio.create({
      id: projectId,
      title,
      description,
      category,
      type,
      image: imagePath,
      videoUrl: videoPath,
      marked: isMarked,
      productionType: productionType || "UGC",
    });
    const projectObj = project.toObject();
    projectObj.image = convertToUrl(projectObj.image, req);
    projectObj.videoUrl = convertToUrl(projectObj.videoUrl, req);

    res.status(201).json(projectObj);
  } catch (error) {
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          deleteFile(`uploads/${file.filename}`);
        });
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        error: "Validation error",
        details: messages,
      });
    }

    res.status(500).json({
      error: "Server error",
    });
  }
};

export const updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    const {
      title,
      description,
      category,
      type,
      imageUrl,
      videoUrl,
      marked,
      productionType,
    } = req.body;

    const files = req.files;

    const project = await Portfolio.findOne({ id: projectId });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    if (title) project.title = title;
    if (description) project.description = description;
    if (category) project.category = category;
    if (type) project.type = type;

    if (marked !== undefined) {
      project.marked = marked === "true" || marked === true;
    }
    if (productionType) {
      project.productionType = productionType;
    }

    if (type === "photo") {
      if (files && files.image && files.image[0]) {
        deleteFile(project.image);
        project.image = `uploads/${files.image[0].filename}`;
      } else if (imageUrl) {
        project.image = imageUrl;
      }
      project.videoUrl = "";
    } else if (type === "video") {
      if (files && files.video && files.video[0]) {
        deleteFile(project.videoUrl);
        project.videoUrl = `uploads/${files.video[0].filename}`;
      } else if (videoUrl) {
        project.videoUrl = videoUrl;
      }
      project.image = "";
    }

    project.updatedAt = Date.now();

    await project.save();
    const projectObj = project.toObject();
    projectObj.image = convertToUrl(projectObj.image, req);
    projectObj.videoUrl = convertToUrl(projectObj.videoUrl, req);

    res.status(200).json(projectObj);
  } catch (error) {
    if (req.files) {
      Object.values(req.files).forEach((fileArray) => {
        fileArray.forEach((file) => {
          deleteFile(`uploads/${file.filename}`);
        });
      });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        error: "Validation error",
        details: messages,
      });
    }

    res.status(500).json({
      error: "Server error",
    });
  }
};

// Delete project
export const deleteProject = async (req, res) => {
  try {
    const project = await Portfolio.findOne({ id: req.params.id });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    // Delete associated files
    deleteFile(project.image);
    deleteFile(project.videoUrl);

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Server error",
    });
  }
};

// Get all categories and production types
export const getCategories = async (req, res) => {
  try {
    const categories = await Portfolio.distinct('category');
    const productionTypes = await Portfolio.distinct('productionType'); // NEW: Get unique production types
    
    res.status(200).json({
      categories,
      productionTypes
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Server error'
    });
  }
};