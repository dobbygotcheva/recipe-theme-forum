const themeService = require('../services/theme.service');

/**
 * Theme Controller
 * Handles HTTP requests for theme/recipe operations
 */

class ThemeController {
  /**
     * Create a new theme
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async createTheme(req, res) {
    try {
      const themeData = req.body;
      const authorId = req.user.userId;

      const theme = await themeService.createTheme(themeData, authorId);

      res.status(201).json({
        success: true,
        message: 'Theme created successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme creation failed',
        error: error.message
      });
    }
  }

  /**
     * Get theme by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getThemeById(req, res) {
    try {
      const { themeId } = req.params;
      const incrementViews = req.query.incrementViews === 'true';

      const theme = await themeService.getThemeById(themeId, incrementViews);

      res.status(200).json({
        success: true,
        message: 'Theme retrieved successfully',
        data: theme
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: 'Theme not found',
        error: error.message
      });
    }
  }

  /**
     * Get themes with pagination and filters
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getThemes(req, res) {
    try {
      const {
        page,
        limit,
        category,
        difficulty,
        author,
        tags,
        dietary,
        cuisine,
        season,
        search,
        sortBy,
        sortOrder,
        status
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        category,
        difficulty,
        author,
        tags: tags ? tags.split(',') : undefined,
        dietary: dietary ? dietary.split(',') : undefined,
        cuisine,
        season,
        search,
        sortBy,
        sortOrder,
        status
      };

      const result = await themeService.getThemes(options);

      res.status(200).json({
        success: true,
        message: 'Themes retrieved successfully',
        data: result.themes,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve themes',
        error: error.message
      });
    }
  }

  /**
     * Update theme
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async updateTheme(req, res) {
    try {
      const { themeId } = req.params;
      const updateData = req.body;
      const userId = req.user.userId;

      const theme = await themeService.updateTheme(themeId, updateData, userId);

      res.status(200).json({
        success: true,
        message: 'Theme updated successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme update failed',
        error: error.message
      });
    }
  }

  /**
     * Delete theme
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async deleteTheme(req, res) {
    try {
      const { themeId } = req.params;
      const userId = req.user.userId;

      await themeService.deleteTheme(themeId, userId);

      res.status(200).json({
        success: true,
        message: 'Theme deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme deletion failed',
        error: error.message
      });
    }
  }

  /**
     * Publish theme
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async publishTheme(req, res) {
    try {
      const { themeId } = req.params;
      const userId = req.user.userId;

      const theme = await themeService.publishTheme(themeId, userId);

      res.status(200).json({
        success: true,
        message: 'Theme published successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme publishing failed',
        error: error.message
      });
    }
  }

  /**
     * Unpublish theme
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async unpublishTheme(req, res) {
    try {
      const { themeId } = req.params;
      const userId = req.user.userId;

      const theme = await themeService.unpublishTheme(themeId, userId);

      res.status(200).json({
        success: true,
        message: 'Theme unpublished successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme unpublishing failed',
        error: error.message
      });
    }
  }

  /**
     * Approve theme (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async approveTheme(req, res) {
    try {
      const { themeId } = req.params;
      const adminId = req.user.userId;

      const theme = await themeService.approveTheme(themeId, adminId);

      res.status(200).json({
        success: true,
        message: 'Theme approved successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme approval failed',
        error: error.message
      });
    }
  }

  /**
     * Reject theme (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async rejectTheme(req, res) {
    try {
      const { themeId } = req.params;
      const { reason } = req.body;
      const adminId = req.user.userId;

      if (!reason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const theme = await themeService.rejectTheme(themeId, adminId, reason);

      res.status(200).json({
        success: true,
        message: 'Theme rejected successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme rejection failed',
        error: error.message
      });
    }
  }

  /**
     * Like theme
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async likeTheme(req, res) {
    try {
      const { themeId } = req.params;
      const userId = req.user.userId;

      const theme = await themeService.likeTheme(themeId, userId);

      res.status(200).json({
        success: true,
        message: 'Theme liked successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme like failed',
        error: error.message
      });
    }
  }

  /**
     * Unlike theme
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async unlikeTheme(req, res) {
    try {
      const { themeId } = req.params;
      const userId = req.user.userId;

      const theme = await themeService.unlikeTheme(themeId, userId);

      res.status(200).json({
        success: true,
        message: 'Theme unliked successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme unlike failed',
        error: error.message
      });
    }
  }

  /**
     * Rate theme
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async rateTheme(req, res) {
    try {
      const { themeId } = req.params;
      const { rating } = req.body;
      const userId = req.user.userId;

      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating must be between 1 and 5'
        });
      }

      const theme = await themeService.rateTheme(themeId, userId, rating);

      res.status(200).json({
        success: true,
        message: 'Theme rated successfully',
        data: theme
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme rating failed',
        error: error.message
      });
    }
  }

  /**
     * Get popular themes
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getPopularThemes(req, res) {
    try {
      const { limit } = req.query;
      const themes = await themeService.getPopularThemes(parseInt(limit) || 10);

      res.status(200).json({
        success: true,
        message: 'Popular themes retrieved successfully',
        data: themes
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve popular themes',
        error: error.message
      });
    }
  }

  /**
     * Get trending themes
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getTrendingThemes(req, res) {
    try {
      const { limit } = req.query;
      const themes = await themeService.getTrendingThemes(parseInt(limit) || 10);

      res.status(200).json({
        success: true,
        message: 'Trending themes retrieved successfully',
        data: themes
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve trending themes',
        error: error.message
      });
    }
  }

  /**
     * Search themes
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async searchThemes(req, res) {
    try {
      const { q: query, category, difficulty, maxTime, limit } = req.query;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const options = {
        category,
        difficulty,
        maxTime: maxTime ? parseInt(maxTime) : undefined,
        limit: limit ? parseInt(limit) : 20
      };

      const themes = await themeService.searchThemes(query, options);

      res.status(200).json({
        success: true,
        message: 'Theme search completed successfully',
        data: themes,
        query,
        options
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Theme search failed',
        error: error.message
      });
    }
  }

  /**
     * Get theme statistics
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getThemeStats(req, res) {
    try {
      const stats = await themeService.getThemeStats();

      res.status(200).json({
        success: true,
        message: 'Theme statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve theme statistics',
        error: error.message
      });
    }
  }

  /**
     * Get themes by author
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getThemesByAuthor(req, res) {
    try {
      const { authorId } = req.params;
      const { page, limit, status } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status
      };

      const result = await themeService.getThemesByAuthor(authorId, options);

      res.status(200).json({
        success: true,
        message: 'Author themes retrieved successfully',
        data: result.themes,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve author themes',
        error: error.message
      });
    }
  }

  /**
     * Get user's own themes
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getMyThemes(req, res) {
    try {
      const userId = req.user.userId;
      const { page, limit, status } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status: status || 'all'
      };

      const result = await themeService.getThemesByAuthor(userId, options);

      res.status(200).json({
        success: true,
        message: 'Your themes retrieved successfully',
        data: result.themes,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve your themes',
        error: error.message
      });
    }
  }

  /**
     * Get pending themes for approval (admin only)
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async getPendingThemes(req, res) {
    try {
      const { page, limit } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        status: 'pending'
      };

      const result = await themeService.getThemes(options);

      res.status(200).json({
        success: true,
        message: 'Pending themes retrieved successfully',
        data: result.themes,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to retrieve pending themes',
        error: error.message
      });
    }
  }

  /**
     * Health check endpoint
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
  async healthCheck(req, res) {
    try {
      const stats = await themeService.getThemeStats();

      res.status(200).json({
        success: true,
        message: 'Theme service is healthy',
        timestamp: new Date().toISOString(),
        stats: {
          totalThemes: stats.totalThemes || 0,
          totalViews: stats.totalViews || 0,
          totalLikes: stats.totalLikes || 0,
          avgRating: stats.avgRating || 0
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Theme service health check failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
}

// Create and export singleton instance
const themeController = new ThemeController();

module.exports = themeController;
