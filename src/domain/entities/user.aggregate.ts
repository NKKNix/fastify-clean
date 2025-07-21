export interface Event {
  id: string;
  type: string;
  data: any;
  metadata?: any;
}

export class UserCreated implements Event {
  id: string;
  type = "UserCreated";
  data: { name: string; email: string };
  metadata?: any;

  constructor(id: string, name: string, email: string) {
    this.id = id;
    this.data = { name, email };
  }
}

export class UserNameUpdated implements Event {
  id: string;
  type = "UserNameUpdated";
  data: { newName: string };
  metadata?: any;

  constructor(id: string, newName: string) {
    this.id = id;
    this.data = { newName };
  }
}
