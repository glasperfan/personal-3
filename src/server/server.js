// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const request = require('request-promise');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const Rides = require('./models/Rides');
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

function retrieveRideHistoryAsync(token, limit, offset) {
  console.log('Request retrieved');
  return request({
    method: 'GET', 
    uri: 'https://api.uber.com/v1.2/history',
    json: true, // Automatically parses the JSON string in the response
    qs: { limit: limit, offset: offset },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept-Language': 'en_US'
    }
  }).then(function (rides) {
    console.log('Retrieved ' + rides.history.length + ' rides');
    return Promise.resolve(rides);
  }).catch(function (err) {
    console.error('Failed to retrieve ride history...');
  });
}

function retrieveRideHistory(token, maxRidesPerQuery, ridesArr) {
  return retrieveRideHistoryAsync(token, maxRidesPerQuery, ridesArr.length).then(rides => {
    console.log('Retrieved response');
    if (rides.history.length) {
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
  return retrieveRideHistory(token, 50, []).then(allRides => {
    console.log('DONE: ' + allRides.length);
    return allRides;
  })
}

async function storeRides(rides, userId) {
  rides.forEach(r => r.user_id = userId);
  const rideObjects = rides.map(r => new Rides(r));
  return Rides.create(rideObjects, { ordered: false }).then((err, savedObjects) => {
    if (err) {
      Promise.reject(err);
    }
    return savedObjects;
  });
}

app.get('/uber/me', (req, res) => {
  console.log('getting rider profile');
  request.get('https://api.uber.com/v1.2/me', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${req.query.accessToken}`,
      'Accept-Language': 'en_US'
    }
  },
  (err, response, body) => {
    if (noError(err, response)) {
      const json = JSON.parse(body);
      console.log(json);
      res.send(json);
    } else {
      res.error('Failed to retrieve rider profile ' + (error ? error.error : '[no error message]'));
    }
  });
});

app.get('/uber/history/all', (req, res) => {
  const userId = req.query.userId;
  Rides.find({ user_id: userId }, (err, results) => {
    if (err) {
      console.error(err);
    } else if (!!results.length) {
      res.send(results);
    } else {
      retrieveAllRideHistory(req.query.accessToken)
        .then(rides => storeRides(rides, userId))
        .then(rides => res.send(rides));
    }
  });
});

app.get('/uber/history', (req, res) => {
  request.get('https://api.uber.com/v1.2/history', {
    qs: { limit: req.query.limit, offset: req.query.offset },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${req.query.accessToken}`,
      'Accept-Language': 'en_US'
    }
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
const port = process.env.PORT || '6060';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);
mongoose.connect(settings.mongoUri(), { useNewUrlParser: true });

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => {
  console.log(`API running on localhost:${port}`);
});
