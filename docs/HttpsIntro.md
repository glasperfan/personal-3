# Go HTTPS - Angular 6 Client on AWS

Articles abound on the benefits of HTTPS. It protects your users from intruders who attempt to listen on traffic between their browsers and your servers. It improves your search rankings. It increases consumer confidence and overall traffic. And it's free! In fact, you may have stumbled on this post because you _have_ to serve your client over HTTPS to enable other capabilities. Some APIs, for example, require consumer applications to use HTTPS or else API authorization will fail. And as of Chrome 68 (released July 2018), all of the following actions will mark your site as insecure:

- Entering data (think `<input />`, `<textarea />`) on HTTP pages
- Serving the app over HTTPS but communicating with _any_ HTTP endpoints

In Chrome 70 (October 2018), Chrome colors this warning [in an ominous red](https://blog.chromium.org/2018/05/evolving-chromes-security-indicators.html), ensuring users won't miss it. Oh, and in Chrome 69 (September), they removed the green "Secure" label on HTTPS sites, to suggest that "the web is a safe place is default". Sure. But Google is successfully using Chrome's 60+% of the browser market share as a forcing function to migrate everyone to HTTPS.

However, HTTPS being free doesn't mean it's always fun or easy to set up. I spent many hours learning how to deploy a basic production client and server in HTTPS instead of HTTP. While this guide is written specifically for an Angular client and an Express server hosted in AWS, many of these steps are easily transferable to other frameworks and servers. I think it's just more useful to have that works 100% for one configuration rather than a general one that doesn't fully work for anyone.

Specifically, here are the services and frameworks involved:
- AWS Services
    - Cloudfront
    - EC2
    - S3
    - Route53
    - Amazon Certificate Manager (ACM)
- SSL/TLS
    - Let's Encrypt
    - openssl
- System
    - Ubuntu
    - Angular 6+
    - Angular CLI 6+

Finally, we'll go through how to seamlessly switch between development and production mode, so you can rapidly iterate locally and then immediately deploy your changes. Deploying your client or server can be a single command.

1. [Go HTTPS: Deploying Your Angular 6 App](HttpsClient.md)
2. [Go HTTPS: Deploying Your Node.js Express Server](HttpsServer.md)