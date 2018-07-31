const app = require("../app");
const User = require ("../models/User");
const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();

beforeAll(async () => {
    jest.setTimeout(100000);
  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri);
})

afterAll(() => {
    mongoose.disconnect();
    mongod.stop();
  });

it("get /account should return welcome message", async () => {
  const response = await request(app).get("/account");
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Welcome!");
});


test.only("post /account/signup should be able to sign up ", async () => {
  const newUser = {
    username: "user12",
    password: "123456",
    email: "abc@abc.com"
  };
  const response = await request(app)
    .post("/account/signup")
    .send(newUser);
  expect(response.status).toBe(201)
  const userCreated = await User.findOne({username:"user12"});
  expect(userCreated.username).toBe("user12")
});
