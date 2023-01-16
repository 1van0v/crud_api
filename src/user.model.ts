export interface User {
  hobbies: string[];
  age: number;
  username: string;
  id: string;
}

export type CreateUser = Omit<User, 'id'>

export type UpdateUser = Partial<CreateUser>;
