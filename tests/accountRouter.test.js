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

const getSignupResponse = async user => {
	return await request(app)
		.post("/account/signup")
		.send(user);
};

const signUpMockUser = async mockUser => {
	let res = await getSignupResponse(mockUser);
	return res;
};

const extractJwtFromResponse = response => {
	const cookies = response.headers["set-cookie"];
	if (!cookies) return "";
	return cookies[0].split(";")[0];
};

const mockUserCredentials = {
	username: "123456",
	password: "12345678"
};

const mockUser = {
	...mockUserCredentials,
	email: "123@123.com"
};

it("get /account should return welcome message", async () => {
	const response = await request(app).get("/account");
	expect(response.status).toBe(200);
	expect(response.body.message).toBe("Welcome!");
});

describe("POST /account/signup", () => {
	it("should be able to sign up when valid body is posted and receive jwt in cookies", async () => {
		const newUser = {
			username: "user12",
			password: "12345678",
			email: "abc@abc.com"
		};
		const response = await getSignupResponse(newUser);
		expect(response.status).toBe(201);

		const userCreated = await User.findOne({ username: "user12" });
		expect(userCreated.username).toBe("user12");

		const cookies = response.headers["set-cookie"];
		expect(cookies).toBeDefined();
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
		let response = await getSignupResponse(badUser1);
		expect(response.status).toBe(400);
		response = await getSignupResponse(badUser2);
		expect(response.status).toBe(400);
	});

	it("should not be able to sign up when password is not between 8 to 20 characters", async () => {
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

		let response = await getSignupResponse(badUser1);
		expect(response.status).toBe(400);

		response = await getSignupResponse(badUser2);
		expect(response.status).toBe(400);
	});

	it("should not be able to sign up when username/password/email is not supplied ", async () => {
		const badUser1 = {
			password: "12345678",
			email: "abc@abc.com"
		};

		const badUser2 = {
			username: "janeee",
			email: "abc@abc.com"
		};

		const badUser3 = {
			username: "janeee",
			password: "12345678"
		};

		let response = await getSignupResponse(badUser1);
		expect(response.status).toBe(400);
		response = await getSignupResponse(badUser2);
		expect(response.status).toBe(400);
		response = await getSignupResponse(badUser3);
		expect(response.status).toBe(400);
	});

	describe("POST account/signin", () => {
		it("should successfully sign in and return jwt token in cookie when valid credentials are given", async () => {
			await signUpMockUser(mockUser);

			let response = await request(app)
				.post("/account/signin")
				.send(mockUserCredentials);

			expect(response.status).toBe(200);

			// to find jwt token inside cookies
			const cookies = response.headers["set-cookie"];
			expect(cookies).toBeDefined();
		});

		it("should not sign in if username does not exist", async () => {
			let response = await request(app)
				.post("/account/signin")
				.send(mockUserCredentials);

			expect(response.status).toBe(401);
		});

		it("should not sign in if password is wrong", async () => {
			await signUpMockUser(mockUser);

			let response = await request(app)
				.post("/account/signin")
				.send({
					username: mockUser.username,
					password: "12345677"
				});

			expect(response.status).toBe(401);
		});

		it("should not sign in if username or password is missing", async () => {
			await signUpMockUser(mockUser);

			let response = await request(app)
				.post("/account/signin")
				.send({
					username: mockUser.username
				});

			response = await request(app)
				.post("/account/signin")
				.send({
					password: "12345678"
				});

			expect(response.status).toBe(401);
		});
	});

	describe("POST /account/signout", () => {
		it("should successfully sign out if has signed in previously, and have no cookies stored", async () => {
			let signUpRes = await signUpMockUser(mockUser);
			const jwt = extractJwtFromResponse(signUpRes);
			expect(jwt.length).toBeGreaterThan(4);

			let response = await request(app).post("/account/signout");

			expect(response.status).toBe(200);

			const jwtAfter = extractJwtFromResponse(response);
			expect(jwtAfter.length).toBeLessThanOrEqual(4);
		});

		it("should still pass even if user has not signed in previously", async () => {
			let response = await request(app).post("/account/signout");

			expect(response.status).toBe(200);

			const jwtAfter = extractJwtFromResponse(response);
			expect(jwtAfter.length).toBeLessThanOrEqual(4);
		});
	});
});
