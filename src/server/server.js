// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const cors = require('cors');
const request = require('request');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
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
    from: `"${name}" <${email}>`, // sender address
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

app.post('/uber/token', (req, res) => {
  request.post('https://login.uber.com/oauth/v2/token',
    { form: { // must be form - it's url-encoded data
        client_id: settings.uber.clientId,
        client_secret: settings.uber.clientSecret,
        redirect_uri: 'http://localhost:4200/footprint', // must match what's in the uber_dashboard
        grant_type: 'authorization_code',
        scope: 'history',
        code: req.body.authorizationCode
      }
    },
    function (error, response, body) {
      res.cookie()  
      console.log(response.statusCode);
        console.log(response.body);
        if (!error && response.statusCode == 200) {
            console.log(body);
        } else {
          console.log(error);
        }
    }
  );
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

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`API running on localhost:${port}`));
