const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const mongod = new MongoMemoryServer();

const setupMemoryServer = async () => {
	jest.setTimeout(100000);
	const uri = await mongod.getConnectionString();
	await mongoose.connect(uri);
};

const tearDownMemoryServer = () => {
	mongoose.disconnect();
	mongod.stop();
};

module.exports = {
	setupMemoryServer,
	tearDownMemoryServer
};
