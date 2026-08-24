const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { LambdaClient, UpdateFunctionCodeCommand, InvokeCommand } = require('@aws-sdk/client-lambda');

console.log('[1/3] Empaquetando la Lambda con adm-zip...');
const zip = new AdmZip();

zip.addLocalFile(path.join(__dirname, 'index.js'));
zip.addLocalFile(path.join(__dirname, 'package.json'));
zip.addLocalFolder(path.join(__dirname, 'node_modules'), 'node_modules');

const zipBuffer = zip.toBuffer();
console.log(`[2/3] Paquete ZIP generado en memoria: ${(zipBuffer.length / 1024 / 1024).toFixed(2)} MB`);

// Subir directamente a AWS Lambda
const envPath = path.resolve(__dirname, '../backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
function getEnvVal(key) {
  const match = envContent.match(new RegExp('^' + key + '=(.*)$', 'm'));
  return match ? match[1].trim() : '';
}

const region = getEnvVal('AWS_REGION') || 'us-east-2';
const credentials = {
  accessKeyId: getEnvVal('AWS_ACCESS_KEY_ID'),
  secretAccessKey: getEnvVal('AWS_SECRET_ACCESS_KEY'),
};

const lambda = new LambdaClient({ region, credentials });

async function run() {
  console.log('[3/3] Subiendo el paquete directamente a la funcion AWS Lambda...');
  await lambda.send(
    new UpdateFunctionCodeCommand({
      FunctionName: 'communityhub-notifications',
      ZipFile: zipBuffer,
    })
  );
  console.log('? ¡Codigo de Lambda cargado con exito en AWS!');

  console.log('Esperando 5 segundos para probar la ejecucion...');
  await new Promise((r) => setTimeout(r, 5000));

  console.log('?? Ejecutando prueba real de la Lambda en AWS...');
  const res = await lambda.send(
    new InvokeCommand({
      FunctionName: 'communityhub-notifications',
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify({})),
    })
  );

  const resultStr = Buffer.from(res.Payload).toString('utf8');
  console.log('HTTP Status Code:', res.StatusCode);
  console.log('Respuesta de la Lambda:\n', resultStr);
}

run().catch(console.error);
