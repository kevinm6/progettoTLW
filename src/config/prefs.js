// Configuration for Server and Database

// Main configs
const settings = {
   port: 3000,
   listen_on: 'localhost',
   auth_apikey: '123456'
};

// MongoDB configs
settings.mongodb = {
   host : 'localhost',
   database : 'tlwproject',
   uri: 'mongodb+srv://tlwuser:2BoK4Q6NZhQCNud@tlwproject.tszysxw.mongodb.net/?retryWrites=true&w=majority',
   collections : [
      'users',
      // TODO: others to be added when decided how manage data in Mongo
   ]
};

// Spotify configs
// FIX: can't use these for now on lib.js
// Since is a static JS file, require can't work
// Figure out a better way to manage and avoid keep this data
//    in < lib.js > file, even for security reason
settings.spotify = {
   base_url : 'https://api.themoviedb.org/3/',
   img_base_url : 'https://image.tmdb.org/t/p/w300',
   lang: 'language=it-IT',
   apikey: 'api_key=siudasubdsdsaadsdsiadasadsuadssa',
   client_id: 'f6250455148444c19addcada7c1b33f0',
   client_secret: '9e65f0fd425041098a26352ffd529044',
};


// HACK: IDK how we should manage this for now, maybe we remove this later
//
// Override default settings
// switch(process.env.NODE_ENV){
//   case 'production':
//     settings.port = 3100;
//   break;
//   case 'staging':
//     settings.port = 3000;
//   break;
// }


// NOTE: decide what to export and expose outside and maybe wrap it
//       around a function call (like encapsulation)
module.exports = settings;
