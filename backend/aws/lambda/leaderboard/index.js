// index.js
// Env: TABLE_NAME=pipercode-users
// HTTP API with JWT authorizer (Cognito User Pool)
// Leaderboard strategy: scan users, compute rank by weekTime (fallbacks included)

const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async () => {
  try {
    const tableName = process.env.TABLE_NAME;
    if (!tableName) return response(500, { message: 'Missing TABLE_NAME' });

    const items = await scanAll(tableName);

    // Map users to leaderboard row
    const rows = items.map((u, idx) => {
      const stats = u.stats || {};
      const weekTime = num(stats.weekTime, 0);
      const monthTime = num(stats.monthTime, 0);
      const totalTime = num(stats.totalTime, 0);

      return {
        // rank set after sort
        user: {
          id: u.userId || String(idx + 1),
          name: u.name || 'User',
          username: u.username || (u.email ? u.email.split('@')[0] : 'user'),
          avatar: u.avatar || 'https://via.placeholder.com/64',
          status: u.status || 'online',
          isFriend: !!u.isFriend,
          currentActivity: u.currentActivity || null,
          stats: {
            ...sanitizeStats(stats),
            totalTime,
          },
        },
        timeThisWeek: weekTime,
        timeThisMonth: monthTime,
        change: 0, // Optional: compute vs last week if you store history
      };
    });

    // Rank by weekTime desc
    rows.sort((a, b) => b.timeThisWeek - a.timeThisWeek);
    const leaderboard = rows.map((r, i) => ({ ...r, rank: i + 1 }));

    return response(200, leaderboard);
  } catch (err) {
    console.error('leaderboard error', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

function sanitizeStats(stats) {
  return {
    weekTime: num(stats.weekTime, 0),
    monthTime: num(stats.monthTime, 0),
    streak: num(stats.streak, 0),
    longestStreak: num(stats.longestStreak, 0),
    languages: stats.languages || {},
    projects: stats.projects || {},
  };
}

function num(v, fallback) {
  return typeof v === 'number' && isFinite(v) ? v : fallback;
}

async function scanAll(TableName) {
  let items = [];
  let ExclusiveStartKey = undefined;
  do {
    const res = await ddb.scan({ TableName, ExclusiveStartKey, ConsistentRead: false }).promise();
    items = items.concat(res.Items || []);
    ExclusiveStartKey = res.LastEvaluatedKey;
  } while (ExclusiveStartKey);
  return items;
}

function response(statusCode, body) {
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