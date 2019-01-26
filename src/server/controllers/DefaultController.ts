import * as express from 'express';
import { Express } from 'express';


export abstract class DefaultController {
    protected readonly subApp: Express;

    constructor() {
        this.subApp = express();
    }

    abstract registerRoutes(subApp: Express): void;

    public LoadModule = (): Express => {
        this.registerRoutes(this.subApp);
        return this.subApp;
    }
}
