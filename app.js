// Import dei moduli necessari utilizzando il sistema di moduli ES6

import express from "express";
import cors from "cors";
import { config } from "./src/config/prefs.js";
import {
   serve as swaggerUiServe,
   setup as swaggerUiSetup,
} from "swagger-ui-express";
import 'dotenv/config'
import { login,authuser } from "./src/lib/login.js";
import { getUsers, getUser, updateUser, deleteUser } from "./src/lib/user.js";
import { Db } from "./src/lib/database.js";
import { join } from "path";
import { register } from "./src/lib/register.js";
import { search, getGenres, getRecommended, getTrack } from "./src/lib/spotify/fetch.js"
import * as playlist from "./src/lib/playlist.js";
import * as community from "./src/lib/community.js";
import * as utils from "./src/lib/utils.js";

import swaggerUi from 'swagger-ui-express';
import swaggerDocument from './src/api/docs/swagger_output.json'assert { type: 'json' };; // Specifica il percorso al tuo file Swagger JSON generato

// Creazione di un'istanza di Express per l'applicazione
const app = express();
utils.createLogFolder();
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
app.use('/api-docs', swaggerUiServe, swaggerUiSetup(swaggerDocument));

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
// CALLS FILE: USER.JS
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
// CALLS FILE: USER.JS
app.get("/users", async function (_, res) {
   // #swagger.tags = ['users']
   // #swagger.description = 'Endpoint that allows to fetch all users from the database'
   /* #swagger.responses[200] = {
         description: 'List of users.'
      }
      #swagger.responses[500] = {
         description: 'Internal Error.'
      }  
      */
   getUsers(res)
});

// User update Endpoint
// CALLS FILE: USER.JS
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
         description: 'Missing parameter, Invalid Parameters'
      }
      #swagger.responses[500] = {
         description: 'Generic error'
      }
      */
   updateUser(res, req.body._id, req.body);
});

// User delete Endpoint
// CALLS FILE: USER.JS
app.delete("/deleteUser/:id", function (req, res) {
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
      #swagger.responses[500] = {
         description: 'Internal Error'
      }
      */
   deleteUser(res, req.params.id);
});


/* ------------------- AUTHENTICATION ------- ------------------- */
// Login Endpoint
// CALLS FILE: LOGIN.JS
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
   /* 
      #swagger.responses[200] = {
         schema: { $ref: "#/definitions/loggeduser" },
         description: 'User login data is valid'
      }
      #swagger.responses[401] = {
         description: 'User not authorized'
      }
      #swagger.responses[400] = {
         description: 'Data is not valid, missing parameter'
      }
      #swagger.responses[500] = {
         description: 'Internal error'
      }
      */
   login(req, res);
});


// Register endpoint
// CALLS FILE: REGISTER.JS
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
         description: 'User already exists, invalid parameter'
      }
      #swagger.responses[500] = {
         description: 'Generic error'
      }
      */
   register(res, req.body);
});

// Auth user
// CALLS FILE: LOGIN.JS
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
      #swagger.responses[401] = {
         description: 'Invalid body parameter'
      }
      #swagger.responses[500] = {
         description: 'Internal Error'
      }
      */
   authuser(req, res);
});


/* -------------------- PLAYLIST ------------------- */

// CHIEDERE A KEV!!
app.get("/playlists", async (req, res) => {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to obtain all public playlists'
   /* #swagger.responses[200] = {
         description: 'list of playlists'
      }
      #swagger.responses[500] = {
         description: 'Server error'
      }
      */
   playlist.getPublicPlaylists(req, res);
});

// Gets playlist from user
// CALLS FILE : PLAYLIST.JS
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
   playlist.getUserPlaylists(res, req.params.id);
});

// CHIEDERE A KEV, SERVE DAVVERO?
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
      #swagger.responses[400] = {
         description: 'Invalid Parameters, Missing parameters'
      }
      */
   playlist.addSongToPlaylist(req, res);
});

// Adds song to playlist
// CALLS FILE : PLAYLIST.JS
app.put("/addsongtoplaylist/:id", async (req, res) => {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to add song to playlist'
   // #swagger.parameters['id'] = { description: 'Id of the playlist we want to add song to.' }
   /**
    #swagger.parameters['body'] = {
	      in: 'body',
         description: 'tuple used for verification',
         type: 'object',
         schema: { $ref: "#/definitions/song" }
      }
    */
   /* #swagger.responses[200] = {
         description: 'playlist updated'
      }
      #swagger.responses[400] = {
         description: 'Invalid Parameters, Missing parameters'
      }
      #swagger.responses[500] = {
         description: 'Server error'
      }
      */
   playlist.addSongToPlaylist(res,req.params.id,req.body);
});

