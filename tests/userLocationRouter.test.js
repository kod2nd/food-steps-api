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
const testUser = {
  username: "testUser",
  password: "12345678",
  email: "abc@abc.com"
};

const userLocationUpdate = {
  locationName: "updated name",
  userRating: 5,
  userFeedback: "updated food is good!"
}

const signupUserAndReturnSavedId = async user => {
  const response = await request(app)
    .post("/account/signup")
    .send(user);
  expect(response.status).toBe(201);

  const { username } = user;
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

const addLocationForUser = async (agent, location, isPublic = false) => {
  const requestBody = isPublic
    ? inputTestPublicLocation(location.lat, location.lng)
    : inputTestLocation(location.lat, location.lng);

  return await agent.post(`/locations/user`).send(requestBody);
};

const findLocationToUpdate = async (userId) => {
  const userLocation = await UserLocation.find({ userId })
  return userLocation[0]
}


beforeAll(setupMemoryServer);
afterAll(tearDownMemoryServer);

let userId;

beforeEach(async () => {
  resetMemoryServer();
  userId = await signupUserAndReturnSavedId(testUser);
});

describe('GET /locations/user/', () => {
  test("should return an array of 2 location objects when the total number of existing userLocations for a particular user is 2. User should be authorised to access the route", async () => {
    const agent = request.agent(app);
    await agent.post("/account/signin").send(testUser);
    await addLocationForUser(agent, location1);
    await addLocationForUser(agent, { lat: 100, lng: 1.0242 });

    const response = await agent.get(`/locations/user/`);
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(2);
  });

  test('should not be accessable to a user, if that use is not logged in. Return status 401. ', async () => {
    const response = await request(app).get(`/locations/user/`)
    expect(response.status).toBe(401)
  });
});

describe("POST /locations/user/:id", () => {
  describe("when the user is not logged in", () => {
    it("responds with a 401 status", async () => {
      const response = await addLocationForUser(request(app), location1);
      expect(response.status).toBe(401);
    });

    it("does not create the location", async () => {
      await addLocationForUser(request(app), location1);

      const userLocations = await UserLocation.find();
      expect(userLocations).toHaveLength(0);

      const globalLocations = await GlobalLocation.find();
      expect(globalLocations).toHaveLength(0);
    });
  });

  describe("when the user is logged in", () => {
    const agent = request.agent(app);

    beforeEach(async () => {
      await agent.post("/account/signin").send(testUser);
    });

    it("should create both userLocation and globalLocation for the signed in user", async () => {
      const response = await addLocationForUser(agent, location1);

      expect(response.status).toBe(201);
      expect(response.body.message).toEqual("Location created");

      const userLocations = await UserLocation.find({ userId: userId });
      expect(userLocations.length).toBe(1);

      const globalLocation = await GlobalLocation.findById(
        userLocations[0].globalLocation
      );
      expect(globalLocation.geocodedLocationName).toBeDefined();
    });

    it('should create a user location with isPublic defaulted to "false" if it is not supplied in the request body', async () => {
      const response = await addLocationForUser(agent, location1);
      expect(response.status).toBe(201);
      expect(response.body.message).toEqual("Location created");

      const userLocations = await UserLocation.findOne({ userId: userId });
      expect(userLocations.isPublic).toBe(false);
    });

    it("creates a location when user flags isPublic to be true", async () => {
      const response = await addLocationForUser(agent, location1, true);
      expect(response.status).toBe(201);
      expect(response.body.message).toEqual("Location created");

      const userLocations = await UserLocation.findOne({ userId: userId });
      expect(userLocations.isPublic).toBe(true);
    });

    it("should not add to globalLocation if another user has added the same location", async () => {
      const anotherUser = {
        username: "differentUser",
        password: "12345678",
        email: "someone@example.com"
      };
      const anotherUserId = await signupUserAndReturnSavedId(anotherUser);
      const anotherUserAgent = request.agent(app);
      await anotherUserAgent.post("/account/signin").send(anotherUser);
      await addLocationForUser(anotherUserAgent, location1);

      const { lat, lng } = location1;
      await addLocationForUser(agent, location1);

      const globalLocation = await GlobalLocation.find({ lat, lng });
      expect(globalLocation.length).toEqual(1);
    });

    it("should add to globalLocation if the global location does not contain the same location", async () => {
      await addLocationForUser(agent, location1);

      await addLocationForUser(agent, location2);

      const globalLocation = await GlobalLocation.find();
      expect(globalLocation.length).toEqual(2);
      expect(globalLocation).toContainEqual(expect.objectContaining(location1));
      expect(globalLocation).toContainEqual(expect.objectContaining(location2));
    });

    it("should not add to a new UserLocation if user already has an existing location entry", async () => {
      await addLocationForUser(agent, location1);

      const response = await addLocationForUser(agent, location1, true);
      expect(response.status).toBe(400);

      const userLocation = await UserLocation.find({ userId }).populate(
        "globalLocation"
      );
      expect(userLocation.length).toEqual(1);
    });
  });

  describe("PUT/locations/user/:id", () => {
    // Feels like this agent and beforeEach is repeated. Should refactor.
    const agent = request.agent(app);

    beforeEach(async () => {
      await agent.post("/account/signin").send(testUser);
      await agent.post("/account/signin").send(testUser);
      await addLocationForUser(agent, location1);
    });

    it('should update a user location based on the request body', async () => {
      const locationToUpdate = await findLocationToUpdate(userId)

      const response = await agent.put(`/locations/user/${locationToUpdate._id}`).send(userLocationUpdate)
      expect(response.status).toBe(200)

      const updatedUserLocation = await UserLocation.findById(locationToUpdate._id)

      expect(updatedUserLocation.locationName).toBe(userLocationUpdate.locationName)
      expect(updatedUserLocation.userRating).toEqual(userLocationUpdate.userRating)
      expect(updatedUserLocation.userFeedback).toContain(userLocationUpdate.userFeedback)
    });
    test('should not be accessable to a user, if that use is not logged in. Return status 401. ', async () => {
      const locationToUpdate = await findLocationToUpdate(userId)
      const response = await request(app).put(`/locations/user/${locationToUpdate._id}`)
      expect(response.status).toBe(401)
    });
  })

  describe("when data is not valid", () => {
    const agent = request.agent(app);

    beforeEach(async () => {
      await agent.post("/account/signin").send(testUser);
    });

    it("should respond with a Bad Request status", async () => {
      const response = await addLocationForUser(agent, {
        lng: 103.123,
        geocodedLocationName: "Test Location",
        locationName: "User Given name for Test Location"
      });
      expect(response.status).toBe(400);
    });
  });
});
