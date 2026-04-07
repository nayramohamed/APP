import { IAddress } from './address.model';

export interface IAddressesResponse {
  status: string;
  message: string;
  data: IAddress[];
}
