export const MELA_SESSION_LENGTH = 25; // minutes
export const MELA_BREAK_LENGTH = 5;
export const MELA_LONG_BREAK_LENGTH = 15;

export enum SessionType {
  Mela,
  Break,
  LongBreak
}

export interface IPlaylist {
  sessions: ISession[];
}

export interface ISession {
  type: SessionType;
  mood: IMood;
  icon: string;
  totalDuration: number; // in minutes
}

export interface IMood {
  displayName: string;
  key: string;
}

export class Session implements ISession {
  private static readonly pOfSpecialApple = 0.2;
  public readonly icon: string;
  public readonly totalDuration: number;

  static getDurationByType(type: SessionType) {
    switch (type) {
      case SessionType.Mela:
        return MELA_SESSION_LENGTH;
      case SessionType.Break:
        return MELA_BREAK_LENGTH;
      case SessionType.LongBreak:
        return MELA_LONG_BREAK_LENGTH;
      default:
        throw new Error('Unsupported session type');
    }
  }

  constructor(public mood: IMood, public type = SessionType.Mela) {
    this.icon = this.selectIcon();
    this.totalDuration = Session.getDurationByType(type);
  }

  private selectIcon(): string {
    return Math.random() < Session.pOfSpecialApple ? 'green-apple' : 'red-apple';
  }
}
