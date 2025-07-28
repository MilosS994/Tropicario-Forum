import app from "../src/server.js";
import request from "supertest";
import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import Topic from "../src/models/topic.model.js";
import Thread from "../src/models/thread.model.js";
import Section from "../src/models/section.model.js";
import User from "../src/models/user.model.js";
import { slugify } from "../src/utils/slugify.js";

describe("Topic user actions", () => {
  let cookies;

  beforeAll(async () => {
    await connectDB();

    await User.deleteMany();

    // Create user
    const user = await User.create({
      username: "User",
      email: "user@mail.com",
      password: "user1234",
    });

    const sectionTitle = "Section 1";
    const sectionSlug = slugify(sectionTitle);
    const section = await Section.create({
      title: sectionTitle,
      slug: sectionSlug,
    });

    const threadTitle = "Thread example";
    const threadSlug = slugify(threadTitle);
    const thread = await Thread.create({
      title: threadTitle,
      slug: threadSlug,
      section: section._id,
    });

    for (let i = 0; i < 25; i++) {
      let title = `Title_${i}`;
      let slug = slugify(title);
      let content = "Content...";
      await Topic.create({
        title,
        content,
        slug,
        thread: thread._id,
        author: user._id,
      });
    }
  });

  beforeEach(async () => {
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "user@mail.com", password: "user1234" });
    cookies = loginRes.headers["set-cookie"];
  });

  afterAll(async () => {
    await Topic.deleteMany();
    await Thread.deleteMany();
    await Section.deleteMany();
    await User.deleteMany();
    await mongoose.connection.close();
  });

  //   Get all topics in a thread - default, 10 per page
  test("should return all topic in a thread", async () => {
    const thread = await Thread.findOne({ title: "Thread example" }).select(
      "_id"
    );
    const threadId = thread._id.toString();
    const res = await request(app).get(`/api/v1/topics/thread/${threadId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topics retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.page).toBe(1);
    res.body.topics.forEach((topic) => {
      expect(topic).toHaveProperty("title");
      expect(topic).toHaveProperty("thread");
      expect(topic).toHaveProperty("slug");
    });
  });

  //   Get all topics validation from an invalid thread
  test("should not return topics if the thread is invalid", async () => {
    const invalidThreadId = new mongoose.Types.ObjectId();
    const res = await request(app).get(
      `/api/v1/topics/thread/${invalidThreadId}`
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Thread not found");
  });

  //   Get all topics in a thread - pagination, 2nd page and 5 per page
  test("should return topics on the 2nd page and 5 topics in the page", async () => {
    const thread = await Thread.findOne({ title: "Thread example" }).select(
      "_id"
    );
    const threadId = thread._id.toString();
    const res = await request(app).get(
      `/api/v1/topics/thread/${threadId}?page=2&limit=5`
    );

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topics retrieved successfully");
    expect(res.body.count).toBe(5);
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(5);
    expect(res.body.page).toBe(2);
    res.body.topics.forEach((topic) => {
      expect(topic).toHaveProperty("title");
      expect(topic).toHaveProperty("thread");
      expect(topic).toHaveProperty("slug");
    });
  });

  //   Get all topics whose title contain 3 - search validation
  test("should return all the topics in a thread that contain 3 in the title", async () => {
    const thread = await Thread.findOne({ title: "Thread example" }).select(
      "_id"
    );
    const threadId = thread._id.toString();
    const res = await request(app).get(`/api/v1/topics/thread/${threadId}?q=3`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topics retrieved successfully");
    expect(res.body.count).toBe(3);
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(1);
    expect(res.body.page).toBe(1);
    res.body.topics.forEach((topic) => {
      expect(topic).toHaveProperty("title");
      expect(topic).toHaveProperty("thread");
      expect(topic).toHaveProperty("slug");
    });
  });

  //   Get single topic by ID
  test("should return a single topic by ID", async () => {
    const topic = await Topic.findOne({ title: "Title_1" }).select("_id");
    const topicId = topic._id.toString();
    const res = await request(app).get(`/api/v1/topics/${topicId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topic retrieved successfully");
    expect(res.body.topic).toHaveProperty("title");
    expect(res.body.topic).toHaveProperty("content");
    expect(res.body.topic).toHaveProperty("author");
    expect(res.body.topic).toHaveProperty("thread");
  });

  //   Get single topic by invalid ID
  test("should not return a single topic by ID if it is invalid", async () => {
    const topicId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/topics/${topicId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Topic not found");
  });

  //   Create new topic
  test("should create a new topic if a user is logged in", async () => {
    const thread = await Thread.findOne({ title: "Thread example" }).select(
      "_id"
    );
    const threadId = thread._id.toString();
    const title = "New Topic";
    const content = "Some content";
    const res = await request(app)
      .post(`/api/v1/topics/thread/${threadId}`)
      .send({ title, content })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Topic created successfully");
    expect(res.body.topic).toHaveProperty("title");
    expect(res.body.topic).toHaveProperty("content");
    expect(res.body.topic).toHaveProperty("author");
    expect(res.body.topic).toHaveProperty("thread");
    expect(res.body.topic).toHaveProperty("slug");
    expect(res.body.topic).toHaveProperty("commentsCount");
  });

  //   Delete a topic
  test("should delete an existing topic that user made", async () => {
    const thread = await Thread.findOne({ title: "Thread example" }).select(
      "_id"
    );
    const threadId = thread._id.toString();
    const title = "New Topic";
    const content = "Some content";
    await request(app)
      .post(`/api/v1/topics/thread/${threadId}`)
      .send({ title, content })
      .set("Cookie", cookies);

    const topic = await Topic.findOne({ title: "New Topic" }).select("_id");
    const topicId = topic._id.toString();

    const res = await request(app)
      .delete(`/api/v1/topics/${topicId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Topic deleted successfully");
  });

  //   Delete a topic with invalid id
  test("should not delete a topic that doesn't exist", async () => {
    const invalidTopicId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/v1/topics/${invalidTopicId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Topic not found");
  });
});
