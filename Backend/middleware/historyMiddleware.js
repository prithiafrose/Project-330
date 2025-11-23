const UserHistory = require('../models/UserHistory');

const trackUserAction = (actionType, getItemInfo = null) => {
  return async (req, res, next) => {
    try {
      if (req.user && req.user.id) {
        const historyData = {
          user_id: req.user.id,
          action_type: actionType,
          page_url: req.originalUrl,
        };

        if (getItemInfo && typeof getItemInfo === 'function') {
          const itemInfo = getItemInfo(req);
          if (itemInfo) {
            Object.assign(historyData, itemInfo);
          }
        } else {
          const itemId = req.params.id || req.body.id || req.query.id;
          if (itemId) {
            historyData.item_id = itemId;
          }
        }

        await UserHistory.create(historyData);
      }
    } catch (error) {
      console.error('Error tracking user action:', error);
    }

    next();
  };
};

const trackLogin = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await UserHistory.create({
        user_id: req.user.id,
        action_type: 'LOGIN',
        details: `User logged in from ${req.ip || 'unknown IP'}`,
        page_url: '/login',
      });
    }
  } catch (error) {
    console.error('Error tracking login:', error);
  }
  next();
};

const trackLogout = async (req, res, next) => {
  try {
    if (req.user && req.user.id) {
      await UserHistory.create({
        user_id: req.user.id,
        action_type: 'LOGOUT',
        details: `User logged out from ${req.ip || 'unknown IP'}`,
        page_url: '/logout',
      });
    }
  } catch (error) {
    console.error('Error tracking logout:', error);
  }
  next();
};

const trackJobView = trackUserAction('VIEW', (req) => ({
  item_id: req.params.id,
  item_type: 'job',
  item_name: req.body.title || 'Job Listing',
  details: `Viewed job listing with ID: ${req.params.id}`,
}));

const trackJobApplication = trackUserAction('SUBMIT', (req) => ({
  item_id: req.params.jobId || req.body.job_id,
  item_type: 'application',
  item_name: `Application for job ${req.params.jobId || req.body.job_id}`,
  details: `Submitted job application with cover letter`,
}));

const trackFileUpload = trackUserAction('UPLOAD', (req) => ({
  item_type: 'file',
  item_name: req.file ? req.file.originalname : 'Uploaded file',
  details: `Uploaded file: ${req.file ? req.file.originalname : 'Unknown file'}`,
}));

const trackFileDownload = trackUserAction('DOWNLOAD', (req) => ({
  item_type: 'file',
  item_name: req.params.filename || 'Downloaded file',
  details: `Downloaded file: ${req.params.filename || 'Unknown file'}`,
}));

const trackProfileUpdate = trackUserAction('UPDATE', (req) => ({
  item_type: 'profile',
  item_name: 'User Profile',
  details: 'Updated user profile information',
}));

module.exports = {
  trackUserAction,
  trackLogin,
  trackLogout,
  trackJobView,
  trackJobApplication,
  trackFileUpload,
  trackFileDownload,
  trackProfileUpdate,
};