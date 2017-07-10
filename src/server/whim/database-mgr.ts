import * as MongoDB from 'mongodb';
const MongoClient = MongoDB.MongoClient;

export class DatabaseManager {

  private readonly dbUrl: string;
  private dbObject: MongoDB.Db;

  constructor(url: string) {
    this.dbUrl = url;
  }

  public get isConnected(): boolean {
    return !!this.dbObject;
  }

  public get db(): MongoDB.Db {
    if (!this.dbObject) {
      throw new Error('Connect to the database first.');
    }
    return this.dbObject;
  }

  public connectToDb(): Promise<void> {
    return MongoClient.connect(this.dbUrl).then((db: MongoDB.Db) => {
      if (db) {
        this.dbObject = db;
        return Promise.resolve();
      }
      throw new Error(`Unable to connect to the database at url ${this.dbUrl}`);
    });
  }

  public getOrCreateCollection<T>(collectionName: string): MongoDB.Collection<T> {
    return this.dbObject.collection(collectionName, (err, col) => {
      if (!err) {
        console.log(err);
        return col;
      }
      return this.dbObject.createCollection<T>(collectionName);
    });
  }

};
