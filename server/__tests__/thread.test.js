import app from "../src/server.js";
import request from "supertest";
import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import Section from "../src/models/section.model.js";
import Thread from "../src/models/thread.model.js";
import { slugify } from "../src/utils/slugify.js";

describe("Thread user actions", () => {
  beforeAll(async () => {
    await connectDB();

    const title = "Section 1";
    const slug = slugify(title);
    await Section.create({ title, slug });

    const section = await Section.findOne({ title });

    let threads = [];
    for (let i = 0; i < 25; i++) {
      let title = `Thread_${i}`;
      let slug = slugify(title);
      threads.push({ title, slug, section: section._id });
    }
    await Thread.insertMany(threads);
  });

  afterAll(async () => {
    await Section.deleteMany({});
    await Thread.deleteMany({});
    await mongoose.connection.close();
  });

  //   Get all threads in a forum - default 10 threads per page
  test("should return all threads", async () => {
    const res = await request(app).get("/api/v1/threads/all");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Threads retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.page).toBe(1);
    res.body.threads.forEach((thread) => {
      expect(thread).toHaveProperty("title");
      expect(thread).toHaveProperty("description");
      expect(thread.topicsCount).toBe(0);
    });
  });

  //   Get all threads in a forum - 2nd page and 4 threads per page
  test("should return 2nd page with 4 threads in the page", async () => {
    const res = await request(app).get("/api/v1/threads/all?page=2&limit=4");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Threads retrieved successfully");
    expect(res.body.count).toBe(4);
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(7);
    expect(res.body.page).toBe(2);
    res.body.threads.forEach((thread) => {
      expect(thread).toHaveProperty("title");
      expect(thread).toHaveProperty("description");
      expect(thread.topicsCount).toBe(0);
    });
  });

  //   Get all threads in a section
  test("should return all threads in a section", async () => {
    const section = await Section.findOne({ title: "Section 1" });
    const res = await request(app).get(`/api/v1/threads/${section._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Threads retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.page).toBe(1);
    res.body.threads.forEach((thread) => {
      expect(thread).toHaveProperty("title");
      expect(thread).toHaveProperty("description");
      expect(thread.topicsCount).toBe(0);
    });
  });

  //   Get all threads in invalid section
  test("should not get result if the section ID is invalid", async () => {
    const invalidSectionId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/api/v1/threads/${invalidSectionId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Section not found");
  });
});
