const fs = require('fs');
const path = require('path');
const {
  IAMClient,
  GetRoleCommand,
} = require('@aws-sdk/client-iam');
const {
  LambdaClient,
  CreateFunctionCommand,
  UpdateFunctionCodeCommand,
  UpdateFunctionConfigurationCommand,
  GetFunctionCommand,
  InvokeCommand,
  AddPermissionCommand,
} = require('@aws-sdk/client-lambda');
const {
  EventBridgeClient,
  PutRuleCommand,
  PutTargetsCommand,
} = require('@aws-sdk/client-eventbridge');

// Despliega la segunda función Lambda (reporte periódico de estadísticas),
// reutilizando el mismo paquete de código (index.js) que la de recordatorios,
// pero apuntando al handler `reportHandler` y con su propia regla de EventBridge.
// Requiere que el rol IAM `communityhub-lambda-role` ya exista (lo crea deploy.js).

const envPath = path.resolve(__dirname, '../backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');

function getEnvVal(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
}

const region = getEnvVal('AWS_REGION') || 'us-east-2';
const accessKeyId = getEnvVal('AWS_ACCESS_KEY_ID');
const secretAccessKey = getEnvVal('AWS_SECRET_ACCESS_KEY');
const mongoUri = getEnvVal('MONGODB_URI');

if (!accessKeyId || !secretAccessKey) {
  console.error('ERROR: Credenciales de AWS no encontradas en backend/.env');
  process.exit(1);
}

const credentials = { accessKeyId, secretAccessKey };

const iam = new IAMClient({ region, credentials });
const lambda = new LambdaClient({ region, credentials });
const eventbridge = new EventBridgeClient({ region, credentials });

const FUNCTION_NAME = 'communityhub-report';
const ROLE_NAME = 'communityhub-lambda-role';
const RULE_NAME = 'communityhub-report-cron';

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getRoleArn() {
  const res = await iam.send(new GetRoleCommand({ RoleName: ROLE_NAME }));
  return res.Role.Arn;
}

async function deployLambda(roleArn) {
  const zipPath = path.resolve(__dirname, 'communityhub-lambda.zip');
  if (!fs.existsSync(zipPath)) {
    throw new Error(`Archivo zip no encontrado en ${zipPath}. Ejecuta primero pack_and_upload.js o zipea manualmente.`);
  }
  const zipBuffer = fs.readFileSync(zipPath);

  let functionExists = false;
  let lambdaArn = '';

  try {
    const res = await lambda.send(new GetFunctionCommand({ FunctionName: FUNCTION_NAME }));
    functionExists = true;
    lambdaArn = res.Configuration.FunctionArn;
    console.log(`[Lambda] Función ya existe (${lambdaArn}). Actualizando código y configuración...`);
  } catch (err) {
    if (err.name !== 'ResourceNotFoundException') {
      throw err;
    }
  }

  const config = {
    FunctionName: FUNCTION_NAME,
    Runtime: 'nodejs20.x',
    Handler: 'index.reportHandler',
    Timeout: 60,
    MemorySize: 256,
    Environment: { Variables: { MONGODB_URI: mongoUri } },
  };

  if (functionExists) {
    await lambda.send(new UpdateFunctionCodeCommand({ FunctionName: FUNCTION_NAME, ZipFile: zipBuffer }));
    console.log('[Lambda] Esperando actualización de código...');
    await sleep(5000);
    const updateConf = await lambda.send(new UpdateFunctionConfigurationCommand(config));
    lambdaArn = updateConf.FunctionArn;
    console.log('[Lambda] Configuración actualizada.');
  } else {
    console.log(`[Lambda] Creando función ${FUNCTION_NAME}...`);
    const createRes = await lambda.send(
      new CreateFunctionCommand({
        ...config,
        Role: roleArn,
        Code: { ZipFile: zipBuffer },
        Description: 'CommunityHub Serverless Periodic Statistics Report',
      })
    );
    lambdaArn = createRes.FunctionArn;
    console.log(`[Lambda] Función creada con éxito: ${lambdaArn}`);
  }

  return lambdaArn;
}

async function setupEventBridge(lambdaArn) {
  console.log(`[EventBridge] Configurando regla ${RULE_NAME}...`);
  const putRuleRes = await eventbridge.send(
    new PutRuleCommand({
      Name: RULE_NAME,
      ScheduleExpression: 'rate(1 day)',
      State: 'ENABLED',
      Description: 'Disparador diario para el reporte de estadísticas de CommunityHub',
    })
  );

  await eventbridge.send(
    new PutTargetsCommand({
      Rule: RULE_NAME,
      Targets: [{ Id: 'CommunityHubReportTarget', Arn: lambdaArn }],
    })
  );
  console.log('[EventBridge] Target asociado a la regla.');

  try {
    await lambda.send(
      new AddPermissionCommand({
        FunctionName: FUNCTION_NAME,
        StatementId: 'EventBridgeInvokePermission',
        Action: 'lambda:InvokeFunction',
        Principal: 'events.amazonaws.com',
        SourceArn: putRuleRes.RuleArn,
      })
    );
    console.log('[Lambda] Permiso para EventBridge concedido.');
  } catch (err) {
    if (err.name === 'ResourceConflictException') {
      console.log('[Lambda] El permiso para EventBridge ya existía.');
    } else {
      console.warn('[Lambda] Nota sobre permisos:', err.message);
    }
  }
}

async function testInvocation() {
  console.log('\n[Test] Invocando la función de reporte para probar ejecución real...');
  const invokeRes = await lambda.send(
    new InvokeCommand({
      FunctionName: FUNCTION_NAME,
      InvocationType: 'RequestResponse',
      Payload: Buffer.from(JSON.stringify({})),
    })
  );
  const payloadString = Buffer.from(invokeRes.Payload).toString('utf8');
  console.log(`[Test] Status Code HTTP: ${invokeRes.StatusCode}`);
  console.log(`[Test] Respuesta de la Lambda:\n${payloadString}`);
}

async function main() {
  try {
    console.log('=== Despliegue de AWS Lambda: reporte periódico de estadísticas ===');
    console.log(`Región: ${region}`);
    const roleArn = await getRoleArn();
    const lambdaArn = await deployLambda(roleArn);
    await setupEventBridge(lambdaArn);
    await testInvocation();
    console.log('\n[OK] Despliegue del reporte completado con éxito en AWS!');
  } catch (error) {
    console.error('\n[ERROR] Error durante el despliegue:', error);
    process.exit(1);
  }
}

main();
