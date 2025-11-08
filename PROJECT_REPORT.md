# PiperCode - Coding Statistics Platform
## AWS Cloud-Based Web Application Project Report

---

## 1. Executive Summary

**Project Name:** PiperCode  
**Project Type:** Full-Stack Web Application  
**Course:** AWS Cloud Computing Course  
**Deployment:** Frontend on Vercel, Backend on AWS Serverless Architecture

PiperCode is a modern web application that tracks and displays coding statistics for developers. The platform allows users to view their coding activity, compare performance with others on a leaderboard, manage their profiles, and configure privacy and notification settings. The application demonstrates a complete serverless architecture using AWS services including API Gateway, Lambda, DynamoDB, Cognito, CloudWatch, and IAM.

---

## 2. Project Overview

### 2.1 Purpose
PiperCode provides developers with a platform to:
- Track coding activity and statistics
- Visualize coding patterns through charts and graphs
- Compete on leaderboards
- Manage profile and privacy settings
- View detailed statistics including streaks, language usage, and project activity

### 2.2 Key Features
1. **User Authentication** - Secure login/signup using AWS Cognito
2. **Dashboard** - Overview of coding statistics with visualizations
3. **Profile Page** - Detailed user profile with activity charts
4. **Settings Page** - Profile, notification, and privacy management
5. **Leaderboard** - Global and friends-based rankings

---

## 3. Architecture Overview

### 3.1 System Architecture

```
┌─────────────────┐
│   Frontend      │
│   (Vercel)      │
│   React + TS    │
└────────┬────────┘
         │ HTTPS
         │ JWT Tokens
         ▼
┌─────────────────┐
│  API Gateway    │
│  (REST API)     │
└────────┬────────┘
         │
         ├──► Lambda: getMe
         ├──► Lambda: postMe
         ├──► Lambda: leaderboard
         └──► Lambda: postSignUp (Cognito Trigger)
         │
         ▼
┌─────────────────┐
│    DynamoDB     │
│ pipercode-users │
└─────────────────┘

┌─────────────────┐
│ AWS Cognito     │
│ User Pool       │
└─────────────────┘
```

### 3.2 Technology Stack

#### Frontend
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite 5.4.2
- **Styling:** Tailwind CSS 3.4.1
- **Routing:** React Router DOM 7.9.4
- **Charts:** Chart.js 4.5.1 with react-chartjs-2
- **Icons:** Lucide React
- **Hosting:** Vercel

#### Backend
- **API:** AWS API Gateway (HTTP API)
- **Compute:** AWS Lambda (Node.js)
- **Database:** Amazon DynamoDB
- **Authentication:** AWS Cognito User Pool
- **Monitoring:** AWS CloudWatch
- **Security:** AWS IAM

---

## 4. Frontend Implementation

### 4.1 Application Structure

```
frontend/
├── src/
│   ├── api/              # API client functions
│   ├── components/       # Reusable UI components
│   ├── config/           # Cognito configuration
│   ├── pages/            # Route pages
│   ├── routes/           # Route protection
│   └── types/            # TypeScript definitions
```

### 4.2 Key Pages

#### 4.2.1 Dashboard (`/`)
- Displays coding statistics overview
- Features:
  - Today's coding time
  - Weekly and monthly summaries
  - Language distribution (Doughnut chart)
  - Project activity (Bar chart)
  - Streak counter
  - Active languages and projects count
- Data Source: `GET /me` API endpoint

#### 4.2.2 Profile Page (`/profile/:id`)
- User profile with detailed statistics
- Features:
  - User avatar and status indicator
  - Current activity display
  - Statistics cards (Total time, Streak, Languages, Projects)
  - Activity chart (7-day line graph)
  - Top languages visualization
  - Tabbed interface (Overview, Projects, Statistics)
- Data Source: `GET /me` or `GET /user/:id`

#### 4.2.3 Settings Page (`/settings`)
- User account and preferences management
- Sections:
  - **Account:** Display user information (name, email, username, user ID)
  - **Profile:** Edit display name and status message
  - **VS Code Extension:** Information about activity tracker extension
  - **Notifications:** Toggle notification preferences
    - Friend activity notifications
    - Achievement notifications
    - Weekly report
    - Leaderboard updates
  - **Privacy:** Control visibility settings
    - Show profile
    - Show activity
    - Show statistics
  - **Danger Zone:** Account management options
- Data Source: `GET /me` and `POST /me`

#### 4.2.4 Leaderboard Page (`/leaderboard`)
- Competitive rankings display
- Features:
  - Global and Friends filters
  - Time period filters (Week, Month, All Time)
  - Ranked list with user avatars
  - Status indicators
  - Coding time display
  - Streak information
  - Special styling for top 3 positions
