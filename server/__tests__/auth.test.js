import app from "../src/server.js";
import request from "supertest";
import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";

describe("User authentication", () => {
  let cookies;

  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany();
  });

  afterEach(async () => {
    await User.deleteMany();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  //   User registration
  test("should register a new user", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
  });

  // User registration - email already exists
  test("should not register a new user if email is already registered", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "user@mail.com",
      password: "user1234",
      username: "user2",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  // User registration - username already exists
  test("should not register a new user if email is already registered", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    const res = await request(app).post("/api/v1/auth/register").send({
      email: "user2@mail.com",
      password: "user1234",
      username: "user",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Username already taken");
  });

  // User registration - full name length validation
  test("should not register a new user if email is already registered", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "user@mail.com",
      password: "user1234",
      username: "user",
      fullName:
        "Asdfgasdfgasdfgasdfgasdfgasdfg Asdfgasdfgasdfgasdfgasdfgasdfgasdfgasdfgasdfgasdfgasdfgasdfgasdfgasdfg",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.fullName).toBe(
      "Full name can't be more than 75 characters long"
    );
  });

  //   User registration - email validation
  test("should not register a new user if there is no email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ password: "user1234", username: "user" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.email).toBe("Email is required");
  });

  //   User registraion - invalid email format
  test("should not register a new user if there is invalid email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "usermail.com", password: "user1234", username: "user" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.email).toBe("Invalid email format");
  });

  //   User registraion - password validation
  test("should not register a new user if there is no password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", username: "user" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.password).toBe("Password is required");
  });

  // User registration - too short password
  test("should not register a new user if password is less than 8 characters long", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user12", username: "user" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.password).toBe(
      "Password must be at least 8 characters long"
    );
  });

  // User registration - username validation
  test("should not register a new user if there is no username", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.username).toBe("Username is required");
  });

  // User registration - too short username
  test("should not register a new user if there is username less than 2 characters long", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "a" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.username).toBe(
      "Username must be between 2 and 55 characters long"
    );
  });

  // User registration - too long username
  test("should not register a new user if there is username more than 55 characters long", async () => {
    const res = await request(app).post("/api/v1/auth/register").send({
      email: "user@mail.com",
      password: "user1234",
      username:
        "asdfghjklasdfghjklasdfghjklasdfghjklasdfghjklasdfghjklasdfghjklasdfghjklasdfg",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.username).toBe(
      "Username must be between 2 and 55 characters long"
    );
  });

  //   User login
  test("should login an existing user", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User logged in successfully");
  });

  // User login validation - user is banned
  test("should not login an existing user if banned", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    // Set user to be banned
    await User.findOneAndUpdate(
      { email: "user@mail.com" },
      { $set: { status: "banned" } }
    );

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Your account is banned");
  });

  // User login validation - user is deleted (soft delete)
  test("should not login an existing user if deleted", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    // Set user to be deleted (soft delete)
    await User.findOneAndUpdate(
      { email: "user@mail.com" },
      { $set: { status: "deleted" } }
    );

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Your account is deleted");
  });

  // User login validation - user is not registered
  test("should not login a user that is not registered", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  // User login validation - wrong password
  test("should not login a user that is not registered", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user12345" });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("Invalid email or password");
  });

  // User login - password validation
  test("should not login a user if there is no password", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.password).toBe("Password is required");
  });

  // User login - email validation
  test("should not login a user if there is no email", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ password: "user1234" });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.email).toBe("Email is required");
  });

  //   Get user info
  test("should retrieve user data", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });
    cookies = loginRes.headers["set-cookie"];
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User data retrieved successfully");
  });

  // Get user info validation - no token
  test("should not retrieve user data if there is no token", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });

    const res = await request(app).get("/api/v1/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe("No token provided");
  });

  // Get user info - user is banned while logged in
  test("should not retrieve user data if user is banned", async () => {
    await request(app).post("/api/v1/auth/register").send({
      email: "user@mail.com",
      password: "user1234",
      username: "user",
    });

    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });
    cookies = loginRes.headers["set-cookie"];

    // Set user to be banned
    await User.findOneAndUpdate(
      { email: "user@mail.com" },
      { $set: { status: "banned" } }
    );

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe("Access denied");
  });

  //   User logout
  test("should logout logged user", async () => {
    await request(app)
      .post("/api/v1/auth/register")
      .send({ email: "user@mail.com", password: "user1234", username: "user" });

    await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });

    const res = await request(app).post("/api/v1/auth/logout");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User logged out successfully");
  });
});
