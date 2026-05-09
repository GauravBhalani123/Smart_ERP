const notificationService = require('../services/notificationService');

function listNotifications(req, res) {
  return res.json(notificationService.getAllAlerts());
}

module.exports = {
  listNotifications,
};

