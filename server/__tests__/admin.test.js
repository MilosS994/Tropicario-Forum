import app from "../src/server.js";
import request from "supertest";
import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import Section from "../src/models/section.model.js";
import Thread from "../src/models/thread.model.js";
import Topic from "../src/models/topic.model.js";
import Comment from "../src/models/comment.model.js";
import User from "../src/models/user.model.js";

describe("Admin actions", () => {
  let cookies;

  beforeAll(async () => {
    await connectDB();

    await User.deleteMany();

    // Create admin user
    await User.create({
      username: "Admin",
      email: "admin@mail.com",
      password: "admin1234",
      role: "admin",
    });
  });

  beforeEach(async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "admin@mail.com", password: "admin1234" });
    cookies = loginRes.headers["set-cookie"];
  });

  afterEach(async () => {
    await Comment.deleteMany();
    await Thread.deleteMany();
    await Topic.deleteMany();
    await Section.deleteMany();
  });

  afterAll(async () => {
    await User.deleteMany();

    await mongoose.connection.close();
  });

  //   Create section
  test("should create a forum section", async () => {
    const res = await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "New Section",
        description: "Section descripiton",
        order: 1,
      })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Section created successfully");
    expect(res.body.section).toHaveProperty("title");
    expect(res.body.section).toHaveProperty("description");
    expect(res.body.section).toHaveProperty("order");
  });

  //   Create section validation - same title already exists
  test("should not create a forum section if the section with the same title already exists", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Section 2",
        description: "Section descripiton",
        order: 1,
      })
      .set("Cookie", cookies);

    const res = await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Section 2",
        description: "Section descripiton new",
        order: 2,
      })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Section with this title already exists");
  });

  //   Create section validation - empty title
  test("should not create a section if the title is an empty string", async () => {
    const res = await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "",
        description: "Section descripiton",
        order: 1,
      })
      .set("Cookie", cookies);

    console.log(res.body);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.title).toBe("Section title is required");
  });

  //   Update an existing section
  test("should update an existing section", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "A section",
        description: "Section descripiton",
        order: 1,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "A section" }).select("_id");
    const sectionId = section._id.toString();

    const res = await request(app)
      .patch(`/api/v1/admin/sections/${sectionId}`)
      .send({ description: "A new description" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Section updated successfully");
    expect(res.body.section.description).toBe("A new description");
  });

  //   Update a section with the title that already exists
  test("should not update section to a new title if that title already exists", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Just a new section",
        description: "Section descripiton",
        order: 1,
      })
      .set("Cookie", cookies);

    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Just a new section 2",
        description: "Section descripiton",
        order: 1,
      })
      .set("Cookie", cookies);

    const section = await Section.findOne({
      title: "Just a new section 2",
    }).select("_id");
    const sectionId = section._id.toString();

    const res = await request(app)
      .patch(`/api/v1/admin/sections/${sectionId}`)
      .send({ title: "Just a new section" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe("Section with this title already exists");
  });

  //   Delete a section
  test("should delete a section", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Example section",
        description: "Section descripiton",
        order: 3,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Example section" }).select(
      "_id"
    );
    const sectionId = section._id.toString();

    const res = await request(app)
      .delete(`/api/v1/admin/sections/${sectionId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Section deleted successfully");
  });

  //   Delete a section validation - invalid ID
  test("should not delete a section that doesn't exist", async () => {
    const invalidSectionId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/v1/admin/sections/${invalidSectionId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Section not found");
  });

  //   Create a thread
  test("should create a new thread", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Palms" }).select("_id");
    const sectionId = section._id.toString();

    const res = await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "A thread", section: sectionId })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Thread created successfully");
    expect(res.body.thread).toHaveProperty("title");
    expect(res.body.thread.title).toBe("A thread");
    expect(res.body.thread).toHaveProperty("section");
  });

  //   Create a thread without section validation
  test("should not create a thread if there is no section", async () => {
    const res = await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "A new thread" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.section).toBe("Section is required");
  });

  //   Update a thread
  test("should update an existing thread", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Palms" });
    const sectionId = section._id.toString();

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "Trachycarpus Fortunei", section: sectionId })
      .set("Cookie", cookies);

    const thread = await Thread.findOne({
      title: "Trachycarpus Fortunei",
    }).select("_id");
    const threadId = thread._id.toString();

    const res = await request(app)
      .patch(`/api/v1/admin/threads/${sectionId}/${threadId}`)
      .send({ title: "Another cacti" })
      .set("Cookie", cookies);

    console.log(res.body);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Thread updated successfully");
    expect(res.body.thread).toHaveProperty("title");
    expect(res.body.thread.title).toBe("Another cacti");
  });

  //   Update a thread with the title that already exists
  test("should update an existing thread", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Tropical Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies);

    const section = await Section.findOne({ title: "Tropical Palms" });
    const sectionId = section._id.toString();

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "Phoenix Canariensis", section: sectionId })
      .set("Cookie", cookies);

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "Phoenix Dactylifera", section: sectionId })
      .set("Cookie", cookies);

    const thread = await Thread.findOne({
      title: "Phoenix Canariensis",
    }).select("_id");
    const threadId = thread._id.toString();

    const res = await request(app)
      .patch(`/api/v1/admin/threads/${sectionId}/${threadId}`)
      .send({ title: "Phoenix Dactylifera" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(409);
    expect(res.body.message).toBe(
      "Thread with this title already exists in this section"
    );
  });

  //   Delete a thread
  test("should delete a thread", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Cacti",
        description: "Some cacti",
        order: 5,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Cacti" }).select("_id");
    const sectionId = section._id.toString();

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "Opuntia", section: sectionId })
      .set("Cookie", cookies)
      .expect(201);

    const thread = await Thread.findOne({ title: "Opuntia" }).select("_id");
    const threadId = thread._id.toString();

    const res = await request(app)
      .delete(`/api/v1/admin/threads/${sectionId}/${threadId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Thread deleted successfully");
  });

  //   Delete an invalid thread
  test("should not delete a thread without an ID", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Fruit",
        description: "Some fruit",
        order: 6,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Fruit" }).select("_id");
    const sectionId = section._id.toString();

    const invalidThreadId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/v1/admin/threads/${sectionId}/${invalidThreadId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Thread not found");
  });

  //   Close the topic
  test("should close the topic", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Palms" }).select("_id");
    const sectionId = section._id.toString();

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "A thread", section: sectionId })
      .set("Cookie", cookies)
      .expect(201);

    const thread = await Thread.findOne({ title: "A thread" }).select("_id");
    const threadId = thread._id.toString();

    await request(app)
      .post(`/api/v1/topics/thread/${threadId}`)
      .send({
        title: "My new palm",
        content: "About my new palm",
        thread: threadId,
      })
      .set("Cookie", cookies)
      .expect(201);

    const topic = await Topic.findOne({
      title: "My new palm",
    }).select("_id");
    const topicId = topic._id.toString();

    const res = await request(app)
      .patch(`/api/v1/admin/topics/${topicId}/close`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topic closed successfully");
    expect(res.body.topic.closed).toBe(true);
  });

  //   Open the topic
  test("should open the closed topic", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Palms" }).select("_id");
    const sectionId = section._id.toString();

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "A thread", section: sectionId })
      .set("Cookie", cookies)
      .expect(201);

    const thread = await Thread.findOne({ title: "A thread" }).select("_id");
    const threadId = thread._id.toString();

    await request(app)
      .post(`/api/v1/topics/thread/${threadId}`)
      .send({
        title: "My new palm",
        content: "About my new palm",
        thread: threadId,
      })
      .set("Cookie", cookies)
      .expect(201);

    const topic = await Topic.findOne({
      title: "My new palm",
    }).select("_id");
    const topicId = topic._id.toString();

    await request(app)
      .patch(`/api/v1/admin/topics/${topicId}/close`)
      .set("Cookie", cookies);

    const res = await request(app)
      .patch(`/api/v1/admin/topics/${topicId}/open`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topic opened successfully");
    expect(res.body.topic.closed).toBe(false);
  });

  //   Toggle pin - pin topic
  test("should pin topic", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies);

    const section = await Section.findOne({ title: "Palms" }).select("_id");
    const sectionId = section._id.toString();

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "A thread", section: sectionId })
      .set("Cookie", cookies);

    const thread = await Thread.findOne({ title: "A thread" }).select("_id");
    const threadId = thread._id.toString();

    await request(app)
      .post(`/api/v1/topics/thread/${threadId}`)
      .send({
        title: "My new palm",
        content: "About my new palm",
        thread: threadId,
      })
      .set("Cookie", cookies);

    const topic = await Topic.findOne({
      title: "My new palm",
    }).select("_id");
    const topicId = topic._id.toString();

    const res = await request(app)
      .patch(`/api/v1/admin/topics/${topicId}/toggle-pin`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topic pinned");
    expect(res.body.topic.pinned).toBe(true);
  });

  //   Toggle pin - unpin topic
  test("should pin topic", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Palms" }).select("_id");
    const sectionId = section._id.toString();

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "A thread", section: sectionId })
      .set("Cookie", cookies)
      .expect(201);

    const thread = await Thread.findOne({ title: "A thread" }).select("_id");
    const threadId = thread._id.toString();

    await request(app)
      .post(`/api/v1/topics/thread/${threadId}`)
      .send({
        title: "My new palm",
        content: "About my new palm",
        thread: threadId,
      })
      .set("Cookie", cookies)
      .expect(201);

    const topic = await Topic.findOne({
      title: "My new palm",
    }).select("_id");
    const topicId = topic._id.toString();

    await request(app)
      .patch(`/api/v1/admin/topics/${topicId}/toggle-pin`)
      .set("Cookie", cookies);

    const res = await request(app)
      .patch(`/api/v1/admin/topics/${topicId}/toggle-pin`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topic unpinned");
    expect(res.body.topic.pinned).toBe(false);
  });

  //   Delete a topic
  test("should delete a topic", async () => {
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies);

    const section = await Section.findOne({ title: "Palms" }).select("_id");
    const sectionId = section._id.toString();

    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "A thread", section: sectionId })
      .set("Cookie", cookies);

    const thread = await Thread.findOne({ title: "A thread" }).select("_id");
    const threadId = thread._id.toString();

    await request(app)
      .post(`/api/v1/topics/thread/${threadId}`)
      .send({
        title: "My new palm",
        content: "About my new palm",
        thread: threadId,
      })
      .set("Cookie", cookies);

    const topic = await Topic.findOne({
      title: "My new palm",
    }).select("_id");
    const topicId = topic._id.toString();

    const res = await request(app)
      .delete(`/api/v1/admin/topics/${topicId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topic deleted successfully");
  });

  //   Delete a comment from another author
  test("should delete a comment from another author", async () => {
    // Register a regular user first
    const regularUser = await User.create({
      username: "regularUser",
      email: "regularUser@mail.com",
      password: "test1234",
    });

    // Create section
    await request(app)
      .post("/api/v1/admin/sections")
      .send({
        title: "Palms",
        description: "Palm trees",
        order: 5,
      })
      .set("Cookie", cookies)
      .expect(201);

    const section = await Section.findOne({ title: "Palms" }).select("_id");
    const sectionId = section._id.toString();

    // Create thread
    await request(app)
      .post("/api/v1/admin/threads")
      .send({ title: "A thread", section: sectionId })
      .set("Cookie", cookies)
      .expect(201);

    const thread = await Thread.findOne({ title: "A thread" }).select("_id");
    const threadId = thread._id.toString();

    // Create topic
    await request(app)
      .post(`/api/v1/topics/thread/${threadId}`)
      .send({
        title: "My new palm",
        content: "About my new palm",
        thread: threadId,
      })
      .set("Cookie", cookies)
      .expect(201);

    const topic = await Topic.findOne({
      title: "My new palm",
    }).select("_id");
    const topicId = topic._id.toString();

    // Insert a comment where the other user is the author
    await Comment.insertOne({
      author: regularUser._id,
      topic: topicId,
      content: "just a content",
    });

    const comment = await Comment.findOne({ content: "just a content" }).select(
      "_id"
    );
    const commentId = comment._id.toString();

    const res = await request(app)
      .delete(`/api/v1/admin/comments/${commentId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Comment deleted successfully");
  });

  //   Get all users in a forum - default, 10 per page
  test("should get all users", async () => {
    // Create some users
    for (let i = 0; i < 10; i++) {
      await User.create({
        username: `User${i}`,
        email: `user${i}@mail.com`,
        password: `user${i}1234`,
      });
    }

    const res = await request(app)
      .get("/api/v1/admin/users")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Users retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.total).toBe(12); // 1 x admin in beforeAll, 1 x regular user and 10 x users in this test
    res.body.users.forEach((user) => {
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("role");
      expect(user).toHaveProperty("status");
      expect(user).toHaveProperty("location");
      expect(user).toHaveProperty("bio");
      expect(user).toHaveProperty("avatar");
    });
  });

  //   Get all users in a forum - 5 per page, 2nd page
  test("should get all users", async () => {
    // Already have users from last test

    const res = await request(app)
      .get("/api/v1/admin/users?limit=5&page=2")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Users retrieved successfully");
    expect(res.body.count).toBe(5);
    expect(res.body.page).toBe(2);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.total).toBe(12); // 1 x admin in beforeAll, 1 x regular user and 10 x users in the test before
    res.body.users.forEach((user) => {
      expect(user).toHaveProperty("username");
      expect(user).toHaveProperty("email");
      expect(user).toHaveProperty("createdAt");
      expect(user).toHaveProperty("role");
      expect(user).toHaveProperty("status");
      expect(user).toHaveProperty("location");
      expect(user).toHaveProperty("bio");
      expect(user).toHaveProperty("avatar");
    });
  });

  // Deactivate a user (soft delete)
  test("should deactivate a user", async () => {
    const user = await User.create({
      username: "aUser",
      email: "auser@mail.com",
      password: "test1234",
    });

    const res = await request(app)
      .patch(`/api/v1/admin/users/${user._id}/deactivate`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deactivated successfully");
    expect(res.body.user.status).toBe("deleted");
  });

  // Deactivate already deactivated user validation
  test("should not deactivate a user that is already deactivated", async () => {
    const user = await User.create({
      username: "User99",
      email: "user99@mail.com",
      password: "test1234",
      status: "deleted",
    });

    const res = await request(app)
      .patch(`/api/v1/admin/users/${user._id}/deactivate`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User is already deactivated");
  });

  // Restore/reactivate user after soft deletion
  test("should restore user", async () => {
    const user = await User.create({
      username: "newUser",
      email: "newuser@mail.com",
      password: "test1234",
      status: "deleted",
    });

    const res = await request(app)
      .patch(`/api/v1/admin/users/${user._id}/restore`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User restored successfully");
    expect(res.body.user.status).toBe("active");
  });

  // Restore/reactivate user that is already active validation
  test("should not restore user that is active", async () => {
    const user = await User.create({
      username: "User77",
      email: "user77@mail.com",
      password: "test1234",
    });

    const res = await request(app)
      .patch(`/api/v1/admin/users/${user._id}/restore`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("User is not deleted");
  });

  // Ban and unban user
  test("should ban user", async () => {
    const user = await User.create({
      username: "user111",
      email: "user111@mail.com",
      password: "test1234",
    });

    const banRes = await request(app)
      .patch(`/api/v1/admin/users/${user._id}/ban`)
      .set("Cookie", cookies);

    expect(banRes.statusCode).toBe(200);
    expect(banRes.body.message).toBe("User banned successfully");
    expect(banRes.body.user.status).toBe("banned");

    const unbanRes = await request(app)
      .patch(`/api/v1/admin/users/${user._id}/unban`)
      .set("Cookie", cookies);

    expect(unbanRes.statusCode).toBe(200);
    expect(unbanRes.body.message).toBe("User unbanned successfully");
    expect(unbanRes.body.user.status).toBe("active");
  });

  // Permanently delete user
  test("should delete user permanently", async () => {
    const user = await User.create({
      username: "User33",
      email: "user33@mail.com",
      password: "test1234",
    });

    const res = await request(app)
      .delete(`/api/v1/admin/users/${user._id}/permanent-delete`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted permanently");
  });

  // Get all banned users - default, 10 per page, 1st page
  test("should return all banned users", async () => {
    for (let i = 0; i < 12; i++) {
      await User.create({
        username: `newUser${i}`,
        email: `newuser${i}@email.com`,
        password: `newuser${i}1234`,
        status: "banned",
      });
    }

    const res = await request(app)
      .get("/api/v1/admin/users/banned")
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Banned users retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.total).toBe(12);
    res.body.users.forEach((user) => {
      expect(user.status).toBe("banned");
    });
  });

  // Get all deleted users - default, 10 per page, 1st page
  test("should get all deleted users", async () => {
    for (let i = 0; i < 15; i++) {
      await User.create({
        username: `someUser${i}`,
        email: `someuser${i}@mail.com`,
        password: `someuser${i}`,
        status: "deleted",
      });
    }

    const res = await request(app)
      .get(`/api/v1/admin/users/deleted`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Deleted users retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.page).toBe(1);
    expect(res.body.totalPages).toBe(2);
    expect(res.body.total).toBe(17); // 15 x users created in this test + 2 x users from previous tests
    res.body.users.forEach((user) => {
      expect(user.status).toBe("deleted");
    });
  });
});
