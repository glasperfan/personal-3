// Get dependencies
const express = require('express');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const cors = require('cors');
const request = require('request-promise');
const q = require('q');
const _ = require('lodash');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Rides = require('./models/Rides');
const RideProducts = require('./models/RideProducts');
const settings = require('./settings');

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(path.join(__dirname, 'dist')));

// Allows CORS
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
    next();
});
app.use(cors());

// Email service
app.post('/email', (req, res) => {
  console.log(req.body);
  var name = req.body.name;
  var email = req.body.email;
  var message = req.body.message;

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: settings.email.user,
      pass: settings.email.pwd
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: `'${name}' <${email}>`, // sender address
    to: settings.email.recipient, // list of receivers
    subject: 'Hello!', // Subject line
    text: message // plain text body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(404).send('Email failed');
    } else {
      res.status(200).send('Sent!');
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
  });
});

function withMongo(action) {
  const uri = settings.mongoUri();
  return new Promise((resolve, reject) => MongoClient.connect(uri, { useNewUrlParser: true }, function(err, client) {
    if (err) {
      reject(err);
      console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
    }
    console.log('Connected to Mongo...');
    // const collection = client.db('test').collection('devices');
    // perform actions on the collection object
    action(client);
    client.close();
    resolve();
  }));
}

function noError(error, response) {
  return !error && response.statusCode == 200;
}

function uberHeaders(token) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept-Language': 'en_US'
  }
}

app.post('/uber/token', (req, res) => {
  console.log('acquiring access token');
  console.log(req.body.authorizationCode);
  request.post('https://login.uber.com/oauth/v2/token',
    { form: { // must be form - it's url-encoded data
        client_id: settings.uber.clientId,
        client_secret: settings.uber.clientSecret,
        redirect_uri: 'http://localhost:4200/footprint', // must match what's in the uber_dashboard
        grant_type: 'authorization_code',
        scope: 'history+profile',
        code: req.body.authorizationCode
      }
    },
    function (error, response, body) {  
      if (noError(error, response)) {
          const json = JSON.parse(body);
          res.send({ accessToken: json.access_token });
      } else {
        // console.log(error);
        res.send('Failed to obtain access token: ' + (error ? error.error : '[no error message]'));
      }
    }
  );
});

function sleeper(ms) {
  return function(x) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

async function retrieveRideProductAsync(token, productId) {
  return request({
    method: 'GET',
    uri: `https://api.uber.com/v1.2/products/${productId}`,
    json: true,
    headers: uberHeaders(token)
  }).then((productDetails) => new RideProducts(productDetails));
}

async function retrieveAllRideProducts(token, productIds) {
  return q.all(productIds.map(p => retrieveRideProductAsync(token, p))).then(allProducts => {
    console.log(allProducts);
    return allProducts;
  });
}

async function retrieveRideHistoryAsync(token, limit, offset) {
  return request({
    method: 'GET', 
    uri: 'https://api.uber.com/v1.2/history',
    json: true, // Automatically parses the JSON string in the response
    qs: { limit: limit, offset: offset },
    headers: uberHeaders(token)
  }).then(function (rides) {
    console.log('Retrieved ' + rides.history.length + ' rides');
    return Promise.resolve(rides);
  }).catch(function (err) {
    console.error('Failed to retrieve ride history...');
  });
}

function retrieveRideHistory(token, maxRidesPerQuery, ridesArr, getAll) {
  return retrieveRideHistoryAsync(token, maxRidesPerQuery, ridesArr.length).then(rides => {
    console.log('Retrieved response');
    if (rides.history.length && getAll) {
      ridesArr.push.apply(ridesArr, rides.history);
      console.log('Total stored: ' + ridesArr.length);
      return retrieveRideHistory(token, maxRidesPerQuery, ridesArr);
    } else {
      return ridesArr;
    }
  });
}

/**
 * Retrieves all rides recursively from the User History API
 * https://stackoverflow.com/questions/35139145/retrieve-paginated-data-recursively-using-promises
 * @param {string} token 
 */
function retrieveAllRideHistory(token) {
  return retrieveRideHistory(token, 50, [], true);
}

function toRideModels(rides, userId) {
  rides.forEach(r => r.user_id = userId);
  return rides.map(r => new Rides(r));
}

async function storeRides(rides, userId) {
  return Rides.create(toRideModels(rides, userId), { ordered: false }).then(_ => rides);
}

async function storeRideProducts(products) {
  return RideProducts.create(products, { ordered: false }); // returns a promise
}

app.get('/uber/me', (req, res) => {
  request.get('https://api.uber.com/v1.2/me',
  { headers: uberHeaders(req.query,accessToken) },
  (err, response, body) => {
    if (noError(err, response)) {
      const json = JSON.parse(body);
      res.send(json);
    } else {
      res.error('Failed to retrieve rider profile ' + (error ? error.error : '[no error message]'));
    }
  });
});

async function getProductsForRides(token, rides) {
  const allProductIds = _.uniq(rides.map(r => r.product_id)); 
  return new Promise((resolve, reject) => RideProducts.find({ product_id: { $in: allProductIds }}, (err, results) => {
    if (err) reject(err);
    resolve(results);
  })).then(results => {
    if (allProductIds.length === results.length) {
      // We already have all ride products stored
      return results;
    } else {
      // Else, return the ones we have plus the ones we now retrieve (and store).
      const resultIds = results.map(r => r.product_id);
      const notYetStoredIds = _.difference(allProductIds, resultIds);
      return retrieveAllRideProducts(token, notYetStoredIds)
        .then(retrievedProducts => storeRideProducts(retrievedProducts))
        .then(storedProducts => storedProducts.concat(results));
    }
  });
}

app.get('/uber/history/all', (req, res) => {
  const userId = req.query.userId;
  const token = req.query.accessToken;
  Rides.find({ user_id: userId }, (err, results) => {
    if (err) {
      console.error(err);
    } else if (!!results.length) {
      return getProductsForRides(token, results)
        .then(products => res.send({ rides: results, products: products }));
    } else {
      let retrievedRides = undefined;
      retrieveAllRideHistory(token)
        .then(rides => { retrievedRides = rides; return rides; })
        .then(rides => storeRides(rides, userId))
        .then(rides => getProductsForRides(token, rides))
        .then(products => res.send({ rides: retrievedRides, products: products }));
    }
  });
});

app.post('/uber/history/refresh', (req, res) => {
  const userId = req.query.userId;
  const accessToken = req.query.accessToken;
  Rides.count({ user_id: userId }, (err, count) => {
    if (err) {
      console.error(err);
    }
    const retrieve = count ? retrieveRideHistory(accessToken, 50, [], false) : this.retrieveAllRideHistory(accessToken);
    retrieve.then(rides => storeRides(rides, userId)).then(rides => res.send(rides));
  });
});

app.get('/uber/history', (req, res) => {
  request.get('https://api.uber.com/v1.2/history', {
    qs: { limit: req.query.limit, offset: req.query.offset },
    headers: uberHeaders(req.query.accessToken)
  },
  (err, response, body) => {
    if (noError(err, response)) {
      const json = JSON.parse(body);
      res.send(json);
    } else {
      res.error('Failed to retrieve ride history ' + (error ? error.error : '[no error message]'));
    }
  });
});

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../dist/404.html'));
});

/**
 * Get port from environment and store in Express.
 */
const port = settings.port;
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = settings.production ? https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'security', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'security', 'server.cert'))
}, app) : http.createServer(app);
mongoose.connect(settings.mongoUri(), { useNewUrlParser: true });

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
  console.log(`API running on localhost:${port}`);
});
