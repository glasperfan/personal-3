// Get dependencies
import express, { Response, Request } from 'express';
import path = require('path');
import { readFileSync } from 'fs';
import { createServer, Server as HttpServer } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer } from 'https';
import cors from 'cors';
import http from 'request-promise';
import q from 'q';
import _ from 'lodash';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import mongoose from 'mongoose';

import Rides from './models/Rides';
import RideProducts from './models/RideProducts';

import SettingsDev from './settings';
import SettingsProd from './settings.prod';
import { MongoClient } from 'mongodb';
import { RequestCallback } from 'request';

const Settings = process.env.NODE_ENV === 'production' ? SettingsDev : SettingsProd;

const ERR_CACHE_FAILURE = 'ERR_CACHE_FAILURE';
const ERR_AUTH = 'ERR_AUTH';

const app = express();

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Point static path to dist
app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }));

// Allows CORS
app.use(function(req: Request, res: Response, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Credentials', 'true');
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
      user: Settings.email.user,
      pass: Settings.email.pwd
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: `'${name}' <${email}>`, // sender address
    to: Settings.email.recipients, // list of receivers
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

function noError(response: Response) {
  return response.statusCode == 200;
}

function uberHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'Accept-Language': 'en_US'
  }
}

app.post('/uber/token', (req, res) => {
  console.log('acquiring access token');
  http.post('https://login.uber.com/oauth/v2/token',
    { form: { // must be form - it's url-encoded data
        client_id: Settings.uber.clientId,
        client_secret: Settings.uber.clientSecret,
        redirect_uri: Settings.uber.redirectHost, // must match what's in the uber_dashboard
        grant_type: 'authorization_code',
        scope: 'history+profile',
        code: req.body.authorizationCode
      }
    },
    (_, response, body): RequestCallback => {  
      const json = JSON.parse(body);
      if (noError(response)) {
          return res.send({ accessToken: json.access_token });
      } else {
        // console.log(error);
        return res.send({
          code: ERR_AUTH,
          message: 'Failed to obtain access token: ' + json.error
        });
      }
    }
  );
});

// body: { accessToken: string }
app.post('/uber/logout', (req, res) => {
  console.log('Logging out user...');
  http.post('https://login.uber.com/oauth/v2/revoke',
    { form: { // must be form - it's url-encoded data
        client_secret: Settings.uber.clientSecret,
        client_id: Settings.uber.clientId,
        token: req.body.accessToken
      }
    },
    (err, _, body) => {
      const json = JSON.parse(body);
      if (json.message === 'OK') {
        res.send(true);
      } else {
        res.status(403).send('Could not logout user. Reason: ' + (err || '[no error]'));
      }
    }
  );
});

function sleeper(ms: number) {
  return function(x: any) {
    return new Promise(resolve => setTimeout(() => resolve(x), ms));
  };
}

async function retrieveRideProductAsync(token: string, productId: string): Promise<RideProducts> {
  return http({
    method: 'GET',
    uri: `https://api.uber.com/v1.2/products/${productId}`,
    json: true,
    headers: uberHeaders(token)
  }).then((productDetails: any) => new RideProducts(productDetails));
}

async function retrieveAllRideProducts(token: string, productIds: string[]) {
  return q.all(productIds.map(p => retrieveRideProductAsync(token, p))).then(allProducts => {
    console.log(allProducts);
    return allProducts;
  });
}

