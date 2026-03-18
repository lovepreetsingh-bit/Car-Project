# Car Selling Platform: Auth + Chat Implementation

## 1. Updated Architecture

### Frontend (React + Tailwind + Axios)
- `AuthContext` manages login state and JWT persistence.
- `ProtectedRoute` blocks pages that need authentication.
- Public pages:
  - Home
  - Car details
  - Login
  - Register
- Protected pages:
  - Add car
  - Chat page
- Axios interceptor automatically sends `Authorization: Bearer <token>`.
- `socket.io-client` connects to backend for real-time chat.

### Backend (Node.js + Express + MongoDB)
- REST APIs for auth, cars, chats, messages.
- JWT-based auth middleware protects private routes.
- Passwords hashed using bcrypt.
- Socket.io attached to same HTTP server.
- Socket middleware validates JWT for real-time connection.

## 2. Database Schemas

### User
- `name: String (required)`
- `email: String (required, unique, lowercase)`
- `password: String (required, min 6, select: false)`
- `phone: String (required)`
- timestamps

### Chat
- `car: ObjectId -> Car (required)`
- `buyer: ObjectId -> User (required)`
- `seller: ObjectId -> User (required)`
- `messages: [ObjectId -> Message]`
- `lastMessageAt: Date`
- timestamps
- Unique index on `(car, buyer, seller)`

### Message
- `chat: ObjectId -> Chat (required)`
- `sender: ObjectId -> User (required)`
- `content: String (required, trimmed)`
- timestamps

## 3. Backend API Routes

### Auth Routes
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me` (protected)

### Car Routes
- `GET /api/cars` (public)
- `GET /api/cars/:id` (public)
- `POST /api/cars` (protected)
- `PUT /api/cars/:id` (protected + owner only)
- `DELETE /api/cars/:id` (protected + owner only + not sold)
- `PATCH /api/cars/:id/sold` (protected + owner only)

### Chat Routes (all protected)
- `POST /api/chats/start` with `{ carId }`
- `GET /api/chats`
- `GET /api/chats/:chatId/messages`
- `POST /api/chats/:chatId/messages` with `{ content }`

## 4. Authentication Middleware

- Reads `Authorization` header.
- Verifies JWT using `JWT_SECRET`.
- Loads user from DB.
- Adds user to `req.user`.
- Rejects request with `401` for invalid/missing token.

## 5. Socket.io Setup (Real-time Chat)

- Server created from Express HTTP server (`http.createServer(app)`).
- Socket auth middleware validates JWT from `socket.handshake.auth.token`.
- On connect:
  - Joins private user room (`userId`)
  - Joins all rooms for user's chats (`chatId`)
- On message send via REST API:
  - Message saved in DB
  - Server emits `chat:message` to room `chatId`

## 6. React Components Added

- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/pages/RegisterPage.jsx`
- `frontend/src/pages/ChatPage.jsx`
- `frontend/src/components/ProtectedRoute.jsx`
- `frontend/src/context/AuthContext.jsx`

### Integration Updates
- `App.js` now includes login/register/chat routes and protected routes.
- `index.js` wraps app with `AuthProvider`.
- Home page now shows auth actions (login/register/logout).
- Car details page now supports:
  - Owner-only delete/mark sold
  - Buyer "Chat with Seller" button
- Add car page now relies on logged-in user identity from JWT.

## 7. Axios API Call Examples

```js
// Register
authAPI.register({ name, email, password, phone });

// Login
authAPI.login({ email, password });

// Get current user
authAPI.getMe();

// Start chat from car details
chatAPI.startChat(carId);

// Load chat messages
chatAPI.getChatMessages(chatId);

// Send message
chatAPI.sendMessage(chatId, "Is this car still available?");
```

## 8. Folder Structure

```txt
backend/
  controllers/
    authController.js
    carController.js
    chatController.js
  middleware/
    auth.js
  models/
    User.js
    Car.js
    Chat.js
    Message.js
  routes/
    authRoutes.js
    carRoutes.js
    chatRoutes.js
  server.js

frontend/src/
  components/
    CarCard.jsx
    ProtectedRoute.jsx
  context/
    AuthContext.jsx
  pages/
    HomePage.jsx
    CarDetailPage.jsx
    AddCarPage.jsx
    LoginPage.jsx
    RegisterPage.jsx
    ChatPage.jsx
  services/
    api.js
```

## 9. Security Best Practices

- Use strong `JWT_SECRET` in production.
- Keep JWT expiry short (for example `15m` to `1d`) with refresh strategy as needed.
- Hash passwords with bcrypt (`salt rounds >= 10`).
- Validate and sanitize all input.
- Never trust client-side owner checks; enforce ownership on backend.
- Restrict CORS to trusted origins in production.
- Add rate limiting on login and message routes.
- Avoid returning sensitive fields (`password` excluded in queries).
- Use HTTPS in production for API and sockets.

## Local Setup Notes

1. Backend `.env`:
   - `MONGODB_URI=...`
   - `JWT_SECRET=...`
   - `JWT_EXPIRES_IN=7d`
2. Frontend `.env`:
   - `REACT_APP_API_URL=http://localhost:5000/api`
   - `REACT_APP_SOCKET_URL=http://localhost:5000`
3. Install deps:
   - `cd backend && npm install`
   - `cd frontend && npm install`
4. Start backend, then frontend.
