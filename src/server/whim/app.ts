import { IUser } from '../../app/whim/models';
import { DatabaseManager } from './database-mgr';
import { FriendManager } from './friend-mgr';
import { IdeaGenerator } from './idea-gen';
import { MethodManager } from './method-mgr';
import { WhimAPI as API } from './routes';
import * as path from 'path';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as logger from 'morgan';
import { v4 } from 'uuid';

interface IApp {
  Express: express.Application;
  DatabaseManager: DatabaseManager;
  FriendManager: FriendManager;
  MethodManager: MethodManager;
  IdeaGenerator: IdeaGenerator;
}

class App implements IApp {

  private express: express.Application;
  private databaseMgr: DatabaseManager;
  private friendMgr: FriendManager;
  private ideaGenerator: IdeaGenerator;
  private methodMgr: MethodManager;

  private readonly dbUrl: string;

  constructor(dbUrl: string) {
    this.dbUrl = dbUrl;
    this.express = express();
    this.middleware();
    this.routes();
    this.managers();
    this.connectToMongo();
  }

  public get Express(): express.Application { return this.express; }
  public get DatabaseManager(): DatabaseManager { return this.databaseMgr; }
  public get FriendManager(): FriendManager { return this.friendMgr; }
  public get MethodManager(): MethodManager { return this.methodMgr; }
  public get IdeaGenerator(): IdeaGenerator { return this.ideaGenerator; }

  public connectToMongo(): Promise<void> {
    return this.databaseMgr.connectToDb();
  }

  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }

  private routes(): void {
    const router = express.Router();

    router.get(API.GetIdeasForToday, (req, res, next) => {
      const user: IUser = { id: v4() };
      this.ideaGenerator.getIdeasForToday(user).then(ideas => res.json(ideas));
    });

    router.get('/friends', (req, res, next) => {
      const user: IUser = { id: v4() };
      this.friendMgr.saveInitialFriends(user)
        .then(_ => this.friendMgr.getAllFriends(user))
        .then(friends => res.json(friends));
    });

    this.express.use('/', router);
  }

  private managers(): void {
    this.databaseMgr = new DatabaseManager(this.dbUrl);
    this.friendMgr = new FriendManager(this.databaseMgr);
    this.methodMgr = new MethodManager(this.databaseMgr);
    this.ideaGenerator = new IdeaGenerator(this.friendMgr, this.methodMgr);
  }
}

/** SERVER */
const dbPort = 27017;
const dbUrl = `mongodb://localhost:${dbPort}/whim`;

const whimApp: App = new App(dbUrl);
const expressApp: express.Application = whimApp.Express;

const port = process.env.PORT || 3000;
expressApp.set('port', port);
const server = http.createServer(expressApp);
server.listen(port);

whimApp.connectToMongo().then(() => console.log(`Connected to MongoDB on port ${dbPort}.`));


