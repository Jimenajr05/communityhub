const fs = require('fs');
const path = require('path');
const { LambdaClient, AddPermissionCommand } = require('@aws-sdk/client-lambda');
const { EventBridgeClient, PutRuleCommand, PutTargetsCommand } = require('@aws-sdk/client-eventbridge');

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
const eventbridge = new EventBridgeClient({ region, credentials });

const FUNCTION_NAME = 'communityhub-notifications';
const RULE_NAME = 'communityhub-reminders-cron';

async function main() {
  console.log('[1/3] Creando regla de programacion en AWS EventBridge...');
  const ruleRes = await eventbridge.send(
    new PutRuleCommand({
      Name: RULE_NAME,
      ScheduleExpression: 'rate(6 hours)',
      State: 'ENABLED',
      Description: 'Cron periodico cada 6 horas para recordatorios de actividades',
    })
  );
  console.log(`Regla creada/actualizada: ${ruleRes.RuleArn}`);

  console.log('[2/3] Asociando la regla como trigger de la funcion Lambda...');
  const lambdaArn = `arn:aws:lambda:${region}:475487646360:function:${FUNCTION_NAME}`;

  await eventbridge.send(
    new PutTargetsCommand({
      Rule: RULE_NAME,
      Targets: [
        {
          Id: 'CommunityHubLambdaTarget',
          Arn: lambdaArn,
        },
      ],
    })
  );
  console.log('Target de EventBridge vinculado correctamente.');

  console.log('[3/3] Asignando permisos de invocacion a EventBridge...');
  try {
    await lambda.send(
      new AddPermissionCommand({
        FunctionName: FUNCTION_NAME,
        StatementId: 'EventBridgeInvokePermission',
        Action: 'lambda:InvokeFunction',
        Principal: 'events.amazonaws.com',
        SourceArn: ruleRes.RuleArn,
      })
    );
    console.log('Permiso concedido.');
  } catch (e) {
    if (e.name === 'ResourceConflictException') {
      console.log('El permiso ya estaba asignado.');
    } else {
      console.log('Nota de permiso:', e.message);
    }
  }

  console.log('\n? ¡EventBridge configurado correctamente como desencadenador cada 6 horas!');
}

main().catch(console.error);
