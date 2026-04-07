import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { inject, Injectable } from '@angular/core';
import { IAddress } from '../models/addresses/address.model';
import { IAddressesResponse } from '../models/addresses/addresses-response.model.';
import { IAddressResponse } from '../models/addresses/address-response.model';

@Injectable({
  providedIn: 'root',
})
export class AddressService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getAddresses(): Observable<IAddress[]> {
    return this.httpClient.get<IAddressesResponse>(`${this.baseUrl}/v1/addresses`).pipe(
      map((response) => {
        return response.data;
      }),
    );
  }

  getAddressById(addressId: string): Observable<IAddress> {
    return this.httpClient.get<IAddressResponse>(`${this.baseUrl}/v1/addresses/${addressId}`).pipe(
      map((response) => {
        return response.data;
      }),
    );
  }

  addAddress(addressForm: any): Observable<IAddress[]> {
    return this.httpClient
      .post<IAddressesResponse>(`${this.baseUrl}/v1/addresses`, addressForm)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }

  updateAddress(addressId: string, addressForm: any): Observable<IAddress[]> {
    return this.httpClient
      .post<IAddressesResponse>(`${this.baseUrl}/v1/addresses/${addressId}`, addressForm)
      .pipe(map((response) => response.data));
  }

  removeAddress(addressId: string): Observable<IAddress[]> {
    return this.httpClient
      .delete<IAddressesResponse>(`${this.baseUrl}/v1/addresses/${addressId}`)
      .pipe(
        map((response) => {
          return response.data;
        }),
      );
  }
}
