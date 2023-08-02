/*
 * Configuration for Server and Database
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const getAppRootDir = () => {
   var currentDir = path.dirname(fileURLToPath(import.meta.url));
   while(!fs.existsSync(path.join(currentDir, 'package.json'))) {
      currentDir = path.join(currentDir, '../')
   }
   return currentDir
}

// Main configs
const config = {
   host: 'localhost',
   port: 3000,
   __dirname: getAppRootDir()
};
// MongoDB configs
const mongodb = {
   dbName: 'socialnetworkmusic',
   database : 'tlwproject',
   host : 'localhost',
   uri: 'mongodb+srv://tlwuser:2BoK4Q6NZhQCNud@tlwproject.tszysxw.mongodb.net/?retryWrites=true&w=majority',
   // TODO: others to be added when decided how manage data in Mongo
   // see
   collections : [
      'users',
      'community',
      'playlists'
   ],
};
// Spotify configs
const spotify = {
   base_url: "https://api.spotify.com/v1",
   token_url: 'https://accounts.spotify.com/api/token',
   lang: 'language=it-IT',
   client_id: 'f6250455148444c19addcada7c1b33f0',
   client_secret: '9e65f0fd425041098a26352ffd529044',
};

// NOTE: decide what to export and expose outside and maybe wrap it
//       around a function call (like encapsulation) if it's better
export { config, spotify, mongodb };
