import * as MongoDB from 'mongodb';

export interface ICollectionManager<T, U, V> {
  Indexes: { [column: string]: string | number };
  UserId: string;
  CollectionToken: string;
  Collection: MongoDB.Collection<T>;
  GetObjects(): Promise<T[]>;
  CreateObjects(args: U[]): Promise<T[]>;
  UpdateObject(arg: V): Promise<T>;
  DeleteObject(arg: V): Promise<void>;
}
