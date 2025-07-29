Tropicario Forum (Backend)
Tropicario is a backend project for a modern community forum, inspired by Palmtalk.org, dedicated to enthusiasts of tropical, subtropical, and exotic plants — especially palms, cacti, fruit, and rare greenery. This project was created out of a deep passion for plant growing and forum communities.

---

✨ Features
• Full RESTful API for a community forum
• Admin panel with advanced user/content moderation
• User authentication and role-based access
• Image upload to Cloudinary
• Forgot/reset password system with email (via Nodemailer)
• Pagination, search, sorting on admin endpoints
• Notifications system (unread/read)
• Robust input validation, rate limiting, error handling
• Swagger/OpenAPI docs

---

TECHNOLOGIES USED
Core Stack
• Node.js + Express.js
• MongoDB + Mongoose
Auth, Security, Uploads
• jsonwebtoken, bcryptjs, cookie-parser
• helmet, cors, express-rate-limit
• multer + cloudinary
API & Docs
• express-validator for validations
• swagger-ui-express + swagger-jsdoc
Developer Tools
• nodemon, cross-env
• jest, supertest for testing
• morgan for logging
• dotenv for environment management

---

PROJECT STRUCTURE
/src
/config - DB connection, swagger
/controllers - All logic for auth, user, admin, content, notifications
/middlewares - Auth, admin check, rate limit, error handling, validators
/models - Mongoose models for User, Section, Thread, Topic, Comment, Notification
/routes - Modular Express routers (auth, user, admin, threads, topics, etc)
/utils - Utility functions
server.js - App init and startup logic

---

API OVERVIEW (Router Highlights)
Auth Routes
• Register / Login / Logout
• Forgot + Reset password (via email)
User Routes
• View & update profile (username/email/fullname)
• Change password
• Upload avatar (Cloudinary)
• Delete account
Notification Routes
• Get unread notifications
• Mark notification as read
Admin Routes (via /api/v1/admin)
• CRUD Sections & Threads
• Ban / Unban / Delete / Restore users
• View banned / deleted / all users
• Manage Topics: pin/unpin, close/open, delete
• Delete Comments
• Get user stats (topics/comments count)
Public Content Routes
• Sections, Threads, Topics (create, get, edit)
• Comments (create, delete)

---

Run Locally (for development only)
Note: This project is primarily for code reference. Local running not required for end users.

# Clone project

$ git clone https://github.com/MilosS994/Tropicario-Forum.git

# Install dependencies

$ cd server
$ npm install

# Start in dev

$ npm run dev

---

📚 Swagger API Docs
Once server is running, visit:
http://localhost:5001/api-docs

---

📓 Author & Vision
Created by Milos Srejic as a passion project from love for palms, cacti and exotic plants.
This backend was built in the spirit of Palmtalk.org — but designed to be clean, modern and flexible for any plant community.
GitHub: @MilosS994

---

🙌 Contributions & Feedback
This project is open for feedback and improvement. PRs, suggestions and ideas are welcome.
