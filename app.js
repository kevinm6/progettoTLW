// Import dei moduli necessari utilizzando il sistema di moduli ES6

import express from "express";
import cors from "cors";
import { config } from "./src/config/prefs.js";
import {
   serve as swaggeruiServe,
   setup as swaggeruiSetup,
} from "swagger-ui-express";
import 'dotenv/config'
import { login } from "./src/lib/login.js";
import { getUsers, getUser, updateUser, deleteUser } from "./src/lib/user.js";
import { Db } from "./src/lib/database.js";
import { join } from "path";
import swaggerDocument from "./src/api/docs/swagger_out.json" assert { type: "json" };
import { register } from "./src/lib/register.js";
import generateSpotifyToken from "./src/lib/spotify/token.js";
// Creazione di un'istanza di Express per l'applicazione
const app = express();

// Middleware per il parsing dei dati JSON e abilitazione del CORS
app.use(express.json());
const corsOptions = {
   origin: 'http://localhost:3000', // Indirizzo del tuo frontend
   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
   credentials: true, // Consenti l'invio dei cookie
 };

 // Usa il middleware cors
 app.use(cors(corsOptions));

//app.use(cors());


// Middleware per servire la documentazione API tramite Swagger UI
app.use("/api-docs", swaggeruiServe, swaggeruiSetup(swaggerDocument));

// Middleware per servire file statici
app.use(express.static(config.__dirname));
app.use(express.static(join(config.__dirname, "/src/")));
app.use(express.static(join(config.__dirname, "/src/config/")));
app.use(express.static(join(config.__dirname, "/src/static/")));


// ------------------- GESTIONE UTENTI -------------------

// Endpoint per ottenere i dettagli di un utente specifico
app.get("/users/:id", async function (req, res) {
   getUser(req, res)
});


// Endpoint per ottenere la lista di tutti gli utenti
app.get("/users", async function (_, res) {
   getUsers(res)
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
   login(req, res);
});

app.get("/register", async (_, res) => {
   res.sendFile(config.__dirname + "/src/html/register.html");
});

app.post("/register", function (req, res) {
   register(res, req.body);
});

// ------------------- ENDPOINTS AUSILIARI -----------------

//app.get("/getGenres", async function (req, res) {
//   getGenres(req, res);
//});

// ------------------- PAGINA PRINCIPALE -------------------

// Endpoint per la pagina principale
app.get("/", async (_, res) => {
   res.sendFile(config.__dirname + "/src/html/index.html");
});

// console.log(process.env)

// Avvio della connessione al Database
export const db = Db();
process.env.SPOTIFY_TOKEN = generateSpotifyToken();

// Avvio del server
app.listen(config.port, config.host, () => {
   console.log(`Server listening on port: ${config.port}`);
});


export default app
