/**
 * Using ES6 modules since are available and supported also from recent Browsers
 * instead the CommonJS standard.
 */
import { MongoClient as mongoClient, ObjectId } from "mongodb";
import { createHash } from "crypto";
import {
   serve as swaggeruiServe,
   setup as swaggeruiSetup,
} from "swagger-ui-express";
import express from "express";
import cors from "cors";
import { config, mongodb } from "./src/config/prefs.js";
import { join } from "path";
import swaggerDocument from "./src/api/docs/swagger_out.json" assert { type: "json" };

const app = express();
app.use(express.json());
app.use(cors());

/* API Docs served by 'swagger-ui-express' module */
app.use("/api-docs", swaggeruiServe, swaggeruiSetup(swaggerDocument));

// app.use(auth) // Per avere apikey su tutti gli endpoint

// HACK: this avoid no-sniff error for loading file from html
app.use(express.static(config.__dirname));
app.use(express.static(join(config.__dirname, "/src/")));
app.use(express.static(join(config.__dirname, "/src/config/")));
app.use(express.static(join(config.__dirname, "/src/static/")));

/**
 * Create hash from given input using md5 algorithm
 * @param {string} input - parameter to hash
 * @returns {string} hash result from give input
 */
function hash(input) {
   return createHash("md5").update(input).digest("hex");
}

app.get("/users/:id", async function (req, res) {
   // Ricerca nel database
   var id = req.params.id;
   var pwmClient = await new mongoClient(mongodb.url).connect();
   var user = await pwmClient
      .db(mongodb.dbName)
      .collection("users")
      .find({ _id: new ObjectId(id) })
      .project({ password: 0 })
      .toArray();
   res.json(user);
});

app.get("/users", async function (req, res) {
   var pwmClient = await new mongoClient(mongodb.url).connect();
   var users = await pwmClient
      .db(mongodb.dbName)
      .collection("users")
      .find()
      .project({ password: 0 })
      .toArray();
   res.json(users);
});

app.post("/users", function (req, res) {
   addUser(res, req.body);
});

app.get("/login", async (req, res) => {
   res.sendFile(config.__dirname + "/src/html/login.html");
});

app.post("/login", async (req, res) => {
   login = req.body;

   if (login.email == undefined) {
      res.status(400).send("Missing Email");
      return;
   }
   if (login.password == undefined) {
      res.status(400).send("Missing Password");
      return;
   }

   login.password = hash(login.password);

   var pwmClient = await new mongoClient(mongodb.url).connect();
   var filter = {
      $and: [{ email: login.email }, { password: login.password }],
   };
   var loggedUser = await pwmClient
      .db(mongodb.dbName)
      .collection("users")
      .findOne(filter);
   console.log(loggedUser);

   if (loggedUser == null) {
      res.status(401).send("Unauthorized");
   } else {
      res.json(loggedUser);
   }
});

app.put("/users/:id", function (req, res) {
   updateUser(res, req.params.id, req.body);
});

app.delete("/users/:id", function (req, res) {
   deleteUser(res, req.params.id);
});

app.get("/", function (req, res) {
   // res.setHeader('Content-Type', 'text/html');
   res.sendFile(config.__dirname + "/src/html/index.html");
});

app.listen(config.port, config.host, () => {
   console.log(`Server listening on port: ${config.port}`);
});
