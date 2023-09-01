import swaggerAutogen from "swagger-autogen";

const outputFile = './swagger_output.json';
const endpointsFiles = ['../../../app.js']; // Usa il percorso relativo corretto per il tuo file app.js

// per maggiori configurazioni: https://davibaltar.medium.com/documenta%C3%A7%C3%A3o-autom%C3%A1tica-de-apis-em-node-js-eb03041c643b

const doc = {
   info: {
       version: "1.0.0",
       title: "SNM API",
       description: "Documentation for the APIs of our website: Social Network for Music."
   },
   host: "localhost:3000",
   basePath: "/",
   schemes: ['http', 'https'],
   consumes: ['application/json'],
   produces: ['application/json'],
   tags: [
       {
           "name": "User",
           "description": "Endpoints"
       }
   ],
   securityDefinitions: {
       api_key: {
           type: "apiKey",
           name: "api_key",
           in: "header"
       },
       petstore_auth: {
           type: "oauth2",
           authorizationUrl: "https://petstore.swagger.io/oauth/authorize",
           flow: "implicit",
           scopes: {
               read_pets: "read your pets",
               write_pets: "modify pets in your account"
           }
       }
   },
   definitions: {
       User: {
           name: "Jhon Doe",
           age: 29,
           parents: {
               father: "Simon Doe",
               mother: "Marie Doe"
           },
           diplomas: [
               {
                   school: "XYZ University",
                   year: 2020,
                   completed: true,
                   internship: {
                       hours: 290,
                       location: "XYZ Company"
                   }
               }
           ]
       },
       AddUser: {
           $name: "Jhon Doe",
           $age: 29,
           about: ""
       }
   }
}

const generateSwagger = async () => {
  try {
    await swaggerAutogen()(outputFile, endpointsFiles,doc);
    console.log('Documentazione Swagger generata con successo.');
  } catch (error) {
    console.error('Errore durante la generazione della documentazione Swagger:', error);
  }
};

generateSwagger();
