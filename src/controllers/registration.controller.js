const registrationService = require('../services/registration.service');

async function registerToEvent(req, res, next) {
  try {
    const registration = await registrationService.registerToEvent(
      req.user.id,
      req.params.id
    );
    res.status(201).json({
      success: true,
      message: 'Te has inscrito exitosamente a la actividad',
      data: { registration },
    });
  } catch (error) {
    next(error);
  }
}

async function cancelRegistration(req, res, next) {
  try {
    await registrationService.cancelRegistration(
      req.user.id,
      req.params.id
    );
    res.json({
      success: true,
      message: 'Tu inscripción ha sido cancelada exitosamente',
    });
  } catch (error) {
    next(error);
  }
}

async function getMyRegistrations(req, res, next) {
  try {
    const registrations = await registrationService.getUserRegistrations(req.user.id);
    res.json({
      success: true,
      data: { registrations },
    });
  } catch (error) {
    next(error);
  }
}

async function checkStatus(req, res, next) {
  try {
    const isRegistered = await registrationService.getRegistrationStatus(
      req.user.id,
      req.params.id
    );
    res.json({
      success: true,
      data: { isRegistered },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  registerToEvent,
  cancelRegistration,
  getMyRegistrations,
  checkStatus,
};