/**
 * Script para probar localmente las funciones Lambda de CommunityHub
 * sin necesidad de desplegar en AWS.
 *
 * Ejecutar con: npm test (dentro de la carpeta lambda)
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Leer MONGODB_URI desde backend/.env si existe
const envPath = path.resolve(__dirname, '../backend/.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^MONGODB_URI=(.*)$/m);
  if (match && match[1]) {
    process.env.MONGODB_URI = match[1].trim();
  }
}

const { handler, reportHandler } = require('./index');

async function testLocal() {
  console.log('====================================================');
  console.log('🧪 PROBANDO FUNCIONES LAMBDA LOCALMENTE');
  console.log('====================================================\n');

  if (!process.env.MONGODB_URI) {
    console.error('❌ Error: No se encontró MONGODB_URI en backend/.env');
    process.exit(1);
  }

  const fakeContext = { callbackWaitsForEmptyEventLoop: false };

  try {
    console.log('1️⃣  Ejecutando Handler 1: Recordatorios de Actividades (handler)...');
    const resReminders = await handler({}, fakeContext);
    console.log('   Resultado:', JSON.parse(resReminders.body));
    console.log('   Código de Estado HTTP:', resReminders.statusCode);
    console.log('   ✅ Handler de recordatorios ejecutado con éxito.\n');

    console.log('2️⃣  Ejecutando Handler 2: Reporte Periódico a Admins (reportHandler)...');
    const resReport = await reportHandler({}, fakeContext);
    console.log('   Resultado:', JSON.parse(resReport.body));
    console.log('   Código de Estado HTTP:', resReport.statusCode);
    console.log('   ✅ Handler de reporte ejecutado con éxito.\n');

    console.log('====================================================');
    console.log('🎉 Todas las funciones Lambda respondieron correctamente.');
    console.log('====================================================');
  } catch (error) {
    console.error('❌ Error durante la ejecución local de Lambda:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testLocal();
