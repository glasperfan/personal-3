## Set up an HTTPS web server

_these are just raw notes right now..._

The server is equally if not more complicated. This is in part because there's no nice and simple way to install a certificate. There's a way to do this a with a _self-signed_ certificate, which provides encryption, but browsers like Chrome will designate this server as "insecure". A self-signed certificate could be quickly created with the `openssl` library, and the key and cert created are then specified in the credentials when initializing the HTTPS server. An example of this is [here](https://www.npmjs.com/package/pem).

As explained [here](https://www.globalsign.com/en/ssl-information-center/dangers-self-signed-certificates/):
> While self-signed SSL Certificates also encrypt customers' log in and other personal account credentials, they prompt most web servers to display a security alert because the certificate was not verified by a trusted Certificate Authority. Often the alerts advise the visitor to abort browsing the page for security reasons.

As of Chrome 68 (June 2018), Chrome will display an insecure website warning if there are any connections to self-signed websites. 

The bottom line is, if you're requesting valuable data from a user, like giving someone your entire Uber ride history, you should provide an HTTPS connection via a trusted certificate.

### Foreword: set up your EC2 instance

I vaguely remember these steps but they were important. To create an EC2 instance for this purpose:

#### Create an instance with an Ubuntu image

It doesn't have to be Ubuntu, I just recommend it having tried the Amazon Linux fork and given up on their package manager `yum`.

#### Create an elastic IP

Under Elastic IPs, create an IP and then associate it with the instance. Feel free to add re-association (useful if you create an instance and then decide to destroy it).

#### Create or update your security group

The security group that includes your created instance should enable the following:
1. SSH on your IP address or anywhere (note that if you use your IP address, you may have to come back here to update this value if you sign in somewhere with a different IP).
1. Inbound rules should allows HTTP (80) requests and HTTPS (443) requests from anywhere.
1. Outbound rules should send requests anywhere. (This could be locked down to just your CloudFront edge nodes... I think? Not sure.)

#### Create an ssh keypair

Create the keypair and your private key should automatically download. Then to ssh use:
```
ssh -i <YOUR_KEY>.pem ubuntu@ec2-XX-XX-XX-XX.REGION.compute.amazonaws.com
```

#### Download the important packages

1. homebrew (optional, but useful for downloading other packages)
1. git
1. node
1. yarn (`sudo npm i -g yarn`)
1. nodemon

#### Start the server

Create a screen: `screen`

Run the server: `sudo node server.js` or `sudo nodemon server.js`

Sometimes, the node process seems to live on despite the server being killed. To fix this, find the process ID for the ports in use:
```
sudo lsof -iTCP -sTCP:LISTEN -P
```

Then kill the process(es):
```
sudo kill <PROCESS_ID>
```

#### Hide confidential files in settings.js

There are certainly better ways to do this, but I hide all secrets in a `src/server/settings.js` file that is never uploaded to git. I keep a separate `src/server/settings.prod.js` as well. These are akin to the environment files used in setting up the web client. In order to apply production settings, simply add the local `settings.prod.js` onto the server as `src/server/settings.js`. The local dev mode will reference the local `settings.js` and ignore the production version.

### Obtaining a trusted CA certificate with Let's Encrypt

[Let's Encrypt](https://letsencrypt.org/) is a free service for issuing trusted CA certificates. It uses the `certbot` from the Electronic Frontier Foundation (EFF), a well-known non-profit digital rights organization, to automatically issue certificates.

Here's the tutorial with all of the knowledge:

> https://itnext.io/node-express-letsencrypt-generate-a-free-ssl-certificate-and-run-an-https-server-in-5-minutes-a730fbe528ca

Some clarifications:

#### When you already have a running REST app

If you already have an app up and running with REST endpoint, the test code may not be what you need. When the bot tests the endpoint with the challenge string, it will try to make a GET request to it. To deal with this, we add a wildcard "catch-all" endpoint to catch all non-REST requests and serve static files based on the path.

From `src/server/server.js`:
```
const express = require('express');
const http = require('http');

const app = express();

app.use(express.static(__dirname + '/static', { dotfiles: 'allow' }));

// ... add routes like app.get(...)

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname + '/static' + req.path), { dotfiles: 'allow' });
});

const httpPort = settings.port;
const httpServer = http.createServer(app);
httpServer.listen(httpPort, () => {
    console.log(`HTTP server running on port ${httpPort}`);
});
```

#### On the challenge string

You may this miss, but the challenge _string_ is different from (but similar to) the challenge _path_. Look carefully at the text.

#### Test before you hit enter

Before you hit enter on the screen, which will trigger verification, make sure you get back an empty page with only the challenge string before proceeding. This would be visible at `http://<YOUR_SERVER_DOMAIN>/.well-knwon/acme-challenge/<your-challenge-path>`. Note the `http` and not `https`.

Once you finish the tutorial, you should be able to hit `https://yourdomain.com` as you hit your original HTTP version.

### But Chrome still says my website is not secure!!

This is a very annoying message that cost me hours of time to figure out. If you click on the "Not Secure" button by the URL, you should see the certificate is listed as valid. Huh, so how can it still be insecure? Thanks for not explaining, Chrome. (okay I guess they don't explain because they don't want to broadcast your server's vulnerabilities).

There's two steps still to do, although they're not immediately obvious. and you'll see what's left by using [whynopadlock.com](https://www.whynopadlock.com/), which is happy to broadcast your server's vulnerabilities.

There's most likely 2 flags, and we'll fix them now:

#### Force-redirect users from HTTP to HTTPS

If a user attempts to hit `http://`, we should redirect to `https://`. CloudFront does this for us automatically if configured in the web client.

We can achieve this but adding an HTTP server to our app that re-directs to HTTPS _only in production_.

```
const httpPort = settings.port;
const redirectHttpPort = 80;
const httpsPort = 443;

if (!settings.production) {
  const httpServer = http.createServer(app);
  httpServer.listen(httpPort, () => {
    console.log(`HTTP server running on port ${httpPort}`);
  });
}

if (settings.production) {
  const redirectApp = express();

  redirectApp.get('*', function(req, res) {  
    res.redirect('https://' + req.headers.host + req.url);
  });

  redirectApp.listen(redirectHttpPort);
  
  const privateKey = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/privkey.pem', 'utf8');
  const certificate = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/cert.pem', 'utf8');
  const ca = fs.readFileSync('/etc/letsencrypt/live/yourdomain.com/chain.pem', 'utf8');

  const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
    secureOptions: require('constants').SSL_OP_NO_TLSv1,
    pfx: certificate
  };
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(httpsPort, () => {
    console.log(`HTTPS server running on port ${httpsPort}`);
  });
}
```

Importantly, note that with this setup, we can seamlessly transition between development and production mode. The mode is toggled by a production key set in a separate `settings.js` file located in the same directory as `server.js`. In dev mode, we'll only instantiate an HTTP server on the port specified by `settings.port`. In production, we'll create an HTTP server AND an HTTPS server. The HTTPS server will be our app, while a simple HTTP server is spun up to redirect requests to HTTPS. 

#### Disable TLS v1

You already saw it in the code above:
```
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca,
    secureOptions: require('constants').SSL_OP_NO_TLSv1,
    pfx: certificate
};
```

As of June 30, 2018, all websites are required to upgrade to TLS 1.1 or 1.2 to maintain standard security. SSL (the predecessor to TLS) and TLS 1.0 have well-known vulnerabilities and should be avoided.

Source: [blog.pcistandards.org](https://blog.pcisecuritystandards.org/are-you-ready-for-30-june-2018-sayin-goodbye-to-ssl-early-tls)

Run the check at [whynopadlock.com](https://www.whynopadlock.com/) again. Now everything should pass. Congratulations, your webserver is now securely serving HTTPS connections!