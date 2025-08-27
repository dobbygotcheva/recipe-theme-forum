const mongoose = require('mongoose');

/**
 * Theme Model
 * Represents a theme/recipe in the forum
 */

const themeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    minlength: [50, 'Content must be at least 50 characters long'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required'],
    index: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage', 'appetizer', 'soup', 'salad', 'other'],
      message: 'Category must be one of: breakfast, lunch, dinner, dessert, snack, beverage, appetizer, soup, salad, other'
    }
  },
  tags: [{
    type: String,
    trim: true,
    minlength: [2, 'Tag must be at least 2 characters long'],
    maxlength: [20, 'Tag cannot exceed 20 characters']
  }],
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['easy', 'medium', 'hard', 'expert'],
      message: 'Difficulty must be one of: easy, medium, hard, expert'
    },
    default: 'medium'
  },
  prepTime: {
    type: Number,
    required: [true, 'Preparation time is required'],
    min: [1, 'Preparation time must be at least 1 minute'],
    max: [1440, 'Preparation time cannot exceed 24 hours']
  },
  cookTime: {
    type: Number,
    required: [true, 'Cooking time is required'],
    min: [0, 'Cooking time cannot be negative'],
    max: [1440, 'Cooking time cannot exceed 24 hours']
  },
  servings: {
    type: Number,
    required: [true, 'Number of servings is required'],
    min: [1, 'Servings must be at least 1'],
    max: [100, 'Servings cannot exceed 100']
  },
  ingredients: [{
    name: {
      type: String,
      required: [true, 'Ingredient name is required'],
      trim: true,
      minlength: [2, 'Ingredient name must be at least 2 characters long'],
      maxlength: [50, 'Ingredient name cannot exceed 50 characters']
    },
    amount: {
      type: Number,
      required: [true, 'Ingredient amount is required'],
      min: [0.1, 'Ingredient amount must be at least 0.1']
    },
    unit: {
      type: String,
      required: [true, 'Ingredient unit is required'],
      trim: true,
      minlength: [1, 'Ingredient unit must be at least 1 character long'],
      maxlength: [20, 'Ingredient unit cannot exceed 20 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [100, 'Ingredient notes cannot exceed 100 characters']
    }
  }],
  instructions: [{
    step: {
      type: Number,
      required: [true, 'Step number is required'],
      min: [1, 'Step number must be at least 1']
    },
    description: {
      type: String,
      required: [true, 'Step description is required'],
      trim: true,
      minlength: [10, 'Step description must be at least 10 characters long'],
      maxlength: [500, 'Step description cannot exceed 500 characters']
    },
    time: {
      type: Number,
      min: [0, 'Step time cannot be negative'],
      max: [180, 'Step time cannot exceed 3 hours']
    },
    tips: {
      type: String,
      trim: true,
      maxlength: [200, 'Step tips cannot exceed 200 characters']
    }
  }],
  nutrition: {
    calories: {
      type: Number,
      min: [0, 'Calories cannot be negative'],
      max: [5000, 'Calories cannot exceed 5000']
    },
    protein: {
      type: Number,
      min: [0, 'Protein cannot be negative'],
      max: [200, 'Protein cannot exceed 200g']
    },
    carbs: {
      type: Number,
      min: [0, 'Carbs cannot be negative'],
      max: [500, 'Carbs cannot exceed 500g']
    },
    fat: {
      type: Number,
      min: [0, 'Fat cannot be negative'],
      max: [200, 'Fat cannot exceed 200g']
    },
    fiber: {
      type: Number,
      min: [0, 'Fiber cannot be negative'],
      max: [100, 'Fiber cannot exceed 100g']
    },
    sugar: {
      type: Number,
      min: [0, 'Sugar cannot be negative'],
      max: [200, 'Sugar cannot exceed 200g']
    }
  },
  images: [{
    url: {
      type: String,
      required: [true, 'Image URL is required'],
      trim: true
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [100, 'Image alt text cannot exceed 100 characters']
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [200, 'Image caption cannot exceed 200 characters']
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Average rating cannot be negative'],
      max: [5, 'Average rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0,
      min: [0, 'Rating count cannot be negative']
    }
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'View count cannot be negative']
  },
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Like count cannot be negative']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: {
      values: ['draft', 'pending', 'published', 'rejected', 'archived'],
      message: 'Status must be one of: draft, pending, published, rejected, archived'
    },
    default: 'draft'
  },
  rejectionReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Rejection reason cannot exceed 500 characters']
  },
  cuisine: {
    type: String,
    trim: true,
    maxlength: [50, 'Cuisine cannot exceed 50 characters']
  },
  season: {
    type: String,
    enum: {
      values: ['spring', 'summer', 'autumn', 'winter', 'all-year'],
      message: 'Season must be one of: spring, summer, autumn, winter, all-year'
    },
    default: 'all-year'
  },
  dietary: [{
    type: String,
    enum: {
      values: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'nut-free', 'low-carb', 'keto', 'paleo', 'mediterranean'],
      message: 'Dietary restriction must be one of the allowed values'
    }
  }],
  allergens: [{
    type: String,
    enum: {
      values: ['milk', 'eggs', 'fish', 'shellfish', 'tree-nuts', 'peanuts', 'wheat', 'soybeans'],
      message: 'Allergen must be one of the allowed values'
    }
  }],
  equipment: [{
    type: String,
    trim: true,
    minlength: [2, 'Equipment name must be at least 2 characters long'],
    maxlength: [50, 'Equipment name cannot exceed 50 characters']
  }],
  tips: [{
    type: String,
    trim: true,
    minlength: [10, 'Tip must be at least 10 characters long'],
    maxlength: [300, 'Tip cannot exceed 300 characters']
  }],
  variations: [{
    name: {
      type: String,
      required: [true, 'Variation name is required'],
      trim: true,
      minlength: [2, 'Variation name must be at least 2 characters long'],
      maxlength: [50, 'Variation name cannot exceed 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Variation description cannot exceed 500 characters']
    },
    modifications: [{
      type: String,
      trim: true,
      maxlength: [200, 'Modification cannot exceed 200 characters']
    }]
  }],
  source: {
    type: String,
    trim: true,
    maxlength: [200, 'Source cannot exceed 200 characters']
  },
  license: {
    type: String,
    enum: {
      values: ['public-domain', 'creative-commons', 'all-rights-reserved', 'fair-use'],
      message: 'License must be one of: public-domain, creative-commons, all-rights-reserved, fair-use'
    },
    default: 'all-rights-reserved'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual properties
themeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

themeSchema.virtual('formattedPrepTime').get(function() {
  return this.formatTime(this.prepTime);
});

themeSchema.virtual('formattedCookTime').get(function() {
  return this.formatTime(this.cookTime);
});

themeSchema.virtual('formattedTotalTime').get(function() {
  return this.formatTime(this.totalTime);
});

themeSchema.virtual('ratingPercentage').get(function() {
  return this.rating.average ? (this.rating.average / 5) * 100 : 0;
});

themeSchema.virtual('isPopular').get(function() {
  return this.views > 1000 || this.likes > 100;
});

themeSchema.virtual('isTrending').get(function() {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  return this.createdAt > oneWeekAgo && (this.views > 500 || this.likes > 50);
});

// Indexes
themeSchema.index({ title: 'text', description: 'text', content: 'text' });
themeSchema.index({ author: 1, createdAt: -1 });
themeSchema.index({ category: 1, status: 1 });
themeSchema.index({ difficulty: 1, status: 1 });
themeSchema.index({ rating: -1, status: 1 });
themeSchema.index({ views: -1, status: 1 });
themeSchema.index({ likes: -1, status: 1 });
themeSchema.index({ tags: 1 });
themeSchema.index({ cuisine: 1 });
themeSchema.index({ season: 1 });
themeSchema.index({ dietary: 1 });
themeSchema.index({ isPublished: 1, isApproved: 1 });
themeSchema.index({ isFeatured: 1, status: 1 });
themeSchema.index({ createdAt: -1 });
themeSchema.index({ updatedAt: -1 });

// Pre-save middleware
themeSchema.pre('save', function(next) {
  // Ensure only one primary image
  if (this.images && this.images.length > 0) {
    const primaryImages = this.images.filter(img => img.isPrimary);
    if (primaryImages.length > 1) {
      // Keep only the first primary image
      for (let i = 1; i < primaryImages.length; i++) {
        primaryImages[i].isPrimary = false;
      }
    }
  }

  // Sort instructions by step number
  if (this.instructions && this.instructions.length > 0) {
    this.instructions.sort((a, b) => a.step - b.step);
  }

  // Calculate average rating
  if (this.rating && this.rating.count > 0) {
    this.rating.average = Math.round((this.rating.average * 100)) / 100;
  }

  next();
});

// Pre-validate middleware
themeSchema.pre('validate', function(next) {
  // Ensure instructions are sequential
  if (this.instructions && this.instructions.length > 0) {
    for (let i = 0; i < this.instructions.length; i++) {
      this.instructions[i].step = i + 1;
    }
  }

  next();
});

// Instance methods
themeSchema.methods.formatTime = function(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  } else if (minutes < 1440) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  } else {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    return `${days}d ${hours}h`;
  }
};

themeSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

themeSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

themeSchema.methods.decrementLikes = function() {
  this.likes = Math.max(0, this.likes - 1);
  return this.save();
};

themeSchema.methods.updateRating = function(newRating) {
  if (newRating < 0 || newRating > 5) {
    throw new Error('Rating must be between 0 and 5');
  }

  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;

  return this.save();
};

themeSchema.methods.removeRating = function(oldRating) {
  if (this.rating.count <= 1) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const currentTotal = this.rating.average * this.rating.count;
    this.rating.count -= 1;
    this.rating.average = (currentTotal - oldRating) / this.rating.count;
  }

  return this.save();
};

themeSchema.methods.publish = function() {
  this.isPublished = true;
  this.status = 'published';
  this.publishedAt = new Date();
  return this.save();
};

themeSchema.methods.unpublish = function() {
  this.isPublished = false;
  this.status = 'draft';
  this.publishedAt = undefined;
  return this.save();
};

themeSchema.methods.approve = function(adminId) {
  this.isApproved = true;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.status = 'published';
  return this.save();
};

themeSchema.methods.reject = function(reason, adminId) {
  this.isApproved = false;
  this.status = 'rejected';
  this.rejectionReason = reason;
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  return this.save();
};

themeSchema.methods.addImage = function(imageData) {
  if (!this.images) {
    this.images = [];
  }

  // If this is the first image, make it primary
  if (this.images.length === 0) {
    imageData.isPrimary = true;
  }

  this.images.push(imageData);
  return this.save();
};

