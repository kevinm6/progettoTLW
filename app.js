// Import dei moduli necessari utilizzando il sistema di moduli ES6

import express from "express";
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
import { register } from "./src/lib/register.js";
import { search, getGenres, getRecommended, getTrack } from "./src/lib/spotify/fetch.js"
import { getUserPlaylists,createplaylist } from "./src/lib/playlist.js";
import { getMembersOfCommunity, getCommunity } from "./src/lib/community.js";

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './src/api/docs/swagger_output.json'assert { type: 'json' };; // Specifica il percorso al tuo file Swagger JSON generato

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


// Middleware per servire la documentazione API tramite Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Middleware per servire file statici
app.use(express.static(config.__dirname));
app.use(express.static(join(config.__dirname, "/src/")));
app.use(express.static(join(config.__dirname, "/src/config/")));
app.use(express.static(join(config.__dirname, "/src/public/")));
app.use(express.static(join(config.__dirname, "/src/html/")));

/* ------------------- USERS ------------------- */

// User specific Endpoint
app.get("/users/:id", async function (req, res) {
   getUser(req, res)
});


// Endpoint for all users
app.get("/users", async function (_, res) {
   getUsers(res)
});

// User update Endpoint
app.put("/users/:id", function (req, res) {
   updateUser(res, req.body._id, req.body);
});

// User delete Endpoint
app.delete("/users/:id", function (req, res) {
   deleteUser(res, req.params.id);
});

/* ------------------- AUTHENTICATION e PROFILE ------------------- */

// Login Endpoint
app.get("/login", async (req, res) => {
   res.sendFile(config.__dirname + "/src/html/login.html");
});

// Login Endpoint
app.post("/login", async (req, res) => {
   login(req, res);
});

// Register Endpoints
app.get("/register", async (req, res) => {
   res.sendFile(config.__dirname + "/src/html/register.html");
});

app.post("/register", function (req, res) {
   register(res, req.body);
});

app.get("/profile", async function (_, res) {
   res.sendFile(config.__dirname + "/src/html/profile.html");
});

app.post("/authuser", async (req, res) => {
   authuser(req, res);
});


/* ------------------- TRACKS ------------------- */
app.get("/search", async function (req, res) {
   search(req.query, res);
})


/* ------------------- TRACKS ------------------- */
app.get("/tracks", async function (req, res) {
   getRecommended(req.params, res);
})

app.get("/tracks/:id", async function (req, res) {
   getTrack(req.params.id, res);
})


/* ------------------- ARTISTS ------------------- */
// app.get("/artists", async function (req, res) {
//    res.sendFile(config.__dirname + "/src/html/artists.html");
// })

app.get("/artist/:id", async function (req, res) {
   getArtists(false, req.params.id, res);
})

app.get("/artists/:id", async function (req, res) {
   getArtists(true, req.params.id, res);
})


/* ------------------- EXPLORE ------------------- */
app.get("/explore", async function (_, res) {
   res.sendFile(config.__dirname + "/src/html/explore.html");
})


/* -------------------- PLAYLIST ------------------- */
app.get("/playlist", async (_, res) => {
   res.sendFile(config.__dirname + "/src/html/playlists.html");
});
app.get("/playlist/:id", async (req, res) => {
   getUserPlaylists(res, req.params.id);
});
app.get("/createplaylist", async (req, res) => {
   res.sendFile(config.__dirname + "/src/html/createplaylist.html");
});
app.post("/createplaylist", function (req, res) {
   createplaylist(res, req.body);
});

/* -------------------- COMMUNITY ------------------- */
app.get("/community", async (_, res) => {
   res.sendFile(config.__dirname + "/src/html/community.html");
});
app.get("/community/:id", async (req, res) => {
   getCommunity(req, res);
});
app.get("/createcommunity", async (req, res) => {
   res.sendFile(config.__dirname + "/src/html/createcommunity.html");
});


/* ------------------- AUXILIAR ENDPOINTS ----------------- */

app.get("/getGenres", async function (_, res) {
   getGenres(res);
});


/* ------------------- HOME PAGE ------------------- */

// Endpoint per la pagina principale
app.get("/", async (_, res) => {
   res.sendFile(config.__dirname + "/src/public/index.html");
});


/* ------------------- DATABASE START ------------------- */
export const db = Db();

/* ------------------- SERVER START ------------------- */
app.listen(config.port, config.host, () => {
   console.log(`🟢 Server listening on port: ${config.port}`);
});

// export default app
