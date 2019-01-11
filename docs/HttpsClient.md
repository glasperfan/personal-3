# Go HTTPS: Securely Deploy Your Angular 6 App With AWS

In this tutorial, we'll assume you've already built your own Angular 6 application and hosted it on Amazon's S3 service. We also assume you have a custom domain (recommended, with routing configured in Route53) or plan to use the S3 website URL. Finally, we'll assume you have an [Express](https://expressjs.com/) server as your backend that you'd like also to serve over HTTPS. If you haven't, you can learn

- how to build a simple Angular 6 application on [angular.io](https://angular.io/tutorial)
- how to [serve your Angular app on S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html) or [buy a custom domain on AWS Route53](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/domain-register.html) (a `.com` domain is like $12/year)
- how to create a minimal Express server on [expressjs.com](https://expressjs.com)

_Note the HTTPS links._

Also, note that most of these practices will work for other versions of Angular, but likely with small changes. One of the most significant differences is that Angular's top-level config file is now named `angular.json` in Angular 6 when it used to be `.angular-cli.json`. See below for migration instructions.

### Develop locally, publish securely
Ultimately, the goal is to be able to switch between development in HTTP and deploy to production in HTTPS. You can already launch your app in development with `ng serve` and serve on `localhost:4200`, but by the end of this, you'll be able to serve it over HTTPS online in seconds.

The main tasks involved in configuring your app for HTTPS are to route your API calls based on your environment (dev vs. prod), and host your app with TLS certificate. The latter part is done through AWS, and invovles registering a certificate for your domain and then serving your app over a CDN that enforces HTTPS and provides your certificate.

## Using Environments to Toggle Between HTTP and HTTPS Servers

Angular comes with the concept of "environments", which are just JSON configurations that describe how to build your application. In our case, we want a development environment, where we specify our development server, and a production environment that points to our production server. We just specify the production environment when running a production build or don't specify it when serving it locally.

### Create a Production Environment

Ensure you have Angular CLI 6 installed. For example, use `yarn add @angular/cli@6.2.8 --global` to install version 6.2.8 in your global library.

Serve your environment locally as you normally would.
```
ng serve
```

In `src/environments/`, create an `environment.ts` and `environment.prod.ts`. Add an interface to ensure parity between environment configurations in `environment.ts`.

```
// environment.ts
export interface IEnvironment {
    production: string;
    apiUrl: string;
}

export const environment: IEnvironment = {
  production: false,
  apiUrl: 'http://localhost:6060'
};
```

```
// environment.prod.ts
export const environment: IEnvironment = {
  production: true,
  apiUrl: 'https://yoursecureserver.com'
};
```

Adapt the URLs above to fit your needs. In this case, I'm assuming my development Express server is being served locally on port 6060, while my production server runs somewhere else and is available at `https://yoursecureserver.com`. This can also be an HTTP server for now. 

Then in `angular.json`, we'll merge in the following configuration.

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
                            "aot": false, // setting this to true could cause you a lot of issues
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

If you still have `.angular-cli.json`, then you can migrate using
```
ng update @angular/cli --from=x.y.z --migrate-only
```
where `x.y.z` is your current CLI version. 

Great, we can now build your app with the production environment.
```
ng build --configuration=production
```

We can also serve it locally.
```
ng serve --configuration=production
```

Note that for `ng serve`, you have to specify the environment in the `serve` section along with the `build` section:
```
// under projects.YOUR_APP_NAME.architect
"serve": {
    "configurations": {
        "production": {
            "browserTarget": "YOUR_APP_NAME:build:production"
        }
    }
}
```

The `--configuration=production` option will replace `environment.ts` with `environment.prod.ts` and compile any references to `environment.ts` using those production settings. For extra credit, rename the environment above to `staging` and create a new `production` environment that enables build optimization like minifying and removes source maps.

### Use Your Environment To Set Your API

There are many ways to go about this, but a simple approach is to define your API endpoints in a class. To do this, create a ServerAPI class.
```
// src/app/model/ServerApi.ts
export class ServerAPI {
    constructor(private baseUrl: string) { }
    GetHeroes: string = `${this.baseUrl}/heroes/all`;
    CreateHero: string = `${this.baseUrl}/hero`;
    UpdateHero: string = `${this.baseUrl}/hero`;
    DeleteHero: string = `${this.baseUrl}/hero`;
    ...
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

Note that in Angular, the argument to `{ provide: ... }` for a Provider cannot be an interface (i.e. this couldn't be an interface like IServerAPI). Inferfaces don't exist at runtime, so that can't be used in Angular's dependency injection (DI). An easy alternative is a class, and we can use the constructor to inject the server's base endpoint.

Now to get all of your heroes, we simply inject the ServerAPI class.

```
// src/app/service/hero.service.ts
export class HeroService {
    constructor(private server: ServerAPI, private http: HttpClient) { }

    getAllHeroes(): Observable<IHero[]> {
        return this.http.get(this.server.GetHeroes, ...);
    }
}
```

The default build (`ng serve` or `ng build`) will therefore call http://localhost:6060/heroes/all while the production environment (`ng build --configuration=production) will cause the service to instead call https://yoursecureserver.com/heroes/all.


## Step 2: Register a TLS certificate for your domain.

Now that we can deploy our app and effortlessly point it at our server, our app is ready to be deployed over HTTPS. I'm assuming you're already [hosting your website on S3](https://docs.aws.amazon.com/AmazonS3/latest/dev/WebsiteHosting.html). We'll use Amazon's Route53 to handle all DNS routing and CloudFront as the CDN network that distributes our application with our certificate. between our users and our S3 bucket in order to enforce HTTPS. 

The steps involved are:
1. Request a public certificate (TLS 1.1+ SHA-256).
1. Update Route53 with the records to serve the SSL certificates.
1. Create a CloudFront distribution zone to propagate your web app with the certificate.

Fortunately, Matt Burgess already wrote up a great explanation of how to do this, so I won't repeat those steps. Check out his post [here](https://medium.com/@itsmattburgess/hosting-a-https-website-using-aws-s3-and-cloudfront-ee6521df03b9). Assuming you've already got a domain and S3 static website, you can skip to Step 3 of his guide. Once you've completed Step 5, you should now be able to view your app over HTTPS. Congrats!

However, before we start, there are several stumbling blocks worth pointing out.

### First off, what does TLS 1.1+ and SHA-256 even mean?

Heard of SSL? TLS is the successor to SSL. TLS 1.0 has well-known vulnerabilities, so a TLS 1.1, 1.2, or 1.3 ([defined in August 2018](https://casecurity.org/2018/04/10/tls-1-3-includes-improvements-to-security-and-performance/)) is all but required for a secure site.

SHA-256 is a hashing algorithm (SHA = Secure Hashing Algorithm) that produces a 256-bit hash. SHA-256 is actually one of a family of SHA-2 algorithms, which is the successor to the weaker SHA-1 algorithm. SHA-256 is one algorithm used in TLS certificates to generate a message authentication code (MAC), which verifies the identity of the certificate sender and ensure the certificate data hasn't changed.

### Create your TLS certificate in the `us-east-1` region.

In this [rather hidden Amazon documentation page](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html), AWS explains:
> If you want to require HTTPS between viewers and CloudFront, you must change the AWS region to US East (N. Virginia) in the AWS Certificate Manager console before you request or import a certificate.

#### Certificates for yourdomain.com and www.yourdomain.com

If you use subdomains like `www`, be sure to provide `yourdomain.com` and `*.yourdomain.com` when registering the certificate and specifying domains in CloudFront.

#### Provide the full S3 bucket website endpoint

When selecting a CloudFront origin (what the CDN is serving from), do NOT use the auto-populated result for your S3 website bucket. This will cause CloudFront to treat S3 as a REST endpoint rather than a static website endpoint. Instead, provide the full website address (the one S3 gives you when you enable hosting on the bucket.) It should look like this: <YOUR_S3_BUCKET_NAME>.s3-website-<REGION>.amazonaws.com, where `<YOUR_S3_BUCKET_NAME>` looks like `yourdomain.com` and `<REGION>` is the hosted S3 region, like "us-east-1".

#### CloudFront root object
Make sure it's `index.html`.

#### To make quick changes, invalidate the CDN cache.

To make a change in CloudFront and want to see it propagated immediately, create an "invalidation" to invalidate your edge node caches. Look for the Invalidations tab in the CloudFront dashboard, then click Create Invalidation, and type `*`.

#### Setting up DNS records
You probably already have an A record for yourdomain.com that points to your S3 bucket. The tutorial shows you how to create an A record, but if you already have one, just update it. This updated record will effectively say, "when I get a request for `yourdomain.com`, point me to the CloudFront distribution endpoint of the S3 bucket instead of pointing to the bucket directly."

#### Ensure a force-redirect from HTTP to HTTPS

This is a setting in the CloudFront zone. It's a required for a secure site verification by Google in the Chrome browser.

## Next Up: An HTTPS Express Server

Stay tuned on how to configure an Express Server to run on HTTPS!