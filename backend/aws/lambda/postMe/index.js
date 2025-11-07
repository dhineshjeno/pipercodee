// index.js (POST /me) Env: TABLE_NAME=pipercode-users
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const claims = event?.requestContext?.authorizer?.jwt?.claims || {};
    const userId = claims.sub;
    if (!userId) return res(401, { message: 'Unauthorized' });

    const body = JSON.parse(event.body || '{}');
    const { 
      name, 
      username, 
      statusMessage,
      notifications,
      privacy
    } = body;

    const UpdateExpression = [];
    const ExpressionAttributeNames = {};
    const ExpressionAttributeValues = {};

    // Profile fields
    if (name !== undefined) { 
      UpdateExpression.push('#n = :n'); 
      ExpressionAttributeNames['#n'] = 'name'; 
      ExpressionAttributeValues[':n'] = name; 
    }
    if (username !== undefined) { 
      UpdateExpression.push('#u = :u'); 
      ExpressionAttributeNames['#u'] = 'username'; 
      ExpressionAttributeValues[':u'] = username; 
    }
    if (statusMessage !== undefined) { 
      UpdateExpression.push('#sm = :sm'); 
      ExpressionAttributeNames['#sm'] = 'statusMessage'; 
      ExpressionAttributeValues[':sm'] = statusMessage; 
    }

    // Notifications settings
    if (notifications !== undefined) {
      UpdateExpression.push('#notif = :notif');
      ExpressionAttributeNames['#notif'] = 'notifications';
      ExpressionAttributeValues[':notif'] = notifications;
    }

    // Privacy settings
    if (privacy !== undefined) {
      UpdateExpression.push('#priv = :priv');
      ExpressionAttributeNames['#priv'] = 'privacy';
      ExpressionAttributeValues[':priv'] = privacy;
    }

    if (UpdateExpression.length === 0) return res(400, { message: 'No fields to update' });

    const params = {
      TableName: process.env.TABLE_NAME?.trim(),
      Key: { userId },
      UpdateExpression: 'SET ' + UpdateExpression.join(', '),
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    };

    const out = await ddb.update(params).promise();
    return res(200, out.Attributes || {});
  } catch (e) {
    console.error('Update error:', e);
    return res(500, { message: 'Internal Server Error' });
  }
};

function res(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type',
      'Access-Control-Allow-Methods': 'POST,OPTIONS',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}