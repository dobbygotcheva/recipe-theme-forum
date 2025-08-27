const Theme = require('../models/theme.model');
const User = require('../models/user.model');

/**
 * Theme Service
 * Handles business logic for theme/recipe operations
 */

class ThemeService {
  constructor() {
    this.defaultLimit = 20;
    this.maxLimit = 100;
  }

  /**
     * Create a new theme
     * @param {Object} themeData - Theme data
     * @param {string} authorId - Author user ID
     * @returns {Object} Created theme
     */
  async createTheme(themeData, authorId) {
    try {
      // Validate author exists
      const author = await User.findById(authorId);
      if (!author) {
        throw new Error('Author not found');
      }

      // Set author and default values
      const theme = new Theme({
        ...themeData,
        author: authorId,
        status: 'draft'
      });

      // Validate theme data
      await theme.validate();

      // Save theme
      const savedTheme = await theme.save();

      // Populate author information
      await savedTheme.populate('author', 'username firstName lastName avatar');

      return savedTheme;
    } catch (error) {
      throw new Error(`Theme creation failed: ${error.message}`);
    }
  }

  /**
     * Get theme by ID
     * @param {string} themeId - Theme ID
     * @param {boolean} incrementViews - Whether to increment view count
     * @returns {Object} Theme data
     */
  async getThemeById(themeId, incrementViews = false) {
    try {
      const theme = await Theme.findById(themeId)
        .populate('author', 'username firstName lastName avatar bio')
        .populate('approvedBy', 'username firstName lastName');

      if (!theme) {
        throw new Error('Theme not found');
      }

      // Increment views if requested and theme is published
      if (incrementViews && theme.isPublished && theme.isApproved) {
        await theme.incrementViews();
      }

      return theme;
    } catch (error) {
      throw new Error(`Failed to get theme: ${error.message}`);
    }
  }

  /**
     * Get themes with pagination and filters
     * @param {Object} options - Query options
     * @returns {Object} Paginated themes and metadata
     */
  async getThemes(options = {}) {
    try {
      const {
        page = 1,
        limit = this.defaultLimit,
        category,
        difficulty,
        author,
        tags,
        dietary,
        cuisine,
        season,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        status = 'published'
      } = options;

      // Validate pagination parameters
      const validatedLimit = Math.min(Math.max(1, limit), this.maxLimit);
      const validatedPage = Math.max(1, page);
      const skip = (validatedPage - 1) * validatedLimit;

      // Build query
      const query = {};

      // Status filter
      if (status === 'published') {
        query.isPublished = true;
        query.isApproved = true;
        query.status = 'published';
      } else if (status === 'draft') {
        query.status = 'draft';
      } else if (status === 'pending') {
        query.status = 'pending';
      } else if (status === 'rejected') {
        query.status = 'rejected';
      }

      // Apply filters
      if (category) {query.category = category;}
      if (difficulty) {query.difficulty = difficulty;}
      if (author) {query.author = author;}
      if (tags && tags.length > 0) {query.tags = { $in: tags };}
      if (dietary && dietary.length > 0) {query.dietary = { $in: dietary };}
      if (cuisine) {query.cuisine = cuisine;}
      if (season) {query.season = season;}

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query
      const [themes, total] = await Promise.all([
        Theme.find(query)
          .populate('author', 'username firstName lastName avatar')
          .sort(sort)
          .skip(skip)
          .limit(validatedLimit),
        Theme.countDocuments(query)
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / validatedLimit);
      const hasNextPage = validatedPage < totalPages;
      const hasPrevPage = validatedPage > 1;

      return {
        themes,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? validatedPage + 1 : null,
          prevPage: hasPrevPage ? validatedPage - 1 : null
        }
      };
    } catch (error) {
      throw new Error(`Failed to get themes: ${error.message}`);
    }
  }

  /**
     * Update theme
     * @param {string} themeId - Theme ID
     * @param {Object} updateData - Update data
     * @param {string} userId - User ID performing update
     * @returns {Object} Updated theme
     */
  async updateTheme(themeId, updateData, userId) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check permissions
      if (theme.author.toString() !== userId) {
        throw new Error('Unauthorized: Only the author can update this theme');
      }

      // Prevent updating published themes to draft
      if (theme.isPublished && updateData.status === 'draft') {
        throw new Error('Cannot change published theme to draft');
      }

      // Update theme
      Object.assign(theme, updateData);

      // Reset approval if content changed
      if (updateData.content || updateData.ingredients || updateData.instructions) {
        theme.isApproved = false;
        theme.approvedBy = undefined;
        theme.approvedAt = undefined;
        theme.status = 'pending';
      }

