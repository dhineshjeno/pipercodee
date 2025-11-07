const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

exports.handler = async (event) => {
  const tableName = process.env.TABLE_NAME;
  if (!tableName) return resp(500, { message: 'Missing TABLE_NAME env var' });

  const claims =
    event?.requestContext?.authorizer?.jwt?.claims ||
    event?.requestContext?.authorizer?.claims ||
    {};

  const userId = claims.sub;
  if (!userId) {
    console.error('Missing sub in claims', { requestContext: event?.requestContext });
    return resp(401, { message: 'Unauthorized: missing sub' });
  }

  try {
    const result = await ddb.send(new GetCommand({
      TableName: tableName,
      Key: { userId },
      ConsistentRead: true,
    }));

    if (!result.Item) return resp(404, { message: 'User not found' });
    return resp(200, result.Item);
  } catch (err) {
    console.error('DynamoDB get error', { tableName, userId, err });
    return resp(500, { message: 'Internal Server Error' });
  }
};

function resp(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:5173',
      'Access-Control-Allow-Headers': 'Authorization,Content-Type',
      'Access-Control-Allow-Methods': 'GET,OPTIONS',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}