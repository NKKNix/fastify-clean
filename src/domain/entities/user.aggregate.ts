import { UserEvent } from './user.events';

export class User {
  public userId = '';
  public name = '';

  constructor(events: UserEvent[]) {
    for (const event of events) {
      this.apply(event);
    }
  }

  apply(event: UserEvent) {
    switch (event.type) {
      case 'UserCreated':
        this.userId = event.payload.userId;
        this.name = event.payload.name;
        break;
      case 'UserUpdated':
        this.name = event.payload.name;
        break;
    }
  }

  static create(userId: string, name: string): UserEvent {
    return {
      type: 'UserCreated',
      payload: { userId, name },
      timestamp: Date.now(),
    };
  }

  changeName(name: string): UserEvent {
    return {
      type: 'UserUpdated',
      payload: { userId: this.userId, name },
      timestamp: Date.now(),
    };
  }
}
