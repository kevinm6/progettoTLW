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
import { updatePlaylist,addSongToPlaylist, getUserPlaylists, createplaylist, deletePlaylist, getPlaylist, removeSongFromPlaylist } from "./src/lib/playlist.js";
import * as community from "./src/lib/community.js";

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



/* -------------------- FETCH ------------------- */
app.get("/playlist", async (_, res) => {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to fetch the playlists.html file'
   res.sendFile(config.__dirname + "/src/html/playlists.html");
});
// Login Endpoint
app.get("/login", async (req, res) => {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to fetch the login page'
   res.sendFile(config.__dirname + "/src/html/login.html");
});
// Register Endpoints
app.get("/register", async (req, res) => {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to fetch the register page'
   res.sendFile(config.__dirname + "/src/html/register.html");
});
app.get("/explore", async function (_, res) {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to fetch the explore.html file'
   res.sendFile(config.__dirname + "/src/html/explore.html");
});
app.get("/createplaylist", async (req, res) => {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to obtain createplaylist.html page'
   res.sendFile(config.__dirname + "/src/html/createplaylist.html");
});
app.get("/community", async (_, res) => {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to obtain community.html page'
   res.sendFile(config.__dirname + "/src/html/community.html");
});
app.get("/createcommunity", async (req, res) => {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to obtain createcommunity.html page'
   res.sendFile(config.__dirname + "/src/html/createcommunity.html");
});
// Endpoint per la pagina principale
app.get("/", async (_, res) => {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to obtain index.html page'
   res.sendFile(config.__dirname + "/src/public/index.html");
});

app.get("/profile", async function (_, res) {
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to fetch the profile page'
   res.sendFile(config.__dirname + "/src/html/profile.html");
});
app.get("/editplaylist/:id", async function (req, res) {
   const id = req.params.id;
   // #swagger.tags = ['fetch']
   // #swagger.description = 'Endpoint that allows to fetch the edit playlist page'
   res.sendFile(`${config.__dirname}/src/html/editplaylist.html`);
});


/* ------------------- USERS ------------------- */

// User specific Endpoint
app.get("/users/:id", async function (req, res) {
   // #swagger.tags = ['users']
   // #swagger.description = 'Endpoint that allows to obtain a specific user given its _id'
   // #swagger.parameters['id'] = { description: 'User ID to fetch.' }
   /* #swagger.responses[200] = {
         schema: { $ref: "#/definitions/user" },
         description: 'user found.'
      } */
   getUser(req, res)
});


// Endpoint for all users
app.get("/users", async function (_, res) {
   // #swagger.tags = ['users']
   // #swagger.description = 'Endpoint that allows to fetch all users from the database'
   /* #swagger.responses[200] = {
         description: 'List of users.'
      } */
   getUsers(res)
});

// User update Endpoint
app.put("/users/:id", function (req, res) {
   // #swagger.tags = ['users']
   // #swagger.description = 'Endpoint that allows to update of a specific user given its _id and the new Data'
   // #swagger.parameters['id'] = { description: 'User ID to be updated.' }

   /* #swagger.parameters['body'] = {
	      in: 'body',
         description: 'Body that contains updated data to be sent to the DB.',
         type: 'object',
         schema: { $ref: "#/definitions/updateuser" }
      }
*/

   /* #swagger.responses[200] = {
         description: 'user updated.'
      }
      #swagger.responses[400] = {
         description: 'Missing name / nickname / email / User already exists'
      }
      #swagger.responses[500] = {
         description: 'Generic error'
      }
      */
   updateUser(res, req.body._id, req.body);
});

// User delete Endpoint
app.delete("/users/:id", function (req, res) {
   // #swagger.tags = ['users']
   // #swagger.description = 'Endpoint that allows to delete a specific user from the database'
   // #swagger.parameters['id'] = { description: 'User ID to be deleted.' }
   /* #swagger.responses[200] = {
         description: 'user found.'
      }
      #swagger.responses[200] = {
         description: 'User delted succesfully'
      }
      #swagger.responses[400] = {
         description: 'User does not exist'
      }
      */
   deleteUser(res, req.params.id);
});


