const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const http = require("http");
const WebSocket = require("ws");
const mongoose = require("mongoose");
const {
  readDataFromMongo,
  addUserToMongo,
  writeDataToMongo,
  getNextUserId,
  getNextMessageId,
  updateUserOnMongo,
  readMessageOnMongo,
  deleteMessageFromMongo,
} = require("./data-manager.js");

const JWT_SECRET_KEY = "contact-form-manager-server-secret-key";
const mongoURI = "mongodb://127.0.0.1:27017/data";
const dbName = "data";

const app = express();
app.use(cors());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb" }));
const port = 5165;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: dbName,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

app.get("/", (req, res) => {
  res.status(200).send("Hello, World!");
});

app.get("/api/greeting", (req, res) => {
  const name = req.query.name || "Anonymous";
  res.status(200).send(`Hello, ${name}!`);
});

app.post("/api/message", express.json(), (req, res) => {
  const message = req.body.message || "No message provided";
  res.status(200).send(`Your message: ${message}`);
});

async function checkTokenAndRole(req, res, roleList) {
  const { token } = req.headers;
  if (!token) {
    res.status(401).send({ error: "User is not authenticated" });
    return false;
  }
  try {
    const jwtTokenPayload = jwt.verify(token, JWT_SECRET_KEY);
    const blacklistedTokens = await readDataFromMongo("blacklisted-tokens");
    if (blacklistedTokens.includes(token)) {
      res.status(401).send({ error: "User is not authenticated" });
      return false;
    }
    const currentUsers = await readDataFromMongo("users");
    const existingUser = currentUsers.find(
      (user) => user.id == jwtTokenPayload.userId
    );
    if (!existingUser) {
      res.status(401).send({ error: "User is not authenticated" });
      return false;
    }
    if (
      roleList &&
      roleList.length > 0 &&
      !roleList.includes(existingUser.role)
    ) {
      res.status(403).send({ error: "User is not authorized" });
      return false;
    }
  } catch (err) {
    res.status(401).send({ error: "User is not authenticated" });
    return false;
  }
  return true;
}

// POST login user
app.post("/api/user/login", express.json(), async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    res.status(400).send({ error: "Username is required" });
    return;
  }
  if (!password) {
    res.status(400).send({ error: "Password is required" });
    return;
  }
  const currentUsers = await readDataFromMongo("users");
  const existingUser = currentUsers.find((user) => user.username === username);
  if (!existingUser) {
    res.status(400).send({ error: "Username does not exist" });
    return;
  }
  if (existingUser.password !== password) {
    res.status(400).send({ error: "Password is incorrect" });
    return;
  }
  const jwtTokenPayload = {
    userId: existingUser.id,
    username: existingUser.username,
  };
  const jwtToken = jwt.sign(jwtTokenPayload, JWT_SECRET_KEY, {
    expiresIn: "1h",
  });
  res.status(200).send({ data: { user: existingUser, token: jwtToken } });
});

// POST check if user is logged in
app.post("/api/user/check-login", express.json(), async (req, res) => {
  const { token } = req.headers;
  if (!token) {
    res.status(401).send({ error: "Token is required" });
    return;
  }
  try {
    const jwtTokenPayload = jwt.verify(token, JWT_SECRET_KEY);
    const blacklistedTokens = await readDataFromMongo("blacklisted-tokens");
    if (blacklistedTokens.includes(token)) {
      res.status(401).send({ error: "Token is invalid" });
      return;
    }
    const currentUsers = await readDataFromMongo("users");
    const existingUser = currentUsers.find(
      (user) => user.id == jwtTokenPayload.userId
    );
    if (!existingUser) {
      res.status(400).send({ error: "User does not exist" });
      return;
    }
    res.status(200).send({ data: { user: existingUser } });
  } catch (err) {
    res.status(401).send({ error: "Token is invalid" });
    return;
  }
});

app.post("/api/user/logout", express.json(), async (req, res) => {
  const { token } = req.headers;
  if (!token) {
    res.status(401).send({ error: "Token is required" });
    return;
  }
  const blacklistedTokens = await readDataFromMongo(
    "data/blacklisted-tokens.json"
  );
  if (!blacklistedTokens.includes(token)) {
    blacklistedTokens.push(token);
  }
  writeDataToMongo("blacklisted-tokens", blacklistedTokens);
  res.status(200).send({ data: { message: "Logged out successfully" } });
});

// GET countries
app.get("/api/countries", async (req, res) => {
  const countries = await readDataFromMongo("countries");
  console.log("Countries:", countries);
  res.status(200).send({ data: { countries } });
});

// POST add new message
app.post("/api/message/add", express.json(), async (req, res) => {
  const { name, message, gender, country } = req.body;
  if (!name || !message || !gender || !country) {
    res.status(400).send({ error: "All fields are required" });
    return;
  }
  const newMessageId = await getNextMessageId();
  const newMessage = {
    id: newMessageId,
    name: "" + name,
    message: "" + message,
    gender: "" + gender,
    country: "" + country,
    creationDate: new Date().toISOString(),
    read: "false",
  };

  await writeDataToMongo("messages", [newMessage]);

  wss.clients.forEach((client) => {
    client.send(JSON.stringify({ name, message }));
  });

  res.status(200).send({ data: { message: newMessage } });
});
// GET messages
app.get("/api/messages", async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin", "reader"]);
  if (!authCheck) {
    return;
  }
  const messages = await readDataFromMongo("messages");
  res.status(200).send({ data: { messages } });
});

// GET message by id
app.get("/api/message/:id", async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin", "reader"]);
  if (!authCheck) {
    return;
  }
  const { id } = req.params;
  const messages = await readDataFromMongo("messages");
  const message = messages.find((message) => message.id == id);
  if (!message) {
    res.status(404).send({ error: "Message not found" });
    return;
  }
  res.status(200).send({ data: { message } });
});

