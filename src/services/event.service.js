const mongoose = require('mongoose');
const Event = require('../models/Event');
const Category = require('../models/Category');
const Registration = require('../models/Registration');
const Favorite = require('../models/Favorite');
const ApiError = require('../utils/ApiError');

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;

/**
 * Agrega `registeredCount` y `spotsAvailable` a cada evento consultando
 * las inscripciones confirmadas. A esta escala (proyecto de curso, listados
 * paginados de máx. 50) una consulta por evento es aceptable; si el volumen
 * creciera, esto se movería a un $lookup con agregación.
 */
async function attachAvailability(events) {
    return Promise.all(
        events.map(async (event) => {
            const registeredCount = await Registration.countDocuments({
                event: event._id,
                status: 'confirmed',
            });
            const plain = event.toObject ? event.toObject() : event;
            return {
                ...plain,
                registeredCount,
                spotsAvailable: Math.max(plain.capacity - registeredCount, 0),
            };
        })
    );
}

function ensureOwnership(event, requester) {
    const isOwner = event.organizer.toString() === requester.id.toString();
    const isAdmin = requester.role === 'admin';
    if (!isOwner && !isAdmin) {
        throw ApiError.forbidden('No puedes modificar una actividad que no organizas');
    }
}

async function assertCategoryExists(categoryId) {
    const category = await Category.findById(categoryId).catch(() => null);
    if (!category) {
        throw ApiError.badRequest('La categoría seleccionada no existe');
    }
}

async function listEvents(query) {
    const {
        search,
        category,
        date,
        location,
        organizer,
        available,
        status,
        page = 1,
        limit = DEFAULT_LIMIT,
    } = query;

    const filter = {};

    if (search) {
        filter.title = { $regex: search, $options: 'i' };
    }

    if (category) {
        filter.category = category;
    }

    if (location) {
        filter.location = { $regex: location, $options: 'i' };
    }

    if (organizer) {
        filter.organizer = organizer;
    }

    if (date) {
        const start = new Date(date);
        if (Number.isNaN(start.getTime())) {
            throw ApiError.badRequest('La fecha proporcionada no es válida');
        }
        const end = new Date(start);
        end.setDate(end.getDate() + 1);
        filter.date = { $gte: start, $lt: end };
    }

    if (status) {
        filter.status = status;
    } else if (!organizer) {
        // El listado público (sin filtrar por organizador) solo muestra
        // actividades activas por defecto.
        filter.status = 'active';
    }

    const events = await Event.find(filter)
        .sort({ date: 1 })
        .populate('category', 'name')
        .populate('organizer', 'firstName lastName');

    let withAvailability = await attachAvailability(events);

    if (available === 'true') {
        withAvailability = withAvailability.filter((event) => event.spotsAvailable > 0);
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || DEFAULT_LIMIT, 1), MAX_LIMIT);
    const total = withAvailability.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = withAvailability.slice(start, start + limitNum);

    return {
        events: paginated,
        pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
        },
    };
}

async function getEventById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw ApiError.notFound('Actividad no encontrada');
    }

    const event = await Event.findById(id)
        .populate('category', 'name')
        .populate('organizer', 'firstName lastName email');

    if (!event) {
        throw ApiError.notFound('Actividad no encontrada');
    }

    const [withAvailability] = await attachAvailability([event]);
    return withAvailability;
}

async function createEvent(organizerId, payload) {
    await assertCategoryExists(payload.category);

    const event = await Event.create({
        ...payload,
        organizer: organizerId,
    });

    return getEventById(event._id);
}

async function updateEvent(id, requester, payload) {
    const event = await Event.findById(id);
    if (!event) {
        throw ApiError.notFound('Actividad no encontrada');
    }

    ensureOwnership(event, requester);

    if (payload.category) {
        await assertCategoryExists(payload.category);
    }

    Object.assign(event, payload);
    await event.save(); // corre las validaciones del schema (fecha futura, capacidad > 0, etc.)

    return getEventById(event._id);
}

async function deleteEvent(id, requester) {
    const event = await Event.findById(id);
    if (!event) {
        throw ApiError.notFound('Actividad no encontrada');
    }

    ensureOwnership(event, requester);

    // Se eliminan también inscripciones y favoritos asociados para no dejar
    // referencias huérfanas apuntando a un evento que ya no existe.
    await Promise.all([
        Registration.deleteMany({ event: event._id }),
        Favorite.deleteMany({ event: event._id }),
        event.deleteOne(),
    ]);
}

module.exports = { listEvents, getEventById, createEvent, updateEvent, deleteEvent };