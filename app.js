// Import dei moduli necessari utilizzando il sistema di moduli ES6
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

// Creazione di un'istanza di Express per l'applicazione
const app = express();

// Middleware per il parsing dei dati JSON e abilitazione del CORS
app.use(express.json());
app.use(cors());

// Configurazione dell'URL del database MongoDB


// Middleware per servire la documentazione API tramite Swagger UI
app.use("/api-docs", swaggeruiServe, swaggeruiSetup(swaggerDocument));

// Middleware per servire file statici
app.use(express.static(config.__dirname));
app.use(express.static(join(config.__dirname, "/src/")));
app.use(express.static(join(config.__dirname, "/src/config/")));
app.use(express.static(join(config.__dirname, "/src/static/")));

// Funzione per creare un hash utilizzando l'algoritmo MD5
function hash(input) {
  return createHash("md5").update(input).digest("hex");
}

// ------------------- GESTIONE UTENTI -------------------

// Endpoint per ottenere i dettagli di un utente specifico
app.get("/users/:id", async function (req, res) {
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

// Endpoint per ottenere la lista di tutti gli utenti
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

// Endpoint per aggiungere un nuovo utente
app.post("/users", function (req, res) {
  addUser(res, req.body);
});

// Endpoint per aggiornare i dettagli di un utente
app.put("/users/:id", function (req, res) {
  updateUser(res, req.params.id, req.body);
});

// Endpoint per eliminare un utente
app.delete("/users/:id", function (req, res) {
  deleteUser(res, req.params.id);
});

// ------------------- AUTENTICAZIONE -------------------

// Endpoint per ottenere la pagina di accesso
app.get("/login", async (req, res) => {
  res.sendFile(config.__dirname + "/src/html/login.html");
});

// Endpoint per effettuare l'accesso
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

  if (loggedUser == null) {
    res.status(401).send("Unauthorized");
  } else {
    res.json(loggedUser);
  }
});

// ------------------- PAGINA PRINCIPALE -------------------

// Endpoint per la pagina principale
app.get("/", function (req, res) {
  res.sendFile(config.__dirname + "/src/html/index.html");
});

// Avvio del server
app.listen(config.port, config.host, () => {
  console.log(`Server listening on port: ${config.port}`);
});
