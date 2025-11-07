// create-user.js
const AWS = require('aws-sdk');
const ddb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  const tableName = process.env.TABLE_NAME;
  if (!tableName) {
    throw new Error('TABLE_NAME environment variable is required');
  }

  // User attributes from Cognito
  const userId = event.request.userAttributes.sub;
  const email = event.request.userAttributes.email;
  const name = event.request.userAttributes.name || '';
  const username = event.request.userAttributes['preferred_username'] || 
                   event.request.userAttributes.email?.split('@')[0] || 
                   'user';

  // Default user structure
  const userItem = {
    userId,
    email,
    name,
    username,
    status: 'online',
    statusMessage: '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || username)}&background=random`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    stats: {
      weekTime: 0,
      monthTime: 0,
      totalTime: 0,
      streak: 0,
      longestStreak: 0,
      languages: {},
      projects: {},
    },
    notifications: {
      friendActivity: true,
      achievements: true,
      weeklyReport: true,
      leaderboardUpdates: false,
    },
    privacy: {
      showProfile: true,
      showActivity: true,
      showStats: false,
    },
    // Add any other default fields you need
  };

  try {
    await ddb.put({
      TableName: tableName,
      Item: userItem,
      ConditionExpression: 'attribute_not_exists(userId)', // Prevent overwrites
    }).promise();

    console.log('Successfully created user record:', userId);
    return event; // Return event to continue Cognito flow
  } catch (error) {
    console.error('Error creating user record:', error);
    
    // If it's a conditional check failure, user already exists - that's fine
    if (error.code === 'ConditionalCheckFailedException') {
      console.log('User already exists in DynamoDB:', userId);
      return event;
    }
    
    throw error; // Re-throw other errors
  }
};