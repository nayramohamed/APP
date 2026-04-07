import { IReview } from './review.model';

export interface IReviewsResponse {
  results: number;
  metadata: IMetadata;
  data: IReview[];
}

interface IMetadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
}
