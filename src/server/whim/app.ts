import {
    IAddEventsArguments,
    IAddFriendsArguments,
    IError,
    IGetAllFriendsArguments,
    IGetAvailableFriendsArguments,
    IGetEventsParams,
    IGetFriendArguments,
    IGetIdeasForDateParams,
    IGetUserParams,
    ILoginArguments,
    IResponse,
    ISignupArguments,
    IUser,
    WhimAPI,
    WhimError,
} from './models';
import { DatabaseManager } from './database-mgr';
import { FriendManager } from './friend-mgr';
import { HistoryManager } from './history-mgr';
import { IdeaGenerator } from './idea-gen';
import { CalendarManager } from './calendar-mgr';
import { MethodManager } from './method-mgr';
import { UserManager } from './user-mgr';
import * as bodyParser from 'body-parser';
import * as express from 'express';
import * as http from 'http';
import * as logger from 'morgan';
import * as path from 'path';
import * as cors from 'cors';
import { v4 } from 'uuid';
import { Settings } from './settings';

interface IApp {
  Express: express.Application;
  DatabaseManager: DatabaseManager;
  FriendManager: FriendManager;
  MethodManager: MethodManager;
  UserManager: UserManager;
  CalendarManager: CalendarManager;
  HistoryManager: HistoryManager;
  IdeaGenerator: IdeaGenerator;
}

function errorHandler(err: IError, res: express.Response): void {
  if (err) {
    res.status(err.httpCode);
    res.send(<IResponse>{ error: err });
  }
};

class App implements IApp {

  public userMgr: UserManager;
  private express: express.Application;
  private databaseMgr: DatabaseManager;
  private friendMgr: FriendManager;
  private ideaGenerator: IdeaGenerator;
  private calendarMgr: CalendarManager;
  private methodMgr: MethodManager;
  private historyMgr: HistoryManager;

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
  public get UserManager(): UserManager { return this.userMgr; }
  public get CalendarManager(): CalendarManager { return this.calendarMgr; }
  public get HistoryManager(): HistoryManager { return this.historyMgr; }
  public get IdeaGenerator(): IdeaGenerator { return this.ideaGenerator; }

  public connectToMongo(): Promise<void> {
    return this.databaseMgr.connectToDb();
  }

  private middleware(): void {
    this.express.use(
      // Allow CORS
      cors({
        origin: '*',
        credentials: true,
        methods: 'GET, POST, PUT, DELETE',
        allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json'
      }),
      // logging
      logger('dev'),
      // parse JSON
      bodyParser.json(),
      bodyParser.urlencoded({ extended: false })
    );
  }

  private routes(): void {
    const router = express.Router();

    router.post(WhimAPI.Signup, (req, res, next) => {
      const args: ISignupArguments = req.body;
      this.userMgr.createUser(args)
        .then(newUser => res.send(newUser))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.post(WhimAPI.Login, (req, res, next) => {
      const args: ILoginArguments = req.body;
      this.userMgr.authenticateUser(args)
        .then(authenticatedUser => res.send(authenticatedUser))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.get(WhimAPI.GetUser, (req, res, next) => {
      const params: IGetUserParams = req.query;
      if ((params._id && params.email) || (!params._id && !params.email)) {
        errorHandler(new WhimError('Either _id or email should be used for the query.'), res);
      }
      const getUser = !!params._id ? this.userMgr.getUser(params._id) : this.userMgr.getUserByEmail(params.email);
      return getUser.then(user => res.send(user))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.post(WhimAPI.AddFriends, (req, res, next) => {
      const args: IAddFriendsArguments = req.body;
      this.friendMgr.createFriends(args)
        .then(newFriends => res.send(newFriends))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.get(WhimAPI.GetAllFriends, (req, res, next) => {
      // TODO: unimplemented, rename GetFriends
      const args: IGetAllFriendsArguments = req.body;
      this.friendMgr.getAllFriends(args.userId)
        .then(friends => res.json(friends))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.get(WhimAPI.GetAvailableFriends, (req, res, next) => {
      // TODO: merge with GetFriends
      const args: IGetAvailableFriendsArguments = req.body;
      this.friendMgr.getAvailableFriends(args.userId)
        .then(friends => res.json(friends))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.get(WhimAPI.GetFriend, (req, res, next) => {
        const args: IGetFriendArguments = req.body;
        this.friendMgr.getRemovedFriends(args.userId)
          .then(friends => res.json(friends))
          .catch((error: IError) => errorHandler(error, res));
    });

    router.get(WhimAPI.GetIdeasForDate, (req, res, next) => {
      req.query.timestamp = Number(req.query.timestamp);
      const params: IGetIdeasForDateParams = req.query;
      this.ideaGenerator.getIdeasForDate(params.userId, new Date(Number(params.timestamp)))
        .then(ideas => res.json(ideas))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.get(WhimAPI.GetEvents, (req, res, next) => {
      req.query.includeArchived = !!req.query.includeArchived;
      const params: IGetEventsParams = req.query;
      this.calendarMgr.getEvents(params.userId, params.includeArchived)
        .then(events => res.json(events))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.post(WhimAPI.AddEvents, (req, res, next) => {
      const args: IAddEventsArguments = req.body;
      this.calendarMgr.createEvents(args)
        .then(events => res.json(events))
        .catch((error: IError) => errorHandler(error, res));
    });

    this.express.use('/', router);
  }

  private managers(): void {
    this.databaseMgr = new DatabaseManager(this.dbUrl);
    this.methodMgr = new MethodManager();
    this.historyMgr = new HistoryManager();
    this.userMgr = new UserManager(this.databaseMgr);
    this.friendMgr = new FriendManager(this.databaseMgr);
    this.calendarMgr = new CalendarManager(this.databaseMgr);
    this.ideaGenerator = new IdeaGenerator(this.friendMgr, this.methodMgr, this.historyMgr);
  }
}

/** SERVER */
const dbPort = 27017;
const dbUrl = `mongodb://localhost:${dbPort}/whim`;

const whimApp: App = new App(dbUrl);
const expressApp: express.Application = whimApp.Express;

const port = Settings.LocalPort;
expressApp.set('port', port);
const server = http.createServer(expressApp);
server.listen(port);

whimApp.connectToMongo()
  .then(() => console.log(`Connected to MongoDB on port ${dbPort}.`))
  .catch(_ => 'Unable to connect to MongoDB. Is the Mongo daemon running?');