- Data Source: `GET /leaderboard`

#### 4.2.5 Login Page (`/login`)
- Initiates OAuth 2.0 PKCE flow
- Redirects to Cognito hosted UI

#### 4.2.6 Auth Callback (`/auth/callback`)
- Handles OAuth callback from Cognito
- Exchanges authorization code for tokens
- Stores tokens in sessionStorage

### 4.3 Authentication Flow

The application uses **OAuth 2.0 Authorization Code Flow with PKCE** (Proof Key for Code Exchange):

1. User clicks login → redirected to Cognito hosted UI
2. User authenticates with Cognito
3. Cognito redirects back with authorization code
4. Frontend exchanges code for tokens (ID token, Access token, Refresh token)
5. Tokens stored in sessionStorage
6. Access token included in API requests via Authorization header

**Security Features:**
- PKCE implementation for enhanced security
- Token expiration checking
- Protected routes using `ProtectedRoute` component
- Automatic token validation

### 4.4 API Client

The API client (`src/api/client.ts`) provides:
- Base URL configuration: `https://r0cwi88py6.execute-api.ap-south-1.amazonaws.com/prod`
- Automatic JWT token injection
- Error handling
- Functions:
  - `getMe()` - Get current user data
  - `getUserById(userId)` - Get user by ID
  - `getLeaderboard()` - Get leaderboard data
  - `updateMe(payload)` - Update user profile/settings

---

## 5. Backend Implementation

### 5.1 AWS Services Used

#### 5.1.1 Amazon API Gateway
- **Type:** HTTP API
- **Region:** ap-south-1
- **Authorization:** JWT Authorizer (Cognito User Pool)
- **Endpoints:**
  - `GET /me` - Retrieve current user
  - `POST /me` - Update user profile/settings
  - `GET /leaderboard` - Get leaderboard rankings
  - `GET /user/:id` - Get user by ID

#### 5.1.2 AWS Lambda Functions

**1. getMe Lambda**
- **Purpose:** Retrieve authenticated user's data
- **Runtime:** Node.js
- **SDK:** AWS SDK v3 (@aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb)
- **Functionality:**
  - Extracts user ID from JWT claims (`sub`)
  - Performs DynamoDB GetItem operation
  - Returns user data or 404 if not found
- **Environment Variables:** `TABLE_NAME`
- **IAM Permissions:** DynamoDB read access

**2. postMe Lambda**
- **Purpose:** Update user profile and settings
- **Runtime:** Node.js
- **SDK:** AWS SDK v2 (aws-sdk)
- **Functionality:**
  - Updates user fields: name, username, statusMessage
  - Updates notification preferences
  - Updates privacy settings
  - Uses DynamoDB UpdateExpression for partial updates
- **Environment Variables:** `TABLE_NAME`
- **IAM Permissions:** DynamoDB write access

**3. leaderboard Lambda**
- **Purpose:** Generate leaderboard rankings
- **Runtime:** Node.js
- **SDK:** AWS SDK v2 (aws-sdk)
- **Functionality:**
  - Scans all users from DynamoDB
  - Calculates rankings based on `weekTime`
  - Sorts users by weekly coding time (descending)
  - Returns ranked list with user details
- **Environment Variables:** `TABLE_NAME`
- **IAM Permissions:** DynamoDB scan access

**4. postSignUp Lambda (Cognito Trigger)**
- **Purpose:** Create user record in DynamoDB on signup
- **Trigger:** Cognito Post Confirmation trigger
- **Runtime:** Node.js
- **SDK:** AWS SDK v2 (aws-sdk)
- **Functionality:**
  - Extracts user attributes from Cognito event
  - Creates default user record with:
    - User ID (sub)
    - Email, name, username
    - Default statistics (all zeros)
    - Default notification settings
    - Default privacy settings
    - Generated avatar URL
  - Prevents duplicate creation with ConditionExpression
- **Environment Variables:** `TABLE_NAME`
- **IAM Permissions:** DynamoDB write access

#### 5.1.3 Amazon DynamoDB
- **Table Name:** `pipercode-users`
- **Primary Key:** `userId` (String)
- **Data Model:**
  ```json
  {
    "userId": "string",
    "email": "string",
    "name": "string",
    "username": "string",
    "status": "online|coding|idle",
    "statusMessage": "string",
    "avatar": "string (URL)",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp",
    "stats": {
      "weekTime": number (seconds),
      "monthTime": number (seconds),
      "totalTime": number (seconds),
      "streak": number,
      "longestStreak": number,
      "languages": { "language": seconds },
      "projects": { "project": seconds }
    },
    "notifications": {
      "friendActivity": boolean,
      "achievements": boolean,
      "weeklyReport": boolean,
      "leaderboardUpdates": boolean
    },
    "privacy": {
      "showProfile": boolean,
      "showActivity": boolean,
      "showStats": boolean
    },
    "currentActivity": {
      "language": "string",
      "project": "string",
      "ide": "string",
      "startTime": number
    }
  }
  ```

