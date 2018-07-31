const app = require("../app");
const User = require("../models/User");
const request = require("supertest");
const {
  setupMemoryServer,
  tearDownMemoryServer,
  resetMemoryServer
} = require("../utils/testUtils");

beforeAll(setupMemoryServer);
afterAll(tearDownMemoryServer);
beforeEach(resetMemoryServer);

it("get /account should return welcome message", async () => {
  const response = await request(app).get("/account");
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Welcome!");
});

describe("POST /account/signup", () => {
  it("should be able to sign up when valid body is posted", async () => {
    const newUser = {
      username: "user12",
      password: "123456",
      email: "abc@abc.com"
    };
    const response = await request(app)
      .post("/account/signup")
      .send(newUser);
    expect(response.status).toBe(201);
    const userCreated = await User.findOne({ username: "user12" });
    expect(userCreated.username).toBe("user12");
  });

  it("should not be able to sign up when username is not between 6 to 20 characters", async () => {
    const badUser1 = {
      // username less than 6 characters
      username: "user",
      password: "123456",
      email: "abc@abc.com"
    };

    const badUser2 = {
      // username more than 20 characters
      username: "123456789012345678901",
      password: "123456",
      email: "abc@abc.com"
    };

    let response = await request(app)
      .post("/account/signup")
      .send(badUser1);
    expect(response.status).toBe(400);

    response = await request(app)
      .post("/account/signup")
      .send(badUser2);
    expect(response.status).toBe(400);
  });

  it.only("should not be able to sign up when password is not between 8 to 20 characters", async () => {
    const badUser1 = {
      // password less than 8 characters
      username: "mayuri",
      password: "123456",
      email: "abc@abc.com"
    };

    const badUser2 = {
      // password more than 20 characters
      username: "janeee",
      password: "1234567891012345678901",
      email: "abc@abc.com"
    };

    let response = await request(app)
      .post("/account/signup")
      .send(badUser1);
    expect(response.status).toBe(400);

    response = await request(app)
      .post("/account/signup")
      .send(badUser2);
    expect(response.status).toBe(400);
  });
  
});
