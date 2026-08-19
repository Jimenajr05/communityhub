const dashboardService = require('../services/dashboard.service');

async function getDashboardData(req, res, next) {
  try {
    const role = req.user.role;
    let data = {};

    if (role === 'administrador') {
      data = await dashboardService.getAdminDashboard();
    } else if (role === 'organizador') {
      data = await dashboardService.getOrganizerDashboard(req.user.id);
    } else {
      data = await dashboardService.getUserDashboard(req.user.id);
    }

    res.json({
      success: true,
      data: {
        role,
        metrics: data,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardData,
};