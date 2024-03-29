import swaggerAutogen from "swagger-autogen";
import * as utils from "../../lib/utils.js";
import { config } from "../../config/prefs.js";
const outputFile = './swagger_output.json';
const endpointsFiles = ['../../../app.js']; // Usa il percorso relativo corretto per il tuo file app.js

// per maggiori configurazioni: https://davibaltar.medium.com/documenta%C3%A7%C3%A3o-autom%C3%A1tica-de-apis-em-node-js-eb03041c643b

const doc = {
   info: {
       version: "1.0.0",
       title: "SNM API",
       description: "Documentation for the APIs of our website: Social Network for Music."
   },
   host: `${config.host}:${config.port}`,
   basePath: "/",
   schemes: ['http'],
   consumes: ['application/json'],
   produces: ['application/json'],
   tags: [
      {
         "name": "fetch",
         "description": "Endpoints for fetching and searching content."
      },
      {
          "name": "users",
          "description": "Endpoints for the management of user data and related operations."
      },
      {
         "name": "auth",
         "description": "Endpoints related to authentication and user authorization."
      },
      {
         "name": "playlist",
         "description": "Endpoints for the orchestration of playlists."
      },
      {
         "name": "community",
         "description": "Endpoints for managing community-related data and interactions."
      },
      {
         "name": "tracks",
         "description": "Endpoints for retrieving and managing track information."
      },
      {
          "name": "misc",
          "description": "Miscellaneous endpoints catering to various operations."
      }
     

  ]
  ,
   definitions: {
       user: {
           _id: "ObjectId('64df73b31e5eda5eb868ddcd')",
           name: "Joe",
           nickname: "joedough",
           surname: "Joe",
           email: "joedough@example.com",
           password: "md5 hashed password",
           date: "2001-09-11",
           genres: {
               0: "pop",
               1: "rock",
               2: "metal"
           }
       },
       playlists: {
         _id: "ObjectId('64e748f0cb18ad90657b9043')",
         owner_id: "ObjectId('64df73b31e5eda5eb868ddcd')",
         title: "Example Playlist",
         description: "Description of playlist",
         public: true,
         tags: {
             0: "chill",
             1: "relax",
             2: "vibes"
         },
         songs: {
            0:{
               title: "Song 1",
               artist: "Artist1, Artist2, Artist3",
               duraion: "00:01:11"
            },
            1:{
               title: "Song 2",
               artist: "Artist1, Artist2, Artist3",
               duraion: "00:02:22"
            },
            2:{
               title: "Song 3",
               artist: "Artist1, Artist2, Artist3",
               duraion: "00:03:33"
            }
         },
         private: true
     },
       updateuser: {
           $name: "Jhon",
           $nickname: "johndough",
           $email: "johndough@example.com",
           $surname: "Dough"
       },
       loggeduser: {
            $_id: "64df73b31e5eda5eb868ddcd",
            $nickname:"johndough",
            $email: "johndough@gmail.com"
       },
       song: {
         $_id: "78kf73b31e6yda5eb868dder",
         $artist:"['artist1','artist2']",
         $duration: "00:11:22", 
         $year: "1984",
         $album: "Album Name"
       },
       loginrequest: {
         email: "johndough@gmail.com",
         nickname:"johndough",        
         $password: "password"  
       },
       registerrequest: {
         $name: "John",
         $nickname: "johndough",
         $email: "johndough@example.com",
         $password: "password"
       },
       authuser:{
         $_id: "64df73b31e5eda5eb868ddcd",
         $nickname: "johndough",
         $email: "johndough@gmail.com"
       },
       removesong: {
         $playlist_id: "ObjectId('64e748f0cb18ad90657b9043')",
         $track_id: "78kf73b31e6yda5eb868dder",
         $owner_id: "ObjectId('64df73b31e5eda5eb868ddcd')"
       }
   }
}

const generateSwagger = async () => {
  try {
    await swaggerAutogen()(outputFile, endpointsFiles,doc);
    utils.log('SWAGGER DOCUMENTATION GENERATED.');
  } catch (error) {
    utils.log('ERROR WHILE GENERATING SWAGGER DOCUMENTATION:', error);
  }
};

utils.createLogFolder();
generateSwagger();