/* ------------------- AUTHENTICATION ------- ------------------- */
// Login Endpoint
app.post("/login", async (req, res) => {
   // #swagger.tags = ['auth']
   // #swagger.description = 'Endpoint that allows to check if user's login data is correct and valid for logging in the application'
   /* #swagger.parameters['body'] = {
	      in: 'body',
         description: 'Body to validate login.',
         type: 'object',
         schema: { $ref: "#/definitions/loginrequest" }
      }
*/
   /* #swagger.responses[200] = {
         description: 'user found.'
      }
      #swagger.responses[200] = {
         schema: { $ref: "#/definitions/loggeduser" },
         description: 'User login data is valid'
      }
      #swagger.responses[401] = {
         description: 'User not authorized'
      }
      */
   login(req, res);
});



app.post("/register", function (req, res) {
   // #swagger.tags = ['auth']
   // #swagger.description = 'Endpoint that allows to register a new user in the database'
   /* #swagger.parameters['body'] = {
	      in: 'body',
         description: 'Body to be registered in the DB.',
         type: 'object',
         schema: { $ref: "#/definitions/registerrequest" }
      }
*/
   /* #swagger.responses[200] = {
         description: 'succesfully registered.'
      }
      #swagger.responses[400] = {
         description: 'User already exists'
      }
      #swagger.responses[500] = {
         description: 'Generic error'
      }
      */
   register(res, req.body);
});

app.post("/authuser", async (req, res) => {
   // #swagger.tags = ['auth']
   // #swagger.description = 'Endpoint that allows to verify if user tuple of _id, email and nickname are valid in the database.'
   /* #swagger.parameters['body'] = {
	      in: 'body',
         description: 'tuple used for verification',
         type: 'object',
         schema: { $ref: "#/definitions/authuser" }
      }
*/
   /* #swagger.responses[200] = {
         schema: { $ref: "#/definitions/user"},
         description: 'succesfully authorized.'
      }
      #swagger.responses[401] = {
         description: 'Unauthorized'
      }
      */
   authuser(req, res);
});

/* ------------------- TRACKS ------------------- */
app.get("/search", async function (req, res) {
   // #swagger.tags = ['tracks']
   // #swagger.description = 'ADD DESCRIPTION'
   search(req.query, res);
})
app.get("/tracks", async function (req, res) {
   // #swagger.tags = ['tracks']
   // #swagger.description = 'ADD DESCRIPTION'
   getRecommended(req.params, res);
})

app.get("/tracks/:id", async function (req, res) {
   // #swagger.tags = ['tracks']
   // #swagger.description = 'ADD DESCRIPTION'
   getTrack(req.params.id, res);
})


/* ------------------- ARTISTS ------------------- */
// app.get("/artists", async function (req, res) {
//    res.sendFile(config.__dirname + "/src/html/artists.html");
// })

app.get("/artist/:id", async function (req, res) {
   // #swagger.tags = ['artists']
   // #swagger.description = 'ADD DESCRIPTION'
   getArtists(false, req.params.id, res);
})

app.get("/artists/:id", async function (req, res) {
   // #swagger.tags = ['artists']
   // #swagger.description = 'ADD DESCRIPTION'
   getArtists(true, req.params.id, res);
})


/* ------------------- EXPLORE ------------------- */



/* -------------------- PLAYLIST ------------------- */

