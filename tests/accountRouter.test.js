const app = require("../app");
const request = require("supertest");

it("get /account should return welcome message", async () => {
	const response = await request(app).get('/account')
    expect(response.status).toBe(200)
    expect(response.body.message).toBe("Welcome!")
});
