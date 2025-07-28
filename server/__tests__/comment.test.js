import app from "../src/server.js";
import request from "supertest";
import connectDB from "../src/config/db.js";
import mongoose, { mongo } from "mongoose";
import Comment from "../src/models/comment.model.js";
import Topic from "../src/models/topic.model.js";
import Thread from "../src/models/thread.model.js";
import Section from "../src/models/section.model.js";
import User from "../src/models/user.model.js";
import { slugify } from "../src/utils/slugify.js";

describe("Comment user actions", () => {
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

    const topicTitle = "Topic example";
    const topicContent = "Topic content";
    const topicSlug = slugify(topicTitle);
    const topic = await Topic.create({
      title: topicTitle,
      content: topicContent,
      slug: topicSlug,
      author: user._id,
      thread,
    });

    for (let i = 0; i < 25; i++) {
      let commentContent = `Comment_content${i}`;
      await Comment.create({
        content: commentContent,
        topic,
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
    await Comment.deleteMany();
    await Topic.deleteMany();
    await Thread.deleteMany();
    await Section.deleteMany();
    await User.deleteMany();
    await mongoose.connection.close();
  });

  // Get all comments from a topic - default, 10 per page
  test("should return all comments from a single topic", async () => {
    const topic = await Topic.findOne({ title: "Topic example" }).select("_id");
    const topicId = topic._id.toString();

    const res = await request(app).get(`/api/v1/comments/topic/${topicId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Comments retrieved successfully");
    expect(res.body.count).toBe(10);
    expect(res.body.total).toBe(25);
    expect(res.body.totalPages).toBe(3);
    expect(res.body.page).toBe(1);
    res.body.comments.forEach((comment) => {
      expect(comment).toHaveProperty("content");
      expect(comment.content).not.toBe("");
    });
  });

  // Get all comments from a topic validation - invalid topic ID
  test("should not return comments from a non existing topic", async () => {
    const invalidTopicId = new mongoose.Types.ObjectId();

    const res = await request(app).get(
      `/api/v1/comments/topic/${invalidTopicId}`
    );

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Topic not found");
  });

  // Get a single comment by ID
  test("should return a single comment by id", async () => {
    const topic = await Topic.findOne({ title: "Topic example" }).select("_id");
    const topicId = topic._id.toString();
    const user = await User.findOne({ email: "user@mail.com" }).select("_id");
    const userId = user._id.toString();
    const comment = await Comment.create({
      content: "Just a comment",
      topic: topicId,
      author: userId,
    });

    const res = await request(app).get(`/api/v1/comments/${comment._id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Comment retrieved successfully");
    expect(res.body.comment).toHaveProperty("content");
    expect(res.body.comment.content).not.toBe("");
  });

  // Get a single comment by ID validation - invalid ID
  test("should not return a single comment if ID is invalid", async () => {
    const invalidCommentId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/v1/comments/${invalidCommentId}`);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Comment not found");
  });

  // Update comment
  test("should update a comment if user is the author", async () => {
    const comment = await Comment.findOne({
      content: "Comment_content1",
    }).select("_id");
    const commentId = comment._id.toString();

    const res = await request(app)
      .patch(`/api/v1/comments/${commentId}`)
      .send({ content: "New comment content" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Comment updated successfully");
    expect(res.body.comment.content).toBe("New comment content");
  });

  // Update comment validation - invalid comment ID
  test("should not update non existing comment", async () => {
    const invalidCommentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .patch(`/api/v1/comments/${invalidCommentId}`)
      .send({ content: "New content" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Comment not found");
  });

  // Update comment without content validation
  test("should not update comment if new content is an empty string", async () => {
    const comment = await Comment.findOne({
      content: "Comment_content2",
    }).select("_id");
    const commentId = comment._id.toString();

    const res = await request(app)
      .patch(`/api/v1/comments/${commentId}`)
      .send({ content: "" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Comment content is required");
  });

  // Trying to update comment of another author
  test("should not update comment of another author", async () => {
    await User.create({
      email: "newuser@email.com",
      username: "newuser",
      password: "newuser1234",
    });

    const newUserRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "newuser@email.com", password: "newuser1234" });
    cookies = newUserRes.headers["set-cookie"];

    const comment = await Comment.findOne({
      content: "Comment_content3",
    }).select("_id");
    const commentId = comment._id.toString();

    const res = await request(app)
      .patch(`/api/v1/comments/${commentId}`)
      .send({ content: "New comment content" })
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "You are not authorized to update this comment"
    );
  });

  // Delete a comment
  test("should delete a comment if user is the author", async () => {
    const comment = await Comment.findOne({
      content: "Comment_content4",
    }).select("_id");
    const commentId = comment._id.toString();

    const res = await request(app)
      .delete(`/api/v1/comments/${commentId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Comment deleted successfully");
  });

  // Delete comment validation - invalid comment ID
  test("should not update non existing comment", async () => {
    const invalidCommentId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/v1/comments/${invalidCommentId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("Comment not found");
  });

  // Trying to delete a comment of another author
  test("should not delete comment of another author", async () => {
    await User.create({
      email: "newuser2@email.com",
      username: "newuser2",
      password: "newuser21234",
    });

    const newUser2Res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "newuser2@email.com", password: "newuser21234" });
    cookies = newUser2Res.headers["set-cookie"];

    const comment = await Comment.findOne({
      content: "Comment_content5",
    }).select("_id");
    const commentId = comment._id.toString();

    const res = await request(app)
      .delete(`/api/v1/comments/${commentId}`)
      .set("Cookie", cookies);

    expect(res.statusCode).toBe(403);
    expect(res.body.message).toBe(
      "You are not authorized to delete this comment"
    );
  });
});