// Fetches song by song id
// CALLS FILE : PLAYLIST.JS
app.get("/getplaylist/:id", async (req, res) => {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to obtain a specific playlist from given id'
   // #swagger.parameters['playlistid'] = { description: 'Id of the playlist we want to fetch.' }
   /* #swagger.responses[200] = {
         description: 'playlist',
         schema: { $ref: "#/definitions/playlists" }
      }
      #swagger.responses[500] = {
         description: 'Server error'
      }
      #swagger.responses[400] = {
         description: 'Invalid parameters, Missing parameters'
      }
      #swagger.responses[404] = {
         description: 'Playlist Not Found'
      }
      */
   playlist.getPlaylistFromId(res, req.params.id);
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
   playlist.getPlaylist(res, req.body.owner_id,req.body.id);
});

// creates palylist
// CALLS FILE : PLAYLIST.JS
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
   playlist.createplaylist(res, req.body);
});

// deletes palylist
// CALLS FILE : PLAYLIST.JS
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
   playlist.deletePlaylist(res,req.params.id, req.body._id);
});

// deletes song from playlist
// CALLS FILE : PLAYLIST.JS
app.delete("/deleteSongFromPlaylist", function (req, res) {
   // #swagger.tags = ['playlist']
   // #swagger.description = 'Endpoint that allows to delete song from a playlist'
   /**#swagger.parameters['body'] = {
	      in: 'body',
         description: 'parameters used to identify playlist of the user where the song to be deleted is in',
         type: 'object',
         schema: { $ref: "#/definitions/removesong" }
      } */
   /* #swagger.responses[200] = {
         description: 'Song removed.'
      }
      #swagger.responses[400] = {
         description: 'Missing parameter, Invalid parameter'
      }
      #swagger.responses[404] = {
         description: 'Song not found'
      }
      #swagger.responses[500] = {
         description: 'Internal error'
      }
      */
   playlist.removeSongFromPlaylist(res,req.body.playlist_id,req.body.track_id,req.body.owner_id);
});

// updates title, description, tags and privacy
// CALLS FILE : PLAYLIST.JS
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
   playlist.updatePlaylist(res,req.params.id,req.body);
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


/* -------------------- COMMUNITY ------------------- */

// fetches community data given its creator id
// CALLS FILE : COMMUNITY.JS
app.get("/community/:id", async (req, res) => {
   let id = req.params.id;
   // #swagger.tags = ['community']
   // #swagger.description = 'Endpoint that Fetches community Data given its creator ID'
   /**#swagger.parameters['id'] = {description: 'ID of the creator of the community we want to fetch',} */

   /* #swagger.responses[200] = {
         description: 'community fetched. returns the community data'
      }
      #swagger.responses[400] = {
         description: 'Missing parameter, Invalid parameter'
      }
      #swagger.responses[404] = {
         description: 'Community not found'
      }
      #swagger.responses[500] = {
         description: 'Internal error'
      }
      */
   community.getCommunity(id, res);
});

// fetches community into array given creator id
// CALLS FILE: COMMUNITY.JS
app.get("/communities/:id", async (req, res) => {
   let id = req.params.id;
   // #swagger.tags = ['community']
   // #swagger.description = 'Endpoint that Fetches community Data given its creator ID'
   /**#swagger.parameters['id'] = {description: 'ID of the creator of the community we want to fetch',} */
   /* #swagger.responses[200] = {
         description: 'community fetched. returns the community data on array format'
      }
      #swagger.responses[400] = {
         description: 'Missing parameter, Invalid parameter'
      }
      #swagger.responses[404] = {
         description: 'Community not found'
      }
      #swagger.responses[500] = {
         description: 'Internal error'
      }
      */
   community.getCommunities(id, res);
});


// fetches add playlist to community
// CALLS FILE: COMMUNITY.JS
app.put("/addplaylisttocommunity/:id", async (req, res) => {
      // #swagger.tags = ['community']
   // #swagger.description = 'Endpoint that adds playlist to community'
   /**#swagger.parameters['id'] = {description: 'ID of the creator of the community we want to add the playlist to',} */
   /* #swagger.responses[200] = {
         description: 'playlist added'
      }
      #swagger.responses[400] = {
         description: 'Missing parameter, Invalid parameter, playlist already in community'
      }
      #swagger.responses[404] = {
         description: 'Community not found'
      }
      #swagger.responses[500] = {
         description: 'Internal error'
      }
      */
   community.addPlaylistToCommunity(req.body.playlist_id,req.params.id,req.body.owner_id, res);
});

// deleted the community
// CALLS FILE: COMMUNITY.JS
app.delete("/community/:id", async (req, res) => {
      // #swagger.tags = ['community']
   // #swagger.description = 'Endpoint that deletes community given the id'
   /**#swagger.parameters['id'] = {description: 'ID of the community to be deleted',} */
   /* #swagger.responses[200] = {
         description: 'playlist deleted'
      }
      #swagger.responses[400] = {
         description: 'Missing parameter, Invalid parameter'
      }
      #swagger.responses[404] = {
         description: 'Community not found'
      }
      #swagger.responses[500] = {
         description: 'Internal error'
      }
      */
   community.deleteCommunity(req, res)
});

app.put("/community/:id", async (req, res) => {
   community.updateCommunity(req, res);
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
   utils.logonly(`🟢 Server listening on port: ${config.port}`)
   
});

// export default app
