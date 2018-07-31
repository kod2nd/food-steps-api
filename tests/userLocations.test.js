const express = require('express');
const request = require('supertest');
const app = express();

const userLocationsRouter = require('../routes/userLocations');
userLocationsRouter(app);

test('GET /user/:id/locations should return proper message from userLocations router', async () => {
    const response = await request(app).get('/user/1/locations');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Hello from userLocations Router!");
});