import swaggerAutogen from "swagger-autogen";

const doc = {
   info: {
      title: 'Social Network for Music API',
      description: 'REST API Docs of Social Network for Music',
   },
   host: 'localhost:3000',
   schemes: ['http', 'https'],
   basePath: "/api-docs",
};

const endpointsFiles = ['../../app.js', '../html/index.html']

swaggerAutogen('./swagger_out.json', endpointsFiles, doc);