themeSchema.methods.removeImage = function(imageIndex) {
  if (this.images && this.images[imageIndex]) {
    const removedImage = this.images.splice(imageIndex, 1)[0];

    // If we removed the primary image and there are other images, make the first one primary
    if (removedImage.isPrimary && this.images.length > 0) {
      this.images[0].isPrimary = true;
    }

    return this.save();
  }
  throw new Error('Invalid image index');
};

themeSchema.methods.setPrimaryImage = function(imageIndex) {
  if (this.images && this.images[imageIndex]) {
    // Remove primary from all images
    this.images.forEach(img => img.isPrimary = false);

    // Set the specified image as primary
    this.images[imageIndex].isPrimary = true;

    return this.save();
  }
  throw new Error('Invalid image index');
};

// Static methods
themeSchema.statics.findPublished = function() {
  return this.find({ isPublished: true, isApproved: true, status: 'published' });
};

themeSchema.statics.findByCategory = function(category) {
  return this.find({
    category,
    isPublished: true,
    isApproved: true,
    status: 'published'
  });
};

themeSchema.statics.findByDifficulty = function(difficulty) {
  return this.find({
    difficulty,
    isPublished: true,
    isApproved: true,
    status: 'published'
  });
};

themeSchema.statics.findByAuthor = function(authorId) {
  return this.find({ author: authorId });
};

themeSchema.statics.findPopular = function(limit = 10) {
  return this.find({
    isPublished: true,
    isApproved: true,
    status: 'published'
  })
    .sort({ views: -1, likes: -1 })
    .limit(limit);
};

themeSchema.statics.findTrending = function(limit = 10) {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  return this.find({
    createdAt: { $gte: oneWeekAgo },
    isPublished: true,
    isApproved: true,
    status: 'published'
  })
    .sort({ views: -1, likes: -1 })
    .limit(limit);
};

themeSchema.statics.findByTags = function(tags) {
  return this.find({
    tags: { $in: tags },
    isPublished: true,
    isApproved: true,
    status: 'published'
  });
};

themeSchema.statics.findByDietary = function(dietary) {
  return this.find({
    dietary: { $in: dietary },
    isPublished: true,
    isApproved: true,
    status: 'published'
  });
};

themeSchema.statics.search = function(query, options = {}) {
  const searchQuery = {
    $text: { $search: query },
    isPublished: true,
    isApproved: true,
    status: 'published'
  };

  if (options.category) {
    searchQuery.category = options.category;
  }

  if (options.difficulty) {
    searchQuery.difficulty = options.difficulty;
  }

  if (options.maxTime) {
    searchQuery.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, options.maxTime] };
  }

  return this.find(searchQuery, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' } })
    .limit(options.limit || 20);
};

themeSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $match: {
        isPublished: true,
        isApproved: true,
        status: 'published'
      }
    },
    {
      $group: {
        _id: null,
        totalThemes: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalLikes: { $sum: '$likes' },
        avgRating: { $avg: '$rating.average' },
        avgPrepTime: { $avg: '$prepTime' },
        avgCookTime: { $avg: '$cookTime' }
      }
    }
  ]);
};

// Create and export model
const Theme = mongoose.model('Theme', themeSchema);

module.exports = Theme;
