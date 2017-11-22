import { ICalendarManager } from '../managers/contracts/ICalendarManager';
import { IFriendManager } from '../managers/contracts/IFriendManager';
import { ICommandParser } from '../parsers/commands/contracts/ICommandParser';
import {
    IDeleteEventsArguments,
    IDeleteFriendsArguments,
    IGetSettingsArguments,
    IUpdateSettingsArguments,
} from '../models/api';
import { IDateParser } from '../parsers/dates/contracts/IDateParser';
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
    IParseSearchArguments,
    IResponse,
    ISignupArguments,
    IUser,
    WhimAPI,
    WhimError,
    IFriend,
    IEvent,
    IUserSettings,
} from '../models';
import {
  CalendarManager,
  DatabaseManager,
  FriendManager,
  HistoryManager,
  MethodManager,
  UserManager,
  EmailManager,
  SettingsManager
} from '../managers';
import { IdeaGenerator } from '../generators';
import { CommandParser, DateParser } from '../parsers';

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
  CalendarManager: ICalendarManager;
  DatabaseManager: DatabaseManager;
  FriendManager: IFriendManager;
  HistoryManager: HistoryManager;
  MethodManager: MethodManager;
  UserManager: UserManager;
  IdeaGenerator: IdeaGenerator;
  CommandParser: ICommandParser;
  DateParser: IDateParser;
  EmailManager: EmailManager;
  SettingsManager: SettingsManager;
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
  private friendMgr: IFriendManager;
  private ideaGenerator: IdeaGenerator;
  private calendarMgr: ICalendarManager;
  private methodMgr: MethodManager;
  private historyMgr: HistoryManager;
  private commandParser: ICommandParser;
  private dateParser: IDateParser;
  private emailMgr: EmailManager;
  private settingsMgr: SettingsManager;

  private readonly dbUrl: string;
  private readonly dbPort: number;

  constructor(dbUrl: string, dbPort: number) {
    this.dbUrl = dbUrl;
    this.dbPort = dbPort;
    this.express = express();
    this.middleware();
    this.routes();
    this.managers();
  }

  public get Express(): express.Application { return this.express; }
  public get DatabaseManager(): DatabaseManager { return this.databaseMgr; }
  public get FriendManager(): IFriendManager { return this.friendMgr; }
  public get MethodManager(): MethodManager { return this.methodMgr; }
  public get UserManager(): UserManager { return this.userMgr; }
  public get CalendarManager(): ICalendarManager { return this.calendarMgr; }
  public get HistoryManager(): HistoryManager { return this.historyMgr; }
  public get IdeaGenerator(): IdeaGenerator { return this.ideaGenerator; }
  public get CommandParser(): ICommandParser { return this.commandParser; }
  public get DateParser(): IDateParser { return this.dateParser; }
  public get EmailManager(): EmailManager { return this.emailMgr; }
  public get SettingsManager(): SettingsManager { return this.settingsMgr; }

  public connectToMongo(): Promise<void> {
    return this.databaseMgr.connectToDb();
  }

  public boot(): void {
    this.emailMgr.initiateEmailCronJobs();
    console.log(`Connected to MongoDB on port ${this.dbPort}.`);
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

    router.get(WhimAPI.GetFriend, (req, res, next) => {
      const args: IGetFriendArguments = req.body;
      this.friendMgr.getFriend(args)
        .then(friend => res.json(friend))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.put(WhimAPI.UpdateFriends, (req, res, next) => {
      const args: IFriend[] = req.body;
      this.friendMgr.updateFriends(args)
        .then(friends => res.json(friends))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.post(WhimAPI.DeleteFriends, (req, res, next) => {
      const args: IDeleteFriendsArguments = req.body;
      this.friendMgr.deleteFriends(args)
        .then(_ => res.json(undefined))
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

    router.post(WhimAPI.DeleteEvents, (req, res, next) => {
      const args: IDeleteEventsArguments = req.body;
      this.calendarMgr.deleteEvents(args)
        .then(_ => res.json(undefined))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.put(WhimAPI.UpdateEvents, (req, res, next) => {
      const args: IEvent[] = req.body;
      this.calendarMgr.updateEvents(args)
        .then(_ => res.json({ successful: args.length, failed: 0 }))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.get(WhimAPI.ParseSearch, (req, res, next) => {
      const params: IParseSearchArguments = req.query;
      this.commandParser.parseForSearchResults(params.searchTerm, params.userId)
        .then(results => res.json(results))
        .catch((error: IError) => errorHandler(error, res));
    });

    router.get(WhimAPI.GetSettings, (req, res, next) => {
      const params: IGetSettingsArguments = req.query;
      this.settingsMgr.getUserSettings(params.userId)
        .then((settings: IUserSettings) => {
          return res.json(settings);
        })
        .catch((error: IError) => errorHandler(error, res));
    });

    router.put(WhimAPI.UpdateSettings, (req, res, next) => {
      const args: IUpdateSettingsArguments = req.body;
      this.settingsMgr.updateUserSettings(args.userId, args.settings)
        .then(results => res.json())
        .catch((error: IError) => errorHandler(error, res));
    });

    this.express.use('/', router);
  }

  private managers(): void {
    this.dateParser = new DateParser();
    this.databaseMgr = new DatabaseManager(this.dbUrl);
    this.methodMgr = new MethodManager();
    this.historyMgr = new HistoryManager();
    this.userMgr = new UserManager(this.databaseMgr);
    this.friendMgr = new FriendManager(this.databaseMgr, this.dateParser);
    this.calendarMgr = new CalendarManager(this.databaseMgr, this.dateParser);
    this.ideaGenerator = new IdeaGenerator(this.friendMgr, this.methodMgr, this.historyMgr);
    this.commandParser = new CommandParser(this.friendMgr, this.calendarMgr);
    this.emailMgr = new EmailManager(this.userMgr, this.calendarMgr);
    this.settingsMgr = new SettingsManager(this.userMgr);
  }
}

/** SERVER */
const dbPort = 27017;
const dbUrl = `mongodb://localhost:${dbPort}/whim`;

const whimApp: App = new App(dbUrl, dbPort);
const expressApp: express.Application = whimApp.Express;

const port = Settings.LocalPort;
expressApp.set('port', port);
const server = http.createServer(expressApp);
server.listen(port);

whimApp.connectToMongo()
  .then(() => whimApp.boot())
  .catch((err: IError) => {
    console.log(err.errorMessage);
    process.exit(1);
  });


