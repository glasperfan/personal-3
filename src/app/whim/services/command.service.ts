import { AccountService } from './account.service';
import { HttpService } from './http.service';
import { IParseResult, WhimAPI } from '../models';
import { Injectable } from '@angular/core';
import { Observable, Subject, BehaviorSubject } from 'rxjs/Rx';

@Injectable()
export class CommandService {

  public results$: Observable<IParseResult[]>;
  public requests$: Subject<string>;
  private _results$: BehaviorSubject<IParseResult[]> = new BehaviorSubject<IParseResult[]>([]);
  private _currentUserId: string;

  constructor(private http: HttpService, private accountService: AccountService) {
    this.requests$ = new Subject<string>();
    this.results$ = this._results$.asObservable();
    this.accountService.currentUser$.then(user => this._currentUserId = user._id);

    this.requests$
      .debounceTime(400)
      .switchMap(term => this.sendParseRequest(term))
      .subscribe(results => this._results$.next(results));
  }

  private sendParseRequest(searchTerm: string): Observable<IParseResult[]> {
    if (!searchTerm || !searchTerm.length) {
      return Observable.of([]);
    }
    return Observable.fromPromise(
      this.http.get<IParseResult[]>(WhimAPI.ParseSearch, { userId: this._currentUserId, searchTerm: searchTerm })
    );
  }
}
