const app = require('../app')
const request = require('supertest');

test('GET /user/:id/locations should return proper message from userLocations router', async () => {
    const response = await request(app).get('/user/1/locations');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Hello from userLocations Router!");
});