      const updatedTheme = await theme.save();

      // Populate author information
      await updatedTheme.populate('author', 'username firstName lastName avatar');

      return updatedTheme;
    } catch (error) {
      throw new Error(`Theme update failed: ${error.message}`);
    }
  }

  /**
     * Delete theme
     * @param {string} themeId - Theme ID
     * @param {string} userId - User ID performing deletion
     * @returns {boolean} Success status
     */
  async deleteTheme(themeId, userId) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check permissions
      if (theme.author.toString() !== userId) {
        throw new Error('Unauthorized: Only the author can delete this theme');
      }

      // Soft delete by changing status to archived
      theme.status = 'archived';
      await theme.save();

      return true;
    } catch (error) {
      throw new Error(`Theme deletion failed: ${error.message}`);
    }
  }

  /**
     * Publish theme
     * @param {string} themeId - Theme ID
     * @param {string} userId - User ID performing action
     * @returns {Object} Updated theme
     */
  async publishTheme(themeId, userId) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check permissions
      if (theme.author.toString() !== userId) {
        throw new Error('Unauthorized: Only the author can publish this theme');
      }

      // Check if theme is ready for publishing
      if (theme.status !== 'draft' && theme.status !== 'pending') {
        throw new Error('Theme is not in draft or pending status');
      }

      // Publish theme
      await theme.publish();

      // Populate author information
      await theme.populate('author', 'username firstName lastName avatar');

      return theme;
    } catch (error) {
      throw new Error(`Theme publishing failed: ${error.message}`);
    }
  }

  /**
     * Unpublish theme
     * @param {string} themeId - Theme ID
     * @param {string} userId - User ID performing action
     * @returns {Object} Updated theme
     */
  async unpublishTheme(themeId, userId) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check permissions
      if (theme.author.toString() !== userId) {
        throw new Error('Unauthorized: Only the author can unpublish this theme');
      }

      // Unpublish theme
      await theme.unpublish();

      // Populate author information
      await theme.populate('author', 'username firstName lastName avatar');

      return theme;
    } catch (error) {
      throw new Error(`Theme unpublishing failed: ${error.message}`);
    }
  }

  /**
     * Approve theme (admin only)
     * @param {string} themeId - Theme ID
     * @param {string} adminId - Admin user ID
     * @returns {Object} Updated theme
     */
  async approveTheme(themeId, adminId) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check if theme is pending approval
      if (theme.status !== 'pending') {
        throw new Error('Theme is not pending approval');
      }

      // Approve theme
      await theme.approve(adminId);

      // Populate author and approver information
      await theme.populate('author', 'username firstName lastName avatar');
      await theme.populate('approvedBy', 'username firstName lastName');

      return theme;
    } catch (error) {
      throw new Error(`Theme approval failed: ${error.message}`);
    }
  }

  /**
     * Reject theme (admin only)
     * @param {string} themeId - Theme ID
     * @param {string} adminId - Admin user ID
     * @param {string} reason - Rejection reason
     * @returns {Object} Updated theme
     */
  async rejectTheme(themeId, adminId, reason) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check if theme is pending approval
      if (theme.status !== 'pending') {
        throw new Error('Theme is not pending approval');
      }

      // Reject theme
      await theme.reject(reason, adminId);

      // Populate author and approver information
      await theme.populate('author', 'username firstName lastName avatar');
      await theme.populate('approvedBy', 'username firstName lastName');

      return theme;
    } catch (error) {
      throw new Error(`Theme rejection failed: ${error.message}`);
    }
  }

  /**
     * Like theme
     * @param {string} themeId - Theme ID
     * @param {string} userId - User ID liking the theme
     * @returns {Object} Updated theme
     */
  async likeTheme(themeId, userId) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check if theme is published
      if (!theme.isPublished || !theme.isApproved) {
        throw new Error('Cannot like unpublished theme');
      }

      // Increment likes
      await theme.incrementLikes();

      // Populate author information
      await theme.populate('author', 'username firstName lastName avatar');

      return theme;
    } catch (error) {
      throw new Error(`Theme like failed: ${error.message}`);
    }
  }

  /**
     * Unlike theme
     * @param {string} themeId - Theme ID
     * @param {string} userId - User ID unliking the theme
     * @returns {Object} Updated theme
     */
  async unlikeTheme(themeId, userId) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check if theme is published
      if (!theme.isPublished || !theme.isApproved) {
        throw new Error('Cannot unlike unpublished theme');
      }

      // Decrement likes
      await theme.decrementLikes();

      // Populate author information
      await theme.populate('author', 'username firstName lastName avatar');

      return theme;
    } catch (error) {
      throw new Error(`Theme unlike failed: ${error.message}`);
    }
  }

  /**
     * Rate theme
     * @param {string} themeId - Theme ID
     * @param {string} userId - User ID rating the theme
     * @param {number} rating - Rating value (1-5)
     * @returns {Object} Updated theme
     */
  async rateTheme(themeId, userId, rating) {
    try {
      const theme = await Theme.findById(themeId);
      if (!theme) {
        throw new Error('Theme not found');
      }

      // Check if theme is published
      if (!theme.isPublished || !theme.isApproved) {
        throw new Error('Cannot rate unpublished theme');
      }

      // Validate rating
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      // Update rating
      await theme.updateRating(rating);

      // Populate author information
      await theme.populate('author', 'username firstName lastName avatar');

      return theme;
    } catch (error) {
      throw new Error(`Theme rating failed: ${error.message}`);
    }
  }

  /**
     * Get popular themes
     * @param {number} limit - Number of themes to return
     * @returns {Array} Popular themes
     */
  async getPopularThemes(limit = 10) {
    try {
      const themes = await Theme.findPopular(limit);

      // Populate author information
      await Theme.populate(themes, {
        path: 'author',
        select: 'username firstName lastName avatar'
      });

      return themes;
    } catch (error) {
      throw new Error(`Failed to get popular themes: ${error.message}`);
    }
  }

  /**
     * Get trending themes
     * @param {number} limit - Number of themes to return
     * @returns {Array} Trending themes
     */
  async getTrendingThemes(limit = 10) {
    try {
      const themes = await Theme.findTrending(limit);

      // Populate author information
      await Theme.populate(themes, {
        path: 'author',
        select: 'username firstName lastName avatar'
      });

      return themes;
    } catch (error) {
      throw new Error(`Failed to get trending themes: ${error.message}`);
    }
  }

  /**
     * Search themes
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Array} Search results
     */
  async searchThemes(query, options = {}) {
    try {
      const themes = await Theme.search(query, options);

      // Populate author information
      await Theme.populate(themes, {
        path: 'author',
        select: 'username firstName lastName avatar'
      });

      return themes;
    } catch (error) {
      throw new Error(`Theme search failed: ${error.message}`);
    }
  }

  /**
     * Get theme statistics
     * @returns {Object} Theme statistics
     */
  async getThemeStats() {
    try {
      const stats = await Theme.getStats();
      return stats[0] || {
        totalThemes: 0,
        totalViews: 0,
        totalLikes: 0,
        avgRating: 0,
        avgPrepTime: 0,
        avgCookTime: 0
      };
    } catch (error) {
      throw new Error(`Failed to get theme statistics: ${error.message}`);
    }
  }

  /**
     * Get themes by author
     * @param {string} authorId - Author user ID
     * @param {Object} options - Query options
     * @returns {Object} Author's themes with pagination
     */
  async getThemesByAuthor(authorId, options = {}) {
    try {
      const {
        page = 1,
        limit = this.defaultLimit,
        status = 'all'
      } = options;

      // Validate pagination parameters
      const validatedLimit = Math.min(Math.max(1, limit), this.maxLimit);
      const validatedPage = Math.max(1, page);
      const skip = (validatedPage - 1) * validatedLimit;

      // Build query
      const query = { author: authorId };

      if (status !== 'all') {
        if (status === 'published') {
          query.isPublished = true;
          query.isApproved = true;
          query.status = 'published';
        } else {
          query.status = status;
        }
      }

      // Execute query
      const [themes, total] = await Promise.all([
        Theme.find(query)
          .populate('author', 'username firstName lastName avatar')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(validatedLimit),
        Theme.countDocuments(query)
      ]);

      // Calculate pagination metadata
      const totalPages = Math.ceil(total / validatedLimit);
      const hasNextPage = validatedPage < totalPages;
      const hasPrevPage = validatedPage > 1;

      return {
        themes,
        pagination: {
          page: validatedPage,
          limit: validatedLimit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
          nextPage: hasNextPage ? validatedPage + 1 : null,
          prevPage: hasPrevPage ? validatedPage - 1 : null
        }
      };
    } catch (error) {
      throw new Error(`Failed to get author themes: ${error.message}`);
    }
  }
}

// Create and export singleton instance
const themeService = new ThemeService();

module.exports = themeService;
