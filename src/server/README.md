### How to set up the server
1. Add a `settings.js` in this directory.
2. Add a `security` folder.
3. Run `openssl` to generate a self-signed certificate.
4. `nodemon server.js`

# How to set up an HTTPS client and server in AWS (S3, EC2)

This guide is for future me or whoever else might be trying to achieve the same thing. It took me somewhere between 8-15 hours to convert my site from HTTP to HTTPS (I lost count of the hours) due to my lack of experience with virtually every technology involved.
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

Most importantly, how do I enable local development in HTTP and a production deployment in HTTPS for both the client _and_ server? This require a dev/prod envrionment configuration that isn't perfect but does the trick.

So here's how I did it.

## Set up an Angular web app to web client

Setting up the web client in HTTPS requires two main components: routing requests to an HTTPS server, and installing a certificate for the domain associated with the app.

### Routing requests to an HTTPS server.

The key here is to flip between development and production endpoints based on the environment. Fortunately, Angular comes with the concept of environments, which make this fairly straightforward once you see how it works.

In `src/environments/`, create an `environment.ts` and `environment.prod.ts`.

```
// environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:6060'
};

// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://yoursecureserver.com'
};
```

Now in `angular.json` (used in Angular 6, instructions for migrating from the previous configuration file `.angular-cli.json` are here: https://stackoverflow.com/questions/50232874/angular-6-migration-angular-cli-json-to-angular-json), we'll add the following:

```
{
    "projects": {
        "YOUR_APP_NAME": {
            "architect": {
                "build": {
                    "configurations": {
                        "production": {
                            "fileReplacements": [
                                {
                                    "replace": "src/environments/environment.ts",
                                    "with": "src/environments/environment.prod.ts"
                                }
                            ],
                            "optimization": false, // don't minify/uglify
                            "outputHashing": "all",
                            "sourceMap": true, // keep TS files for dev debugging
                            "extractCss": true,
                            "namedChunks": false,
                            "aot": false, // could never get this to pass
                            "extractLicenses": true,
                            "vendorChunk": false,
                            "buildOptimizer": false // used with aot
                        }
                    }
                }
            }      
        }
    }
}
```

Great, so now when we run a production build:
```
ng build --configuration=production
```

The build replace `environment.ts` with `environment.prod.ts` and compile using those production settings. Of course you could do the same thing to make a staging environment,or just have different UI behavior based on dev and prod by referencing environment variables in `environment.ts`.

For my purposes it was sufficient to create an object that would provide the server endpoints to services that made back-end calls. To do this, create a ServerAPI object where you define your endpoints:
```
// src/app/model/ServerApi.ts
export class ServerAPI {
    constructor(private baseUrl: string) { }
    SendEmail: string = `${this.baseUrl}/email`;
    GetAllHistory: string = `${this.baseUrl}/uber/history/all`;
    GetUserToken: string = `${this.baseUrl}/uber/token`;
    GetUserProfile: string = `${this.baseUrl}/uber/me`;
}
```

We'll then create an instance of it to be provided to services. We'll use `environment.ts` to provide that `baseUrl` parameter in the constructor.

```
// src/app/app.module.ts
import { environment } from '../environments/environment';

@NgModule({
  imports: [...],
  declarations: [...],
  providers: [
    ...
    { provide: ServerAPI, useValue: new ServerAPI(environment.apiUrl) }
  ],
  bootstrap: [...]
})
export class AppModule { }
```

Note that in Angular, the argument to `{ provide: ... }` for a Provider cannot be an interface (so this couldn't be an IServerAPI). Inferfaces are just a Typescript concept, but don't compile to anything in JavaScript. Hence, we use a class, which nicely has a constructor we use to inject the server's endpoint.

Now to get ride history, we simply inject the ServerAPI class.

```
// app/service/uber-api.service.ts
export class UberApiService {
    constructor(private server: ServerAPI, private http: HttpClient) { }

    getAllRideHistory(): Observable<IHistoricalRideWithProduct[]> {
        return this.http.get(this.server.GetAllHistory, ...);
    }
}
```

A dev build (`ng serve` or `ng build`) will therefore target http://localhost:6060/email while the production build (`ng build --configuration=production) will target https://yoursecureserver.com/email.


### Providing a TLS1.1+ certificate for your Angular web app.

I'm assuming you've already set up your website in an S3 bucket like I did. To see how that works, check out Amazon's solid documentation on it here:
    
https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html

The steps are:
1. Request a public SHA-256 certificate.
1. Update Route53 with the records to serve the SSL certificates.
1. Create a CloudFront distribution zone to propagate your web app with the certificate.

This tutorial explains essentially how to do it (skip steps 1 & 2), but I'll clarify some key points:

https://medium.com/@itsmattburgess/hosting-a-https-website-using-aws-s3-and-cloudfront-ee6521df03b9

#### Create your SSL certificate in the `us-east-1` region.

In this [very hidden little Amazon doc page](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html), they explain:
> If you want to require HTTPS between viewers and CloudFront, you must change the AWS region to US East (N. Virginia) in the AWS Certificate Manager console before you request or import a certificate.

#### Certificates for yourdomain.com and www.yourdomain.com

Make sure to provide `yourdomain.com` and `*.yourdomain.com` as domain names.

#### Provide the full s3 bucket website endpoint

When selecting a CloudFront origin (what the CDN is serving from), don't use the auto-populated result for S3 bucket. This will cause CloudFront to treat S3 as a REST endpoint rather than a website endpoint. Instead, provide the full website address (the one S3 gives you when you enable hosting on the bucket.) It should look like this: <YOUR_S3_BUCKET_NAME>.s3-website-us-east-1.amazonaws.com, where "us-east-1" is the correct region for your bucket.

#### CloudFront root object
Make sure it's `index.html`.

#### To make quick changes, invalidate the CDN cache.

Make a change in CloudFront and want to see it propagated ASAP? Create an invalidation with the path "*". Look for the Invalidations tab in the CloudFront dashboard, then click Create Invalidation.

#### Setting up DNS records
You probably already have an A record for yourdomain.com that points to your S3 bucket. The instructions say to create an A record, but if you have one, just update the existing one. This effectively means, "when I get a request for `yourdomain.com`, point me to the CloudFront distribution endpoint instead of the S3 bucket."
