const { MongoClient } = require("mongodb");

const mongoURI = "mongodb://127.0.0.1:27017/data";
const dbName = "data";

async function readDataFromMongo(collectionName) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const data = await collection.find({}).toArray();
    return data;
  } finally {
    client.close();
  }
}

async function writeDataToMongo(collectionName, data) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    await collection.insertMany(data);
  } finally {
    client.close();
  }
}

async function addUserToMongo(user) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("users");
    await collection.insertOne(user);
  } finally {
    client.close();
  }
}

async function updateUserOnMongo(password, base64Photo, user) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("users");
    await collection.updateOne(
      { _id: user._id },
      { $set: { password: password, base64Photo: base64Photo } }
    );
  } finally {
    client.close();
  }
}

async function readMessageOnMongo(message) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("messages");
    await collection.updateOne(
      { _id: message._id },
      { $set: { read: "true" } }
    );
  } finally {
    client.close();
  }
}

async function deleteMessageFromMongo(message) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("messages");
    await collection.deleteOne({ _id: message._id });
  } finally {
    client.close();
  }
}

async function getNextId(collectionName) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const lastIdObject = await collection.findOne({ identifier: "last-id" });
    if (!lastIdObject) {
      const initialLastIdObject = {
        identifier: "last-id",
        user: 1,
        message: 1,
      };
      await collection.insertOne(initialLastIdObject);
      return initialLastIdObject.user;
    }

    const lastId = lastIdObject.user;
    const nextId = lastId + 1;

    await collection.updateOne(
      { identifier: "last-id" },
      { $set: { user: nextId } }
    );

    return nextId;
  } finally {
    client.close();
  }
}

async function getNextUserId() {
  return await getNextId("last-id");
}

async function getNextMessagesId(collectionName) {
  const client = new MongoClient(mongoURI);
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const lastIdObject = await collection.findOne({ identifier: "last-id" });
    if (!lastIdObject) {
      const initialLastIdObject = {
        identifier: "last-id",
        user: 1,
        message: 1,
      };
      await collection.insertOne(initialLastIdObject);
      return initialLastIdObject.message;
    }

    const lastId = lastIdObject.message;
    const nextId = lastId + 1;

    await collection.updateOne(
      { identifier: "last-id" },
      { $set: { message: nextId } }
    );

    return nextId;
  } finally {
    client.close();
  }
}

async function getNextMessageId() {
  return await getNextMessagesId("last-id");
}

module.exports = {
  readDataFromMongo,
  writeDataToMongo,
  getNextId,
  getNextUserId,
  addUserToMongo,
  getNextMessageId,
  updateUserOnMongo,
  readMessageOnMongo,
  deleteMessageFromMongo,
};
