// Get dependencies
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import { Request, Response } from 'express';
import * as express from 'express';
import { readFileSync } from 'fs';
import { createServer, Server as HttpServer } from 'http';
import { createServer as createHttpsServer, Server as HttpsServer } from 'https';
import * as mongoose from 'mongoose';
import * as path from 'path';
import SettingsDev from './settings';
import SettingsProd from './settings.prod';
import { UberController } from './controllers/UberController';
import { EmailController } from './controllers/EmailController';


const Settings = process.env.NODE_ENV === 'production' ? SettingsProd : SettingsDev;

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


// Controllers and routes
app.use('/email', new EmailController(Settings.email).LoadModule());
app.use('/uber', new UberController(Settings.uber).LoadModule());


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
  const httpsServer: HttpsServer = createHttpsServer(credentials, app);
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

mongoose.connect(Settings.mongoUri(), { useNewUrlParser: true }, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  } else {
    console.log('Successfully connected to MongoDB Atlas');
  }
});