#### 5.1.4 AWS Cognito
- **User Pool ID:** `ap-south-1_F2cFRz0qR`
- **App Client ID:** `3b7fr3mamdosg4nnbjaklsk53j`
- **Region:** ap-south-1
- **Features:**
  - Managed signup/login UI
  - OAuth 2.0 / OpenID Connect
  - JWT token generation
  - Post-confirmation Lambda trigger
- **Authentication Flow:** Authorization Code with PKCE

#### 5.1.5 AWS CloudWatch
- **Purpose:** Logging and debugging
- **Usage:**
  - Lambda function logs
  - Error tracking
  - Performance monitoring
  - Debugging API Gateway and Lambda issues

#### 5.1.6 AWS IAM
- **Purpose:** Access control and permissions
- **Roles/Policies:**
  - Lambda execution roles with DynamoDB permissions
  - API Gateway service role
  - Cognito service role
- **Principle of Least Privilege:** Each Lambda has only necessary permissions

---

## 6. Security Implementation

### 6.1 Authentication & Authorization
- **JWT-based authentication** via AWS Cognito
- **API Gateway JWT Authorizer** validates tokens on every request
- **PKCE flow** prevents authorization code interception
- **Token expiration** checked client-side
- **Protected routes** prevent unauthorized access

### 6.2 Data Security
- **User isolation:** Each user can only access their own data (enforced via JWT `sub` claim)
- **CORS configuration:** Restricted to frontend origin
- **HTTPS only:** All communications encrypted
- **IAM roles:** Least privilege access to DynamoDB

### 6.3 Privacy Controls
- User-configurable privacy settings
- Profile visibility controls
- Activity sharing preferences
- Statistics visibility toggles

---

## 7. API Endpoints

### 7.1 GET /me
**Description:** Get current authenticated user's data  
**Authorization:** Required (JWT)  
**Response:**
```json
{
  "userId": "string",
  "name": "string",
  "username": "string",
  "email": "string",
  "stats": { ... },
  "notifications": { ... },
  "privacy": { ... }
}
```

### 7.2 POST /me
**Description:** Update user profile or settings  
**Authorization:** Required (JWT)  
**Request Body:**
```json
{
  "name": "string",
  "username": "string",
  "statusMessage": "string",
  "notifications": { ... },
  "privacy": { ... }
}
```

### 7.3 GET /leaderboard
**Description:** Get leaderboard rankings  
**Authorization:** Required (JWT)  
**Response:**
```json
[
  {
    "rank": 1,
    "user": { ... },
    "timeThisWeek": 3600,
    "timeThisMonth": 14400,
    "change": 0
  }
]
```

### 7.4 GET /user/:id
**Description:** Get user by ID  
**Authorization:** Required (JWT)  
**Response:** User object

---

## 8. User Experience Features

### 8.1 Visualizations
- **Doughnut Chart:** Language distribution
- **Bar Chart:** Project activity
- **Line Chart:** 7-day activity trend
- **Progress Bars:** Language usage percentages

### 8.2 UI Components
- **StatCard:** Displays key metrics with icons
- **StreakCounter:** Visual streak display
- **LanguageBadge:** Colored language tags
- **StatusIndicator:** Online/coding/idle status
- **ActivityFeed:** User activity timeline

### 8.3 Responsive Design
- Mobile-first approach
- Tailwind CSS responsive utilities
- Adaptive layouts for different screen sizes

### 8.4 Dark Theme
- Modern dark color scheme
- Gradient backgrounds
- High contrast for readability

---

## 9. Deployment

### 9.1 Frontend Deployment
- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:**
  - `VITE_API_BASE_URL` (optional, defaults to production API)

### 9.2 Backend Deployment
- **API Gateway:** Deployed via AWS Console/CLI
- **Lambda Functions:** Deployed as ZIP packages
- **DynamoDB Table:** Created via AWS Console/CLI
- **Cognito User Pool:** Configured via AWS Console
- **Environment Variables:** Set per Lambda function

---

## 10. Challenges & Solutions

### 10.1 Challenge: CORS Configuration
**Solution:** Configured CORS headers in Lambda response functions

### 10.2 Challenge: JWT Token Validation
**Solution:** Used API Gateway JWT Authorizer with Cognito User Pool

