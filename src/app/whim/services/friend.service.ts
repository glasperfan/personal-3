import { Injectable } from '@angular/core';
import { IFriend } from '../models';

@Injectable()
export class FriendService {

  getAllFriends(): Promise<IFriend[]> {
    return Promise.resolve([
      { first: 'Preston', last: 'Hedrick' },
      { first: 'Maddie', last: 'Zabriskie' },
      { first: 'Will', last: 'Stuart' },
      { first: 'Dani', last: 'Keahi' },
      { first: 'Wentao', last: 'Xu' },
      { first: 'Sonali', last: 'Salgado' },
      { first: 'Megan', last: 'Taing' },
      { first: 'Forrest', last: 'Surles' }
    ]);
  }
}
