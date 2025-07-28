import app from "../src/server.js";
import request from "supertest";
import connectDB from "../src/config/db.js";
import mongoose from "mongoose";
import Section from "../src/models/section.model.js";
import { slugify } from "../src/utils/slugify.js";

describe("Section user actions", () => {
  beforeAll(async () => {
    await connectDB();

    const sections = [];
    for (let i = 0; i < 25; i++) {
      const title = `Section_${i}`;
      const slug = slugify(title);

      sections.push({ title, slug });
    }
    await Section.insertMany(sections);
  });

  afterAll(async () => {
    await Section.deleteMany({});
    await mongoose.connection.close();
  });

  //   Get all sections - should give the first page
  test("should return all sections, default page (1) and default limit (10)", async () => {
    const res = await request(app).get("/api/v1/sections");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Sections retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.sections).toHaveLength(10);
    expect(res.body.sections[0]).toHaveProperty("slug");
    expect(res.body.sections[0]).toHaveProperty("order");
    expect(res.body.sections[0]).toHaveProperty("description");
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.page).toBe(1);
  });

  //   Get all sections on page 2
  test("should return page 2 with sections and default limit of 10", async () => {
    const res = await request(app).get("/api/v1/sections?page=2");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Sections retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.sections).toHaveLength(10);
    expect(res.body.sections[0]).toHaveProperty("slug");
    expect(res.body.sections[0]).toHaveProperty("order");
    expect(res.body.sections[0]).toHaveProperty("description");
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.page).toBe(2);
  });

  //   Get only 5 sections per page and get the third page
  test("should return third page with sections, but with limit of 5 per page", async () => {
    const res = await request(app).get("/api/v1/sections?limit=5&page=3");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Sections retrieved successfully");
    expect(res.body.count).toBe(5);
    expect(res.body.sections).toHaveLength(5);
    expect(res.body.sections[0]).toHaveProperty("slug");
    expect(res.body.sections[0]).toHaveProperty("order");
    expect(res.body.sections[0]).toHaveProperty("description");
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(5);
    expect(res.body.page).toBe(3);
  });

  //   Get only sections that contain "1" in the title - search query validation
  test("should return all the sections that contain 3 in the title (should be 3 of them - 3, 13 and 23", async () => {
    const res = await request(app).get("/api/v1/sections?q=3");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Sections retrieved successfully");
    expect(res.body.count).toBe(3);
    expect(res.body.sections).toHaveLength(3);
    expect(res.body.sections[0]).toHaveProperty("slug");
    expect(res.body.sections[0]).toHaveProperty("order");
    expect(res.body.sections[0]).toHaveProperty("description");
    res.body.sections.forEach((section) => {
      expect(section.title.includes("3")).toBe(true);
    });
    expect(res.body.total).toBe(3);
    expect(res.body.totalPages).toBe(1);
    expect(res.body.page).toBe(1);
  });

  //   Get single section by id
  test("should return a single section by id", async () => {
    const title = "New section";
    const slug = slugify(title);
    const id = new mongoose.Types.ObjectId();
    await Section.create({ title, slug, _id: id });

    const res = await request(app).get(`/api/v1/sections/${id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Section retrieved successfully");
    expect(res.body.section).toHaveProperty("title");
    expect(res.body.section).toHaveProperty("description");
    expect(res.body.section).toHaveProperty("title");
    expect(res.body.section).toHaveProperty("slug");
  });

  //   Get single section validation with invalid ID
  test("should not return a single section by id if id does not exist", async () => {
    const res = await request(app).get(`/api/v1/sections/123`);

    expect(res.statusCode).toBe(400);
    expect(res.body.errors.sectionId).toBe("Invalid section ID");
  });
});
