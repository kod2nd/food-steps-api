const app = require("../app");
const User = require("../models/User");
const request = require("supertest");
const {
	setupMemoryServer,
	tearDownMemoryServer
} = require("../utils/testUtils");

beforeAll(setupMemoryServer);
afterAll(tearDownMemoryServer);

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
	expect(response.status).toBe(201);
	const userCreated = await User.findOne({ username: "user12" });
	expect(userCreated.username).toBe("user12");
});
