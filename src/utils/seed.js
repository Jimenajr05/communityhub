require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Category = require('../models/Category');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Favorite = require('../models/Favorite');
const Notification = require('../models/Notification');

async function seed() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/communityhub';
  console.log(`Conectando a MongoDB en: ${mongoUri}...`);

  try {
    await mongoose.connect(mongoUri);
    console.log('Conexión exitosa a la base de datos.');

    // Limpiar colecciones
    console.log('Limpiando colecciones existentes...');
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Favorite.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    // Crear usuarios de prueba
    console.log('Creando usuarios iniciales...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'Sistema',
      email: 'admin@communityhub.com',
      password: hashedPassword,
      role: 'administrador',
    });

    const organizer = await User.create({
      firstName: 'Carlos',
      lastName: 'Mendoza',
      email: 'organizer@communityhub.com',
      password: hashedPassword,
      role: 'organizador',
    });

    const user = await User.create({
      firstName: 'Lucía',
      lastName: 'Gómez',
      email: 'user@communityhub.com',
      password: hashedPassword,
      role: 'usuario',
    });

    console.log('Usuarios creados:');
    console.log(` - Admin: admin@communityhub.com / password123`);
    console.log(` - Organizador: organizer@communityhub.com / password123`);
    console.log(` - Usuario: user@communityhub.com / password123`);

    // Crear categorías
    console.log('Creando categorías...');
    const categoriesData = [
      { name: 'Tecnología', description: 'Talleres, charlas y hackathons de software y tecnología.' },
      { name: 'Deportes', description: 'Actividades físicas, partidos comunitarios y torneos.' },
      { name: 'Cultura & Arte', description: 'Exposiciones, música en vivo, teatro y festivales.' },
      { name: 'Educación', description: 'Cursos, conferencias y grupos de estudio.' },
      { name: 'Social & Comunidad', description: 'Encuentros vecinales, voluntariado y networking.' },
    ];

    const categories = await Category.insertMany(categoriesData);
    console.log(`Se crearon ${categories.length} categorías.`);

    const techCat = categories.find((c) => c.name === 'Tecnología');
    const sportsCat = categories.find((c) => c.name === 'Deportes');
    const cultureCat = categories.find((c) => c.name === 'Cultura & Arte');

    // Fechas para eventos futuros
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(inTwoWeeks.getDate() + 14);

    // Crear eventos de prueba
    console.log('Creando actividades iniciales...');
    const events = await Event.insertMany([
      {
        title: 'Workshop de Node.js y Express Avanzado',
        description: 'Aprende a construir APIs REST robustas, escalables y seguras con Node.js, Express y MongoDB.',
        category: techCat._id,
        date: tomorrow,
        time: '18:00',
        location: 'Auditorio Central, San José',
        capacity: 30,
        image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id,
        status: 'active',
      },
      {
        title: 'Torneo Comunitario de Fútbol 5',
        description: 'Ven a participar del gran torneo de verano vecinal. Habrá premios para los tres primeros lugares.',
        category: sportsCat._id,
        date: nextWeek,
        time: '09:00',
        location: 'Polideportivo Municipal, Heredia',
        capacity: 50,
        image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        organizer: organizer._id,
        status: 'active',
      },
      {
        title: 'Noche de Cine y Arte Urbano',
        description: 'Proyección al aire libre de cortometrajes independientes y muestra fotográfica local.',
        category: cultureCat._id,
        date: inTwoWeeks,
        time: '19:30',
        location: 'Plaza de la Cultura, San José',
        capacity: 100,
        image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
        organizer: admin._id,
        status: 'active',
      },
    ]);

    console.log(`Se crearon ${events.length} actividades.`);

    // Crear una inscripción y un favorito de prueba
    await Registration.create({
      user: user._id,
      event: events[0]._id,
      status: 'confirmed',
    });

    await Favorite.create({
      user: user._id,
      event: events[0]._id,
    });

    console.log('Inscripción y favorito de prueba creados exitosamente.');
    console.log('✅ Poblamiento de base de datos completado.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
    process.exit(1);
  }
}

seed();
