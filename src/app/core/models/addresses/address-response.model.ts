import { IAddress } from './address.model';

export interface IAddressResponse {
  status: string;
  message: string;
  data: IAddress;
}
