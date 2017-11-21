import * as process from 'process';

export type Environment = 'local' | 'prod';

process.env.NODE_ENV = <Environment>('local');

interface IWhimSettings {
  LocalUrl: string;
  LocalPort: number;
  RemoteUrl: string;
  RemotePort: string;
  MongoDBUrl: string;
  MongoDBPort: number;
  MongoDBDatabase: string;
  Email: {
    usr: string,
    pwd: string
  };
}

export const Settings: IWhimSettings = {
  LocalUrl: `http://localhost`,
  LocalPort: +process.env.PORT || 3000,
  RemoteUrl: 'TODO',
  RemotePort: 'TODO',
  MongoDBUrl: 'mongodb://localhost',
  MongoDBPort: 27017,
  MongoDBDatabase: 'whim',
  Email: {
    usr: 'zabriskiehugh@gmail.com',
    pwd: 'Vz7Pv2xAofoxeL'
  }
};

export const ServerEndpoint = getServerEndpoint(<Environment>process.env.NODE_ENV);

export function getServerEndpoint(mode: Environment): string {
  if (mode === 'local') {
    return `${Settings.LocalUrl}:${Settings.LocalPort}`;
  } else if (mode === 'prod') {
    return `${Settings.RemoteUrl}:${Settings.RemotePort}`;
  }
  throw new Error('Application mode not recognized.');
}

export function getDatabaseEndpoint(): string {
  return `${Settings.MongoDBUrl}:${Settings.MongoDBPort}/${Settings.MongoDBDatabase}`;
}
