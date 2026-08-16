const ApiError = require('../utils/ApiError');
const eventService = require('../services/event.service');

const REQUIRED_FIELDS = ['title', 'description', 'category', 'date', 'time', 'location', 'capacity'];
const UPDATABLE_FIELDS = [
    'title',
    'description',
    'category',
    'date',
    'time',
    'location',
    'capacity',
    'image',
    'status',
];

async function list(req, res, next) {
    try {
        const { events, pagination } = await eventService.listEvents(req.query);
        res.status(200).json({ success: true, data: events, pagination });
    } catch (error) {
        next(error);
    }
}

async function getById(req, res, next) {
    try {
        const event = await eventService.getEventById(req.params.id);
        res.status(200).json({ success: true, data: { event } });
    } catch (error) {
        next(error);
    }
}

async function create(req, res, next) {
    try {
        const missing = REQUIRED_FIELDS.filter((field) => !req.body[field]);
        if (missing.length > 0) {
            throw ApiError.badRequest(`Faltan campos obligatorios: ${missing.join(', ')}`);
        }

        const payload = {};
        for (const field of REQUIRED_FIELDS) {
            payload[field] = req.body[field];
        }
        if (req.body.image !== undefined) {
            payload.image = req.body.image;
        }

        const event = await eventService.createEvent(req.user.id, payload);

        res.status(201).json({
            success: true,
            message: 'Actividad creada correctamente',
            data: { event },
        });
    } catch (error) {
        next(error);
    }
}

async function update(req, res, next) {
    try {
        const payload = {};
        for (const field of UPDATABLE_FIELDS) {
            if (req.body[field] !== undefined) {
                payload[field] = req.body[field];
            }
        }

        const event = await eventService.updateEvent(req.params.id, req.user, payload);

        res.status(200).json({
            success: true,
            message: 'Actividad actualizada correctamente',
            data: { event },
        });
    } catch (error) {
        next(error);
    }
}

async function remove(req, res, next) {
    try {
        await eventService.deleteEvent(req.params.id, req.user);
        res.status(200).json({ success: true, message: 'Actividad eliminada correctamente' });
    } catch (error) {
        next(error);
    }
}

module.exports = { list, getById, create, update, remove };