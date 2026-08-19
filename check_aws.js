const { LambdaClient, ListFunctionsCommand } = require('@aws-sdk/client-lambda');
const { IAMClient, ListRolesCommand } = require('@aws-sdk/client-iam');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../backend/.env');
const envContent = fs.readFileSync(envPath, 'utf8');
function getEnvVal(key) {
  const match = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : '';
}

const region = getEnvVal('AWS_REGION') || 'us-east-2';
const credentials = {
  accessKeyId: getEnvVal('AWS_ACCESS_KEY_ID'),
  secretAccessKey: getEnvVal('AWS_SECRET_ACCESS_KEY'),
};

const lambda = new LambdaClient({ region, credentials });
const iam = new IAMClient({ region, credentials });

async function check() {
  console.log('--- Probando Lambda: ListFunctions ---');
  try {
    const funcs = await lambda.send(new ListFunctionsCommand({}));
    console.log('Funciones existentes:', funcs.Functions.map(f => ({ name: f.FunctionName, role: f.Role })));
  } catch (e) {
    console.log('Error en ListFunctions:', e.message);
  }

  console.log('--- Probando IAM: ListRoles ---');
  try {
    const roles = await iam.send(new ListRolesCommand({}));
    console.log('Roles existentes:', roles.Roles.map(r => r.Arn));
  } catch (e) {
    console.log('Error en ListRoles:', e.message);
  }
}

check();
