const app = require('../app')
const request = require('supertest');

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

// Need to place these helper functions into a different file
const inputTestLocation = (lat, lng) => {
    return {
        lat,
        lng,
        geocodedLocationName: "Test Location",
        locationName: "User Given name for Test Location"
    }
}

const inputTestPublicLocation = (lat, lng) => {
    const privatelocation = inputTestLocation(lat, lng)
    return { ...privatelocation, isPublic: true }
}

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

    const response = await request(app).post(`/locations/user/${userId}`).send(inputTestPublicLocation(1.2828, 103.8304));
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Location created');

    const userLocations = await UserLocation.find({ userId: userId });
    expect(userLocations.length).toBe(1);

    const globalLocation = await GlobalLocation.findById(userLocations[0].globalLocation);
    expect(globalLocation.geocodedLocationName).toBeDefined();
});

test('POST /locations/user/:id for newly created userLocation should have isPublic set as "false" by default if isPublic is not supplied in POST request', async () => {

    const response = await request(app).post(`/locations/user/${userId}`).send(inputTestLocation(1.2828, 103.8304));
    expect(response.status).toBe(200);
    expect(response.body.message).toEqual('Location created');

    const userLocations = await UserLocation.find({ userId: userId });
    expect(userLocations[0].isPublic).toBe(false);
});