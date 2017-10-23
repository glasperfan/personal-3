import * as MongoDB from 'mongodb';
export interface IDatabaseManager {
  isConnected: boolean;
  getOrCreateCollection<T>(collectionName: string): MongoDB.Collection<T>;
  connectToDb(): Promise<void>;
}
