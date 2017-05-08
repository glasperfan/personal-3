import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import { Program } from 'app/models/Program';
import { EmailProgram } from 'app/models/EmailProgram';

@Injectable()
export class ProgramService {

  constructor(public http: Http) { }

  public getProgramById(id: string): Program {
    switch (id) {
      case 'email':
        return new EmailProgram(this.http);
      default:
        return undefined;
    }
  }
}