// POST read message by id
app.post("/api/message/read/:id", express.json(), async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin", "reader"]);
  if (!authCheck) {
    return;
  }
  const { id } = req.params;
  const messages = await readDataFromMongo("messages");
  const message = messages.find((message) => message.id == id);
  if (!message) {
    res.status(404).send({ error: "Message not found" });
    return;
  }
  readMessageOnMongo(message);
  res.status(200).send({ data: { message } });
});

// POST delete message by id
app.post("/api/message/delete/:id", express.json(), async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin"]);
  if (!authCheck) {
    return;
  }
  const { id } = req.params;
  const messages = await readDataFromMongo("messages");
  const message = messages.find((message) => message.id == id);
  if (!message) {
    res.status(404).send({ error: "Message not found" });
    return;
  }
  await deleteMessageFromMongo(message);
  res.status(200).send({ data: { message: { id } } });
});

// POST add new user with reader role
app.post("/api/user/add-reader", express.json(), async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin"]);
  if (!authCheck) {
    return;
  }
  console.log(req.body);
  const { username, password, base64Photo } = req.body;
  if (!username) {
    res.status(400).send({ error: "Username is required" });
    return;
  }
  if (!password) {
    res.status(400).send({ error: "Password is required" });
    return;
  }
  if (!base64Photo) {
    res.status(400).send({ error: "Photo is required" });
    return;
  }
  const currentUsers = await readDataFromMongo("users");
  const existingUser = currentUsers.find((user) => user.username === username);
  if (existingUser) {
    res.status(400).send({ error: "Username already exists" });
    return;
  }
  const newUserId = await getNextUserId();
  const newUser = {
    id: newUserId,
    username: username,
    password: password,
    base64Photo: base64Photo,
    role: "reader",
  };
  await addUserToMongo(newUser);
  res.status(200).send({ data: { user: newUser } });
});

// GET users
app.get("/api/users", async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin"]);
  if (!authCheck) {
    return;
  }
  const users = await readDataFromMongo("users");
  res.status(200).send({ data: { users } });
});

// GET user by id
app.get("/api/user/:id", async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin"]);
  if (!authCheck) {
    return;
  }
  const { id } = req.params;
  const users = await readDataFromMongo("users");
  const user = users.find((user) => user.id == id);
  if (!user) {
    res.status(404).send({ error: "User not found" });
    return;
  }
  res.status(200).send({ data: { user } });
});

// GET messages with pagination and sorting
app.get("/api/messages-with-pagination", async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin", "reader"]);
  if (!authCheck) {
    return;
  }

  const {
    page = 1,
    perPage = 10,
    sortBy = "creationDate",
    sortOrder = "asc",
  } = req.query;

  const allowedSortColumns = ["name", "gender", "creationDate", "country"];
  if (!allowedSortColumns.includes(sortBy)) {
    res.status(400).send({ error: "Invalid sort column" });
    return;
  }

  const allowedSortOrders = ["asc", "desc"];
  if (!allowedSortOrders.includes(sortOrder)) {
    res.status(400).send({ error: "Invalid sort order" });
    return;
  }

  const messages = await readDataFromMongo("messages");

  // Apply sorting
  messages.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy].localeCompare(b[sortBy]);
    } else {
      return b[sortBy].localeCompare(a[sortBy]);
    }
  });

  // Calculate pagination
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + parseInt(perPage);
  const paginatedMessages = messages.slice(startIndex, endIndex);

  res.status(200).send({ data: { messages: paginatedMessages } });
});

// GET messages with infinite scrolling pagination
app.get("/api/messages-with-pagination-scroll", async (req, res) => {
  const {
    lastMessageIndex,
    perPage = 10,
    sortBy = "creationDate",
    sortOrder = "asc",
  } = req.query;

  const allowedSortColumns = ["name", "gender", "creationDate", "country"];
  if (!allowedSortColumns.includes(sortBy)) {
    res.status(400).send({ error: "Invalid sort column" });
    return;
  }

  const allowedSortOrders = ["asc", "desc"];
  if (!allowedSortOrders.includes(sortOrder)) {
    res.status(400).send({ error: "Invalid sort order" });
    return;
  }

  const messages = await readDataFromMongo("messages");

  messages.sort((a, b) => {
    if (sortOrder === "asc") {
      return a[sortBy].localeCompare(b[sortBy]);
    } else {
      return b[sortBy].localeCompare(a[sortBy]);
    }
  });

  const startIndex = parseInt(lastMessageIndex) || 0;
  const endIndex = startIndex + parseInt(perPage);

  if (startIndex >= messages.length) {
    res.status(200).send({ data: { messages: [] } });
    return;
  }

  const paginatedMessages = messages.slice(startIndex, endIndex);

  res.status(200).send({ data: { messages: paginatedMessages } });
});

// POST update user by id
app.post("/api/user/update/:id", express.json(), async (req, res) => {
  const authCheck = await checkTokenAndRole(req, res, ["admin"]);
  if (!authCheck) {
    return;
  }
  const { id } = req.params;
  const { username, password, base64Photo } = req.body;
  if (!username) {
    res.status(400).send({ error: "Username is required" });
    return;
  }
  if (!password) {
    res.status(400).send({ error: "Password is required" });
    return;
  }
  if (!base64Photo) {
    res.status(400).send({ error: "Photo is required" });
    return;
  }
  const users = await readDataFromMongo("users");
  const user = users.find((user) => user.id == id);
  if (!user) {
    res.status(404).send({ error: "User not found" });
    return;
  }
  console.log("Saltuk", user);
  updateUserOnMongo(password, base64Photo, user);

  res.status(200).send({ data: { user } });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
