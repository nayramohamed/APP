import { IUser } from "./user.model";

export interface IUserResponse {
  message: string;
  user: IUser;
  token: string;
}

