const dashboardService = require('../services/dashboardService');

function summary(req, res) {
  return res.json(dashboardService.getDashboardSummary());
}

module.exports = {
  summary,
};

