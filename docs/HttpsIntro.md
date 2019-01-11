# Go HTTPS - Angular 6 Client on AWS

## Intro

Articles abound on the benefits of HTTPS. It protects your users from intruders who attempt to listen on traffic between their browsers and your servers. It improves your search rankings. It increases consumer confidence and overall traffic. And it's free! In fact, you may have stumbled on this post because you _have_ to serve your client over HTTPS to enable other capabilities. Some APIs, for example, require consumer applications to use HTTPS or else API authorization will fail. And as of Chrome 68 (released July 2018), all of the following actions will mark your site as insecure:

- Entering data (think `<input />`, `<textarea />`) on HTTP pages
- Serving the app over HTTPS but communicating with _any_ HTTP endpoints

In Chrome 70 (October 2018), Chrome colors this warning [in an ominous red](https://blog.chromium.org/2018/05/evolving-chromes-security-indicators.html), ensuring users won't miss it. Oh, and in Chrome 69 (September), they removed the green "Secure" label on HTTPS sites, to suggest that "the web is a safe place is default". Sure. But Google is successfully using Chrome's 60+% of the browser market share as a forcing function to migrate everyone to HTTPS.

## A different kind of guide

However, just because HTTPS is "free" doesn't mean it's always fun or easy to set up. I spent a while learning how to deploy a basic production client and server in HTTPS instead of HTTP. Ultimately, I tried to encapsulate that knowledge into this guide. While this guide is written specifically for my setup - an Angular 6 application and an Express server hosted in AWS - many of these steps are easily transferable to other frameworks and servers. I think it's more useful to have that works 100% for one setup rather than a general one that doesn't fully work for anyone. Plus, I've mixed in useful side knowledge (what is a TLS certificate?) and several troubleshooting tips that could save you some time.

Specifically, here are the services and frameworks involved:
- AWS Services
    - [Cloudfront](https://aws.amazon.com/cloudfront/)
    - [EC2](https://aws.amazon.com/ec2/)
    - [S3](https://aws.amazon.com/s3/)
    - [Route53](https://aws.amazon.com/route53/)
    - [Amazon Certificate Manager (ACM)](https://aws.amazon.com/certificate-manager/)
- Database _(optional)_ 
    - [MongoDB](https://www.mongodb.com/cloud/atlas)
    - [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
    - [Mongoose](https://mongoosejs.com)
- SSL/TLS
    - [Let's Encrypt](https://letsencrypt.org/)
    - [openssl](https://www.openssl.org/)
- OS
    - [Ubuntu (18.04.1 LTS "Bionic Beaver")](http://releases.ubuntu.com/18.04/)
- Frameworks
    - [Angular 6](https://angular.io)

## Make production deployment painless

Finally, we'll go through how to seamlessly switch between development and production mode, so you can rapidly iterate locally and then immediately deploy your changes. Deploying your client or server can be a single command.

## Table of Contents

1. [Go HTTPS: Deploying Your Angular 6 App](HttpsClient.md)
2. [Go HTTPS: Deploying Your Node.js Express Server](HttpsServer.md)
3. [Appendix: MongoDB Atlas With Your HTTPS Server](HttpsMongo.md)