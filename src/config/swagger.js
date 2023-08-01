const swaggerAutogen = require('swagger-autogen')();

const doc = {
   info: {
      title: 'SNM API',
      description: 'Description',
   },
   host: 'localhost:3000',
   schemes: ['http'],
};

const outputFile = './swagger_out.json'
const endpointsFiles = ['../../app.js', '../html/index.html']

swaggerAutogen(outputFile, endpointsFiles, doc);

