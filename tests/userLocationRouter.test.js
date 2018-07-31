const app = require('../app')
const request = require('supertest');

const { MongoMemoryServer } = require('mongodb-memory-server')
const mongod = new MongoMemoryServer();
const mongoose = require('mongoose')

const User = require('../models/User');
const UserLocation = require('../models/UserLocation');
const GlobalLocation = require('../models/GlobalLocation');
const { setupMemoryServer, tearDownMemoryServer, resetMemoryServer } = require("../utils/testUtils");


// Move createUser to testUtils later
const createUser = async (username, password) => {
    const newUser = {
        username,
        password,
        email: "abc@abc.com"
    };
    const response = await request(app)
        .post("/account/signup")
        .send(newUser);
    expect(response.status).toBe(201);
    const userCreated = await User.findOne({ username });
    return userCreated._id;
};

beforeAll(setupMemoryServer);
afterAll(tearDownMemoryServer);

let userId;

beforeEach(async () => {
    resetMemoryServer()
    userId = await createUser("testUser", "12345678");

});

test('GET /locations/user/:id should return proper message from userLocations router', async () => {
    const response = await request(app).get('/locations/user/1');
    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Hello from userLocations Router!");
});

test('POST /locations/user/:id for new global location should create both userLocation and globalLocation ', async () => {

    const response = await request(app).post(`/locations/user/${userId}`).send({
        lat: 1.2828,
        lng: 103.8304,
        geocodedLocationName: "Test Location",
        isPublic: true,
        locationName: "User Given name for Test Location"
    });
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Location created');

    const userLocations = await UserLocation.find({ userId: userId });
    expect(userLocations.length).toBe(1);
    
    const globalLocation = await GlobalLocation.findById(userLocations[0].globalLocation);
    expect(globalLocation.geocodedLocationName).toBeDefined();
});