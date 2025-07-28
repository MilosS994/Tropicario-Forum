import app from "../src/server.js";
import request from "supertest";
import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import User from "../src/models/user.model.js";
import Notification from "../src/models/notification.model.js";

describe("Notification actions", () => {
  let cookies;

  beforeAll(async () => {
    await connectDB();

    await User.deleteMany();

    // Create user
    await User.create({
      username: "user",
      email: "user@mail.com",
      password: "user1234",
    });
  });

  beforeEach(async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });
    cookies = loginRes.headers["set-cookie"];
  });

  afterAll(async () => {
    await User.deleteMany();
    await mongoose.connection.close();
  });

  //   Get a notification
  test("should get unread notifications", async () => {
    const user = await User.findOne({ email: "user@mail.com" }).select("_id");

    await Notification.create({
      user: user._id,
      type: "dm",
      message: "You got a new DM!",
    });

    const res = await request(app)
      .get("/api/v1/user/notifications/unread")
      .set("Cookie", cookies);

    console.log(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    expect(res.body.notifications[0]).toHaveProperty("type");
    expect(res.body.notifications[0]).toHaveProperty("message");
  });

  //   Mark notification as read
  test("should mark notification as read", async () => {
    const user = await User.findOne({ email: "user@mail.com" }).select("_id");

    const notification = await Notification.create({
      user: user._id,
      type: "ban",
      message: "Your account was banned",
    });

    const res = await request(app)
      .patch(`/api/v1/user/notifications/${notification._id}/read`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.notification.isRead).toBe(true);
  });
});
