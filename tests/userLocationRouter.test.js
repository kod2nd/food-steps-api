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

// Test Data Setup
const testUser = {
  username: "testUser",
  password: "12345678",
  email: "abc@abc.com"
};

const anotherUser = {
  username: "anotherUser",
  password: "12345678",
  email: "someone@example.com"
};

const location1 = {
  lat: 1.2828,
  lng: 103.8304
};

const location2 = {
  lat: 100,
  lng: 1.0242
};

const userLocationUpdate = {
  locationName: "updated name"
};

// Test Support Methods
const signupUserAndReturnSavedUserId = async user => {
  const response = await request(app)
    .post("/account/signup")
    .send(user);
  expect(response.status).toBe(201);
  
  const { username } = user;
  const userCreated = await User.findOne({ username });
  return userCreated._id;
};

const getAgentForAnotherUser = async () => {
  await signupUserAndReturnSavedUserId(anotherUser);
  
  const anotherUserAgent = request.agent(app);
  const response = await anotherUserAgent.post("/account/signin").send(anotherUser);
  expect(response.status).toBe(200);

  return anotherUserAgent;
};

const inputTestLocation = (lat, lng) => {
  return {
    lat,
    lng,
    geocodedLocationName: "Geocoded Test Location",
    locationName: "User Given Name for Test Location"
  };
};

const inputTestPublicLocation = (lat, lng) => {
  const privatelocation = inputTestLocation(lat, lng);
  return { ...privatelocation, isPublic: true };
};

const addLocationForUser = async (agent, location, isPublic = false) => {
  const requestBody = isPublic
    ? inputTestPublicLocation(location.lat, location.lng)
    : inputTestLocation(location.lat, location.lng);

  return await agent.post(`/locations/user`).send(requestBody);
};

beforeAll(setupMemoryServer);
afterAll(tearDownMemoryServer);

// placeholder to store userId for testUser for each test case
let userId;

beforeEach(async () => {
  resetMemoryServer();
  userId = await signupUserAndReturnSavedUserId(testUser);
});

describe("GET /locations/user/", () => {
  it("should return an array of 2 location objects for a logged-in user with 2 existing userLocations", async () => {
    const agent = request.agent(app);
    await agent.post("/account/signin").send(testUser);
    await addLocationForUser(agent, location1);
    await addLocationForUser(agent, location2);

    const response = await agent.get(`/locations/user/`);
    expect(response.status).toBe(200);
    expect(response.body.length).toEqual(2);
  });

  it("should return 401 when user is not logged in", async () => {
    const response = await request(app).get(`/locations/user/`);
    expect(response.status).toBe(401);
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

      const userLocations = await UserLocation.find({ userId });
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

      const userLocation = await UserLocation.findOne({ userId });
      expect(userLocation.isPublic).toBe(false);
    });

    it("creates a location when user flags isPublic to be true", async () => {
      const response = await addLocationForUser(agent, location1, true);
      expect(response.status).toBe(201);
      expect(response.body.message).toEqual("Location created");

      const userLocation = await UserLocation.findOne({ userId });
      expect(userLocation.isPublic).toBe(true);
    });

    it("should not add to globalLocation if another user has added the same location", async () => {
      const { lat, lng } = location1;
      await addLocationForUser(agent, location1);

      const anotherUserAgent = await getAgentForAnotherUser();
      await addLocationForUser(anotherUserAgent, location1);

      const globalLocation = await GlobalLocation.find({ lat, lng });
      expect(globalLocation.length).toEqual(1);
    });

    it("should add to globalLocation if the global location does not contain the same location", async () => {
      await addLocationForUser(agent, location1);
      await addLocationForUser(agent, location2);

      const globalLocations = await GlobalLocation.find();
      expect(globalLocations.length).toEqual(2);
      expect(globalLocations).toContainEqual(
        expect.objectContaining(location1)
      );
      expect(globalLocations).toContainEqual(
        expect.objectContaining(location2)
      );
    });

    it("should not add to a new UserLocation if user already has an existing location entry", async () => {
      await addLocationForUser(agent, location1);

      const response = await addLocationForUser(agent, location1, true);
      expect(response.status).toBe(400);

      const userLocations = await UserLocation.find({ userId }).populate(
        "globalLocation"
      );
      expect(userLocations.length).toEqual(1);
    });
  });

  describe("when data is not valid", () => {
    const agent = request.agent(app);

    beforeEach(async () => {
      await agent.post("/account/signin").send(testUser);
    });

    it("should respond with a Bad Request status", async () => {
      const response = await addLocationForUser(agent, {
        lng: 103.123,
        geocodedLocationName: "Geocoded Test Location w/o lat",
        locationName: "User Given Name for Test Location w/o lat"
      });
      expect(response.status).toBe(400);
    });
  });
});

describe("PUT /locations/user/:id", () => {
  // Feels like this agent and beforeEach is repeated. Should refactor.
  const agent = request.agent(app);
  let locationIdToUpdate = '';
  
  beforeEach(async () => {
    await agent.post("/account/signin").send(testUser);
    await addLocationForUser(agent, location1);
    
    const userLocation = await UserLocation.find({ userId });
    locationIdToUpdate = userLocation[0]._id;
  });

  it("should update a user location based on the request body", async () => {
    const response = await agent
      .put(`/locations/user/${locationIdToUpdate}`)
      .send(userLocationUpdate);
    expect(response.status).toBe(200);

    const updatedUserLocation = await UserLocation.findById(locationIdToUpdate);

    expect(updatedUserLocation.locationName).toBe(
      userLocationUpdate.locationName
    );

  });

  it("should return 401 when user is not logged in", async () => {
    const response = await request(app).put(
      `/locations/user/${locationIdToUpdate}`
    );
    expect(response.status).toBe(401);
  });
});

describe("/Delete Should delete userlocation", () => {
  const agent = request.agent(app);
  let userLocationId = "";

  beforeEach(async () => {
    await agent.post("/account/signin").send(testUser);

    const response = await addLocationForUser(agent, location1);
    expect(response.status).toBe(201);

    const userLocation = await UserLocation.findOne({ userId });
    expect(userLocation).toBeDefined();
    userLocationId = userLocation._id;
  });

  describe("when the user is not logged in", () => {
    it("responds with a 401 status", async () => {
      const response = await request(app).delete(
        `/locations/user/${userLocationId}`
      );
      expect(response.status).toBe(401);
    });

    it("does not delete the location", async () => {
      await request(app).delete(`/locations/user/${userLocationId}`);

      const userLocations = await UserLocation.find();
      expect(userLocations).toHaveLength(1);
    });
  });

  describe("when user is logged in", () => {
    it("should delete the user location by userLocationId", async () => {
      const response = await agent.delete(`/locations/user/${userLocationId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Successful Delete");

      const userLocations = await UserLocation.find({ userId: userId });
      expect(userLocations.length).toBe(0);
    });

    it("should NOT delete the user location if id passed-in is non-existing userLocationId", async () => {
      const response = await agent.delete(`/locations/user/${userId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Userlocation not found");

      const userLocations = await UserLocation.find({ userId });
      expect(userLocations.length).toBe(1);
    });

    it("should NOT delete the user location belongs to other user", async () => {
      const anotherUserAgent = await getAgentForAnotherUser();

      const response = await anotherUserAgent.delete(
        `/locations/user/${userLocationId}`
      );
      expect(response.status).toBe(404);

      const userLocations = await UserLocation.find({ userId });
      expect(userLocations.length).toBe(1);
    });
  });
});
