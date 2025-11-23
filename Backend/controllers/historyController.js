const UserHistory = require('../models/UserHistory');

const getHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, action_type, start_date, end_date } = req.query;

    const whereClause = { user_id: userId };

    if (action_type) {
      whereClause.action_type = action_type;
    }

    if (start_date || end_date) {
      whereClause.timestamp = {};
      if (start_date) {
        whereClause.timestamp[UserHistory.sequelize.Sequelize.Op.gte] = new Date(start_date);
      }
      if (end_date) {
        whereClause.timestamp[UserHistory.sequelize.Sequelize.Op.lte] = new Date(end_date);
      }
    }

    const offset = (page - 1) * limit;

    const { count, rows: history } = await UserHistory.findAndCountAll({
      where: whereClause,
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: history,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Error fetching user history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user history',
      error: error.message,
    });
  }
};

const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action_type, before_date } = req.body;

    const whereClause = { user_id: userId };

    if (action_type) {
      whereClause.action_type = action_type;
    }

    if (before_date) {
      whereClause.timestamp = {
        [UserHistory.sequelize.Sequelize.Op.lt]: new Date(before_date),
      };
    }

    const deletedCount = await UserHistory.destroy({
      where: whereClause,
    });

    res.json({
      success: true,
      message: `Successfully deleted ${deletedCount} history entries`,
      deletedCount,
    });
  } catch (error) {
    console.error('Error clearing user history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear user history',
      error: error.message,
    });
  }
};

const getHistoryStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await UserHistory.findAll({
      where: { user_id: userId },
      attributes: [
        'action_type',
        [UserHistory.sequelize.Sequelize.fn('COUNT', UserHistory.sequelize.Sequelize.col('id')), 'count'],
      ],
      group: ['action_type'],
      raw: true,
    });

    const totalActions = await UserHistory.count({
      where: { user_id: userId },
    });

    const recentActions = await UserHistory.findAll({
      where: { user_id: userId },
      order: [['timestamp', 'DESC']],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        stats,
        totalActions,
        recentActions,
      },
    });
  } catch (error) {
    console.error('Error fetching history stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history statistics',
      error: error.message,
    });
  }
};

module.exports = {
  getHistory,
  clearHistory,
  getHistoryStats,
};