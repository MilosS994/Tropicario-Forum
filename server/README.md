<h1 align="center">
  <br>
  <img src="/server/TROPICARIO-FORUM-LOGO.png" alt="Tropicario Forum" width="200">
  <br>
  Tropicario Forum
  <br>
</h1>

<h4 align="center">Tropicario Forum (Backend) Tropicario is a backend project for a modern community forum, inspired by Palmtalk.org, dedicated to enthusiasts of tropical, subtropical, and exotic plants — especially palms, cacti, fruit, and rare greenery. This project was created out of a deep passion for plant growing and forum communities.</h4>

<p align="center">
  <a href="#key-features">Key Features</a> •
  <a href="#how-to-use">How To Use</a> •
  <a href="#documentation">Download</a> •
  <a href="#technologies-used">Credits</a> •
</p>

## Key Features

- Full RESTful API for a community forum
- Admin panel with advanced user/content moderation
- User authentication and role-based access
- Image upload to Cloudinary
- Forgot/reset password system with email (via Nodemailer)
- Pagination, search, sorting on admin endpoints
- Notifications system (unread/read)
- Robust input validation, rate limiting, error handling
- Swagger/OpenAPI docs

## How To Use

To clone and run this application, you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/MilosS994/Tropicario-Forum.git

# Go into server folder
$ cd server

# Install dependencies
$ npm install

# Create .env file (example given)

PORT=5001
NODE_ENV=development

MONGO_URI=...
MONGO_URI_TEST=...

JWT_SECRET=...
JWT_EXPIRES_IN=1d

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

CLIENT_URL=http://localhost:5173

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...

# Run the app in the development mode
$ npm run dev
```

## Documentation

For Swagger API Docs once server is running, visit: [API DOCUMENTATION](http://localhost:5001/api-docs)

## Technologies used

This backend project includes these core technologies and npm packages:

- [Express.js](https://expressjs.com/)
- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [Cloudinary](https://cloudinary.com/)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [Swagger](https://swagger.io/)
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit)
- [express-validator](https://express-validator.github.io/docs)
- [Multer](https://www.npmjs.com/package/multer)
- [Jest](https://jestjs.io/)
- [Supertest](https://www.npmjs.com/package/supertest)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [helmet](https://www.npmjs.com/package/helmet)
- [cors](https://www.npmjs.com/package/cors)

---

> GitHub [@MilosS994](https://github.com/MilosS994) &nbsp;&middot;&nbsp;
