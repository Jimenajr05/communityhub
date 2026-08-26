const mongoose = require('mongoose');

/**
 * Esquema de Evento.
 * Representa un evento comunitario creado por un organizador, con su información,
 * capacidad, categoría y estado (activo, cancelado o finalizado).
 */
const eventSchema = new mongoose.Schema(
  {
    /** Título del evento. */
    title: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      validate: {
        validator: (value) => Boolean(value && value.trim().length > 0),
        message: 'El título no puede estar vacío',
      },
    },
    /** Descripción detallada del evento. */
    description: {
      type: String,
      required: [true, 'La descripción es obligatoria'],
      trim: true,
      validate: {
        validator: (value) => Boolean(value && value.trim().length > 0),
        message: 'La descripción no puede estar vacía',
      },
    },
    /** Referencia a la categoría (Category) a la que pertenece el evento. */
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'La categoría es obligatoria'],
    },
    /** Fecha del evento; se valida que no sea anterior al día de hoy (se permite hoy mismo). */
    date: {
      type: Date,
      required: [true, 'La fecha es obligatoria'],
      validate: {
        validator: function (value) {
          // El input de fecha (YYYY-MM-DD) se parsea como medianoche UTC.
          // Se usa setUTCHours para que el umbral "inicio de hoy" también sea
          // medianoche UTC y la comparación sea consistente sin importar la zona horaria del servidor.
          const today = new Date();
          today.setUTCHours(0, 0, 0, 0);
          return value >= today;
        },
        message: 'La fecha del evento no puede ser anterior al día de hoy',
      },
    },
    /** Hora del evento (texto libre, ej. "14:00"). */
    time: {
      type: String,
      required: [true, 'La hora es obligatoria'],
    },
    /** Lugar donde se realizará el evento. */
    location: {
      type: String,
      required: [true, 'La ubicación es obligatoria'],
      trim: true,
      validate: {
        validator: (value) => Boolean(value && value.trim().length > 0),
        message: 'La ubicación no puede estar vacía',
      },
    },
    /** Cupo máximo de asistentes permitidos en el evento. */
    capacity: {
      type: Number,
      required: [true, 'La capacidad máxima es obligatoria'],
      min: [1, 'La capacidad debe ser mayor a 0'],
    },
    /** URL o ruta de la imagen representativa del evento (opcional). */
    image: {
      type: String,
      default: null,
    },
    /** Referencia al usuario (User) que organiza/crea el evento. */
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    /** Estado actual del evento: activo, cancelado o finalizado. */
    status: {
      type: String,
      enum: ['active', 'cancelled', 'finished'],
      default: 'active',
    },
  },
  { timestamps: true } // Agrega automáticamente createdAt y updatedAt
);

// Exporta el modelo 'Event' basado en el esquema definido arriba
module.exports = mongoose.model('Event', eventSchema);