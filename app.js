// Import dei moduli necessari utilizzando il sistema di moduli ES6

import express, { response } from "express";
import cors from "cors";
import { config } from "./src/config/prefs.js";
import {
   serve as swaggeruiServe,
   setup as swaggeruiSetup,
} from "swagger-ui-express";
import 'dotenv/config'
import { login,authuser } from "./src/lib/login.js";
import { getUsers, getUser, updateUser, deleteUser } from "./src/lib/user.js";
import { Db } from "./src/lib/database.js";
import { join } from "path";
import swaggerDocument from "./src/api/docs/swagger_out.json" assert { type: "json" };
import { register } from "./src/lib/register.js";
import { getGenres } from "./src/lib/spotify/fetch.js"
import { getUserPlaylists } from "./src/lib/playlist.js";
import { generateSpotifyToken } from "./src/lib/spotify/token.js"
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

// Endpoint per aggiornare i dettagli di un utente
app.put("/users/:id", function (req, res) {
   updateUser(res, req.body._id, req.body);
});

// Endpoint per eliminare un utente
app.delete("/users/:id", function (req, res) {
   deleteUser(res, req.params.id);
});

// ------------------- AUTENTICAZIONE e GESTIONE PROFILI-------------------

// Endpoint per ottenere la pagina di accesso
app.get("/login", async (req, res) => {
   res.sendFile(config.__dirname + "/src/html/login.html");
});

// Endpoint per effettuare l'accesso
app.post("/login", async (req, res) => {
   login(req, res);
});

app.get("/register", async (req, res) => {
   // let file = "/src/html/register.html";

   // let genres = await getGenres(process.env.SPOTIFY_TOKEN)
   // let g = await genres;
   // console.log(g)
   // genres.json()
   // let r = await genres
   res.sendFile(config.__dirname + "/src/html/register.html");
});

app.post("/register", function (req, res) {
   register(res, req.body);
});

app.get("/profile", async function (req, res) {
   res.sendFile(config.__dirname + "/src/html/profile.html");
});

app.post("/authuser", async (req, res) => {
   authuser(req, res);
});


//-------------------- GESTIONE PLAYLIST -------------------
app.get("/playlist", async (_, res) => {
   res.sendFile(config.__dirname + "/src/html/playlists.html");
});
app.get("/playlist/:id", async (req, res) => {
   getUserPlaylists(res,req.params.id);
});
app.get("/createplaylist", async (req, res) => {
   res.sendFile(config.__dirname + "/src/html/createplaylist.html");
});
// ------------------- ENDPOINTS AUSILIARI -----------------

app.get("/getGenres", async function (_, res) {
   getGenres(res);
});

// ------------------- HOME PAGE -------------------

// Endpoint per la pagina principale
app.get("/", async (_, res) => {
   res.sendFile(config.__dirname + "/src/public/index.html");
});


// Start Database connection
export const db = Db();

// Avvio del server
app.listen(config.port, config.host, () => {
   console.log(`🟢 Server listening on port: ${config.port}`);
});

export default app
