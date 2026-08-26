// Punto de entrada del servidor: carga variables de entorno, conecta la base de datos
// y arranca el servidor HTTP de Express.

require('dotenv').config(); // Carga las variables de entorno desde el archivo .env

const app = require('./app');
const connectDB = require('./config/db');

// Puerto en el que escuchará el servidor (por defecto 3000 si no está definido en el entorno)
const PORT = process.env.PORT || 3000;

/**
 * Inicializa la aplicación: conecta a la base de datos y luego pone el servidor a escuchar.
 */
async function start() {
  await connectDB();

  // Reparación automática de datos: si eventos de hoy o futuros quedaron marcados como 'finished' en DB
  // debido al bug de zona horaria anterior, restaura su estado a 'active'.
  try {
    const Event = require('./models/Event');
    const now = new Date();
    const finishedEvents = await Event.find({ status: 'finished' });
    for (const ev of finishedEvents) {
      const eventEndOfDay = new Date(ev.date);
      eventEndOfDay.setUTCHours(23, 59, 59, 999);
      if (eventEndOfDay >= now) {
        ev.status = 'active';
        await ev.save();
      }
    }
  } catch (err) {
    console.error('[db] Error reparando estados de eventos:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`[server] CommunityHub API escuchando en el puerto ${PORT}`);
  });
}

start();