async function retrieveRideHistoryAsync(token: string, limit: number, offset: number) {
  return http({
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

async function retrieveRideHistoryWithLimit(token: string, totalRides: number, ridesArr: any[]) {
  return retrieveRideHistoryAsync(token, totalRides, ridesArr.length).then(rides => {
    ridesArr.push.apply(ridesArr, rides.history);
    totalRides = totalRides - ridesArr.length;
    if (totalRides > 0) {
      return retrieveRideHistoryWithLimit(token, totalRides, ridesArr);
    } else if (totalRides === 0) {
      return ridesArr;
    } else {
      throw new Error('Retrieved too many rides?');
    }
  });
}

function retrieveRideHistory(token: string, maxRidesPerQuery: number, ridesArr: any[], getAll: boolean) {
  return retrieveRideHistoryAsync(token, maxRidesPerQuery, ridesArr.length).then(rides => {
    console.log('Retrieved response');
    if (rides.history.length && getAll) {
      ridesArr.push.apply(ridesArr, rides.history);
      console.log('Total stored: ' + ridesArr.length);
      return retrieveRideHistory(token, maxRidesPerQuery, ridesArr, getAll);
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
function retrieveAllRideHistory(token: string) {
  return retrieveRideHistory(token, 50, [], true);
}

function toRideModels(rides: any[], userId: string): Rides[] {
  rides.forEach(r => r.user_id = userId);
  return rides.map(r => new Rides(r));
}

async function storeRides(rides: Rides[], userId: string) {
  return Rides.create(toRideModels(rides, userId), { ordered: false }).then(_ => rides);
}

async function storeRideProducts(products: RideProducts[]): Promise<any> {
  return RideProducts.create(products, { ordered: false }); // returns a promise
}

app.get('/uber/me', (req, res) => {
  const token = req.query.accessToken;
  return http({
    method: 'GET',
    uri: 'https://api.uber.com/v1.2/me',
    json: true, // Automatically parses the JSON string in the response
    headers: uberHeaders(token)
  }).then(function (profile) {
    res.send(profile);
  }).catch(function (err) {
    res.send({
      code: ERR_AUTH,
      message: 'Failed to retrieve rider profile ' + err.message
    });
  });
});

RideProducts.model()

async function getProductsForRides(token: string, rides: Rides[]) {
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

async function sendAllRideHistoryAndProducts(res: Response, token: string, userId: string) {
  let retrievedRides: Rides[] = undefined;
  retrieveAllRideHistory(token)
    .then((rides: Rides[]) => { retrievedRides = rides; return rides; })
    .then((rides: Rides[]) => storeRides(rides, userId))
    .then((rides: Rides[]) => getProductsForRides(token, rides))
    .then((products: RideProducts[]) => res.send({ rides: retrievedRides, products: products }));
}

app.get('/uber/history', (req: Request, res: Response) => {
  const userId = req.query.userId;
  const token = req.query.accessToken;
  Rides.count({ user_id: userId }, (err, count) => {
    if (err) {
      console.error(err);
    }
    if (!count) {
      sendAllRideHistoryAndProducts(res, token, userId);
    }
    retrieveRideHistoryAsync(token, 1, 0).then(rides => {
      const totalRideCount = rides.count;
      // If all results are cached, serve them
      if (count === totalRideCount) {
        Rides.find({ user_id: userId }, (err, results) => {
          if (err) {
            res.status(500).send({
              code: ERR_CACHE_FAILURE,
              message: 'Failed to retrieve ride cache results.',
              error: err
            });
          } else {
            getProductsForRides(token, results).then(products => res.send({ rides: results, products: products }));
          }
        });
      } else if (count < totalRideCount) {
        let retrievedRides: Rides[] = undefined;
        retrieveRideHistoryWithLimit(token, totalRideCount - count, [])
          .then((rides: Rides[]) => { retrievedRides = rides; return rides; })
          .then((rides: Rides[]) => storeRides(rides, userId))
          .then((rides: Rides[]) => getProductsForRides(token, rides))
          .then((products: RideProducts[]) => res.send({ rides: retrievedRides, products: products }));
      } else {
        res.status(500).send({
          code: ERR_CACHE_FAILURE,
          message: 'Ride cache is in an invalid state, refresh by invalidating the cache.'
        });
      }
    });
  });
});

// Catch all other routes and return the index file
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/static' + req.path), { dotfiles: 'allow' });
});


/**
 * Create HTTP and HTTPS servers.
 */
const httpPort = Settings.port;
const redirectHttpPort = 80;
const httpsPort = 443;
const servers: (HttpsServer | HttpServer)[] = [];

if (!Settings.production) {
  const httpServer = createServer(app);
  servers.push(httpServer);
  httpServer.listen(httpPort, () => {
    console.log(`HTTP server running on port ${httpPort}`);
  });
}


if (Settings.production) {
  const redirectApp = express();

  redirectApp.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);
  });

  redirectApp.listen(redirectHttpPort);
  
  const privateKey = readFileSync('/etc/letsencrypt/live/hughzabriskieserver.com/privkey.pem', 'utf8');
  const certificate = readFileSync('/etc/letsencrypt/live/hughzabriskieserver.com/cert.pem', 'utf8');
  const ca = readFileSync('/etc/letsencrypt/live/hughzabriskieserver.com/chain.pem', 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
    secureOptions: require('constants').SSL_OP_NO_TLSv1
  };
  const httpsServer = createHttpsServer(credentials, app);
  servers.push(httpsServer);
  httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS server running on port ${httpsPort}`);
  });
}

function shutDown() {
  servers.forEach(server => {
    server.close(() => {
      console.log('Terminating server');
    });
  });
  process.exit(0);
}

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);

mongoose.connect(Settings.mongoUri(), { useNewUrlParser: true });
