export type UserEvent =
  | {
      type: 'UserCreated';
      payload: { userId: string; name: string };
      timestamp: number;
    }
  | {
      type: 'UserUpdated';
      payload: { userId: string; name: string };
      timestamp: number;
    };

export type UserEventHandler = (event: UserEvent) => void;