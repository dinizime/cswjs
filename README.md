# CSW.js
A simple implementation of a RESTFul JSON-oriented Catalogue Service for the Web (CSW) using Node.js.

Data is stored in a MongoDB. [Config.json](https://github.com/dinizime/cswjs/blob/master/config.json) is used to configure the application.

It is a simplified version of [WFS.js](https://github.com/dinizime/wfsjs) used to store metadata, workflows, and parametric workflows, for the use in the [Orchestration Client](https://github.com/dinizime/orchestration-client).

## Sample Data

The folder [data](/data) contain sample data for each of the configure resources in the WFS. They can be inserted in the database by using a POST operation in the resource, with [Postman](https://www.getpostman.com/), for example.

```
POST http://localhost:3002/csw/records
Headers: Accept: application/ld+json
Body: <data/records.json>
```

##Executing Service

After configuring the [Config.json](https://github.com/dinizime/cswjs/blob/master/config.json) file the service can be started by using [Nodemon](https://github.com/remy/nodemon), and executing the command:

```
nodemon bin/wwww
```

## Dependencies
* [Node.js](https://nodejs.org/en/)
* [Express.js](http://expressjs.com/)
* [Body-parser](https://github.com/expressjs/body-parser) - MIT License
* [Serve-favicon](https://github.com/expressjs/serve-favicon) - MIT License (not necessary for the application)
* [Morgan](https://github.com/expressjs/morgan) - MIT License (not necessary for the application)
* [CORS](https://github.com/expressjs/cors) - MIT License
* [TV4](https://github.com/geraintluff/tv4) - Public domain / MIT License
* [Mongoose](https://github.com/Automattic/mongoose) - MIT License
* [Valid-url](https://github.com/ogt/valid-url) - MIT License
* [Jade](http://jade-lang.com/) - MIT License
