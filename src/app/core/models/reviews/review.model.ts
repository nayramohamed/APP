import { IUser } from '../auth/user.model';

export interface IReview {
  _id: string;
  review: string;
  rating: number;
  product: string;
  user: IUser;
  createdAt: Date;
  updatedAt: Date;
}