### 10.3 Challenge: DynamoDB Data Modeling
**Solution:** Designed flexible schema with nested objects for stats, notifications, and privacy

### 10.4 Challenge: Leaderboard Performance
**Solution:** Implemented DynamoDB scan with in-memory sorting (acceptable for current scale)

---

## 11. Future Enhancements

1. **Real-time Activity Tracking:** Integration with VS Code extension
2. **Friend System:** Add/remove friends functionality
3. **Achievements:** Badge and milestone system
4. **Activity Feed:** Real-time activity updates
5. **Advanced Analytics:** More detailed statistics and insights
6. **Export Data:** Download statistics as CSV/JSON
7. **Social Features:** Share achievements, comment on profiles

---

## 12. Learning Outcomes

### 12.1 AWS Services Mastery
- **API Gateway:** RESTful API creation and JWT authorization
- **Lambda:** Serverless function development and deployment
- **DynamoDB:** NoSQL database design and operations
- **Cognito:** User authentication and authorization
- **CloudWatch:** Logging and monitoring
- **IAM:** Role-based access control

### 12.2 Full-Stack Development
- React with TypeScript
- Serverless architecture
- OAuth 2.0 / OpenID Connect
- RESTful API design
- Responsive UI/UX design

### 12.3 Best Practices
- Security-first approach
- Error handling
- Code organization
- Environment variable management
- CORS configuration

---

## 13. Conclusion

PiperCode successfully demonstrates a complete serverless web application using AWS services. The project showcases:
- Modern frontend development with React and TypeScript
- Secure authentication using AWS Cognito
- Scalable backend with Lambda and API Gateway
- Efficient data storage with DynamoDB
- Comprehensive monitoring with CloudWatch
- Proper security implementation with IAM

The application provides a solid foundation for a coding statistics platform and demonstrates proficiency in cloud computing concepts and serverless architecture.

---

## 14. Technical Specifications

### 14.1 Frontend Dependencies
- react: ^18.3.1
- react-dom: ^18.3.1
- react-router-dom: ^7.9.4
- chart.js: ^4.5.1
- react-chartjs-2: ^5.3.0
- lucide-react: ^0.344.0
- tailwindcss: ^3.4.1
- typescript: ^5.5.3
- vite: ^5.4.2

### 14.2 Backend Dependencies
- aws-sdk: ^2.1692.0 (postMe, leaderboard, postSignUp)
- @aws-sdk/client-dynamodb: ^3.921.0 (getMe)
- @aws-sdk/lib-dynamodb: ^3.921.0 (getMe)

### 14.3 AWS Configuration
- **Region:** ap-south-1 (Mumbai)
- **API Gateway:** HTTP API
- **Cognito Domain:** ap-south-1f2cfrz0qr.auth.ap-south-1.amazoncognito.com
- **DynamoDB Table:** pipercode-users

---

## Appendix A: Code Structure

### Frontend File Organization
```
frontend/src/
├── api/
│   └── client.ts              # API client functions
├── components/
│   ├── ActivityFeed.tsx
│   ├── LanguageBadge.tsx
│   ├── Navbar.tsx
│   ├── StatCard.tsx
│   ├── StatusIndicator.tsx
│   └── StreakCounter.tsx
├── config/
│   └── cognito.ts             # Cognito configuration and auth functions
├── pages/
│   ├── AuthCallback.tsx
│   ├── Dashboard.tsx
│   ├── Friends.tsx
│   ├── Leaderboard.tsx
│   ├── Login.tsx
│   ├── Profile.tsx
│   └── Settings.tsx
├── routes/
│   └── ProtectedRoute.tsx     # Route protection component
└── types/
    └── index.ts               # TypeScript type definitions
```

### Backend File Organization
```
backend/aws/lambda/
├── getMe/
│   ├── index.js               # Get user data
│   └── package.json
├── postMe/
│   ├── index.js               # Update user data
│   └── package.json
├── leaderboard/
│   ├── index.js               # Leaderboard generation
│   └── package.json
└── postSignUp/
    ├── index.js               # Cognito trigger handler
    └── package.json
```

---

## Appendix B: API Request/Response Examples

### GET /me Request
```http
GET /me HTTP/1.1
Host: r0cwi88py6.execute-api.ap-south-1.amazonaws.com
Authorization: Bearer <access_token>
```

### GET /me Response
```json
{
  "userId": "abc123",
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "stats": {
    "weekTime": 14400,
    "monthTime": 57600,
    "totalTime": 86400,
    "streak": 5,
    "languages": {
      "JavaScript": 7200,
      "TypeScript": 3600
    }
  }
}
```

---

**Report Generated:** Based on codebase analysis  
**Project Status:** Complete and Functional  
**Last Updated:** [Current Date]