app.get("/playlist/:id", async (req, res) => {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to obtain user's playlists'
   // #swagger.parameters['id'] = { description: 'Id of the user we want to fetch playlists of.' }
   /* #swagger.responses[200] = {
         description: 'list of playlists'
      }
      #swagger.responses[500] = {
         description: 'Server error'
      }
      */
   getUserPlaylists(res, req.params.id);
});
app.put("/playlist/:id", async (req, res) => {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to edit user's playlists'
   // #swagger.parameters['id'] = { description: 'Id of the user we want to edit playlists of.' }
   /* #swagger.responses[200] = {
         description: 'playlist updated'
      }
      #swagger.responses[500] = {
         description: 'Server error'
      }
      */
   addSongToPlaylist(req, res);
});
app.post("/getplaylist", async (req, res) => {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to obtain a specific playlist'
   // #swagger.parameters['id'] = { description: 'Id of the owner.' }
   // #swagger.parameters['playlistid'] = { description: 'Id of the playlist we want to fetch.' }
   /* #swagger.responses[200] = {
         description: 'playlist',
         schema: { $ref: "#/definitions/playlists" }
      }
      #swagger.responses[500] = {
         description: 'Server error'
      }
      #swagger.responses[404] = {
         description: 'Playlist Not Found'
      }
      */
   getPlaylist(res, req.body.owner_id,req.body.id);
});

app.post("/createplaylist", function (req, res) {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to create a new playlist'
   /* #swagger.parameters['body'] = {
	      in: 'body',
         description: 'tuple used for verification',
         type: 'object',
         schema: { $ref: "#/definitions/playlists" }
      }
*/
   /* #swagger.responses[200] = {
         description: 'playlist created.'
      }
      #swagger.responses[400] = {
         description: 'Error while creating the playlist or missing parameter'
      }
      #swagger.responses[500] = {
         description: 'Server error'
      }
      */
   createplaylist(res, req.body);
});
app.delete("/deleteplaylist/:id", function (req, res) {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to delete a playlist given the ID'

   /* #swagger.responses[200] = {
         description: 'playlist deleted.'
      }
      #swagger.responses[400] = {
         description: 'Missing parameter'
      }
      #swagger.responses[404] = {
         description: 'Playlist not found or not valid owner'
      }
      #swagger.responses[500] = {
         description: 'Internal error'
      }
      */
   deletePlaylist(res,req.params.id, req.body._id);
});

app.delete("/deleteSongFromPlaylist", function (req, res) {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to delete song from a playlist'

   /* #swagger.responses[200] = { 
         description: 'Song removed.' 
      } 
      #swagger.responses[400] = { 
         description: 'Missing parameter' 
      }
      #swagger.responses[404] = { 
         description: 'Song not found or not valid' 
      }
      #swagger.responses[500] = { 
         description: 'Internal error' 
      }
      */  
   removeSongFromPlaylist(res,req.body.playlist_id,req.body.track_id,req.body.owner_id);
});


app.put("/updateplaylist/:id", function (req, res) {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to update some data from a playlist'

   /* #swagger.responses[200] = { 
         description: 'playlist updated.' 
      } 
      #swagger.responses[400] = { 
         description: 'Missing parameter' 
      }
      #swagger.responses[404] = { 
         description: 'playlist not found or not valid' 
      }
      #swagger.responses[500] = { 
         description: 'Internal error' 
      }
      */  
   updatePlaylist(res,req.params.id,req.body);
});

/* -------------------- COMMUNITY ------------------- */

app.get("/community/:id", async (req, res) => {
   let id = req.params.id;
   // #swagger.tags = ['community']
   // #swagger.description = 'ADD DESCRIPTION'
   community.getCommunity(id, res);
});
app.put("/community/:id", async (req, res) => {
   community.updateCommunity(req, res);
});
app.delete("/community/:id", async (req, res) => {
   community.deleteCommunity(req, res)
});

app.post("/createcommunity", async (req, res) => {
   community.createCommunity(req, res);
});


/* ------------------- MISC ENDPOINTS ----------------- */

app.get("/getGenres", async function (_, res) {
   // #swagger.tags = ['misc']
   // #swagger.description = 'Endpoint that allows to fetch all genres from spotify's APIs'
   getGenres(res);
});



/* ------------------- DB AND SERVER START ------------------- */
export const db = Db();
app.listen(config.port, config.host, () => {
   console.log(`🟢 Server listening on port: ${config.port}`);
});

// export default app
