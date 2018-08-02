const app = require("../app");
const request = require("supertest");

const User = require("../models/User");
const UserLocation = require("../models/UserLocation");
const GlobalLocation = require("../models/GlobalLocation");
const {
  setupMemoryServer,
  tearDownMemoryServer,
  resetMemoryServer
} = require("../utils/testUtils");

// To Move to testUtils later
const signupUserAndReturnSavedId = async (username, password) => {
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

const inputTestLocation = (lat, lng) => {
  return {
    lat,
    lng,
    geocodedLocationName: "Test Location",
    locationName: "User Given name for Test Location"
  };
};

const inputTestPublicLocation = (lat, lng) => {
  const privatelocation = inputTestLocation(lat, lng);
  return { ...privatelocation, isPublic: true };
};

const location1 = {
  lat: 1.2828,
  lng: 103.8304
};
const location2 = {
  lat: 1.3112,
  lng: 103.795
};
const addLocationForUser = async (userId, location) => {
  await request(app)
    .post(`/locations/user/${userId}`)
    .send(inputTestLocation(location.lat, location.lng));
};

beforeAll(setupMemoryServer);
afterAll(tearDownMemoryServer);

let userId;

beforeEach(async () => {
  resetMemoryServer();
  userId = await signupUserAndReturnSavedId("testUser", "12345678");
});

test("GET /locations/user/:id should return an array of 2 location objects when the total number of existing userLocations for a particular user is 2", async () => {
  await addLocationForUser(userId, location1);
  await addLocationForUser(userId, { lat: 100, lng: 1.0242 });

  const response = await request(app).get(`/locations/user/${userId}`);
  expect(response.status).toBe(200);
  expect(response.body.length).toEqual(2);
});

test("POST /locations/user/:id for new global location should create both userLocation and globalLocation ", async () => {
  const response = await request(app)
    .post(`/locations/user/${userId}`)
    .send(inputTestLocation(location1.lat, location1.lng));
  expect(response.status).toBe(201);
  expect(response.body.message).toEqual("Location created");

  const userLocations = await UserLocation.find({ userId: userId });
  expect(userLocations.length).toBe(1);

  const globalLocation = await GlobalLocation.findById(
    userLocations[0].globalLocation
  );
  expect(globalLocation.geocodedLocationName).toBeDefined();
});

test('POST /locations/user/:id should create a user location with isPublic defaulted to "false" if it is not supplied in the request body', async () => {
  const response = await request(app)
    .post(`/locations/user/${userId}`)
    .send(inputTestLocation(location1.lat, location1.lng));
  expect(response.status).toBe(201);
  expect(response.body.message).toEqual("Location created");

  const userLocations = await UserLocation.findOne({ userId: userId });
  expect(userLocations.isPublic).toBe(false);
});

test("POST /locations/user/:id if user flags isPublic to be true", async () => {
  const response = await request(app)
    .post(`/locations/user/${userId}`)
    .send(inputTestPublicLocation(location1.lat, location1.lng));
  expect(response.status).toBe(201);
  expect(response.body.message).toEqual("Location created");

  const userLocations = await UserLocation.findOne({ userId: userId });
  expect(userLocations.isPublic).toBe(true);
});

test("POST /locations/user/:id Should not add to globalLocation if, the global location already contains the same location1.lat and location1.lng.", async () => {
  const lat = location1.lat;
  const lng = location1.lng;

  const anotherUserId = await signupUserAndReturnSavedId(
    "differentUser",
    "12345678"
  );
  await addLocationForUser(anotherUserId, location1);

  await request(app)
    .post(`/locations/user/${userId}`)
    .send(inputTestPublicLocation(lat, lng));

  const globalLocation = await GlobalLocation.find({ lat, lng });
  expect(globalLocation.length).toEqual(1);
});

test("POST /locations/user/:id should add to globalLocation if the global location does not contain the same location", async () => {
  await addLocationForUser(userId, location1);

  await addLocationForUser(userId, location2);

  const globalLocation = await GlobalLocation.find();
  expect(globalLocation.length).toEqual(2);
  expect(globalLocation).toContainEqual(expect.objectContaining(location1));
  expect(globalLocation).toContainEqual(expect.objectContaining(location2));
});

test("POST /locations/user/:id should not add to a new UserLocation if user already has an existing location entry", async () => {
  await addLocationForUser(userId, location1);
  const lat = location1.lat;
  const lng = location1.lng;

  const response = await request(app)
    .post(`/locations/user/${userId}`)
    .send(inputTestPublicLocation(lat, lng));
  expect(response.status).toBe(400);

  const userLocation = await UserLocation.find({ userId }).populate(
    "globalLocation"
  );
  expect(userLocation.length).toEqual(1);
});
