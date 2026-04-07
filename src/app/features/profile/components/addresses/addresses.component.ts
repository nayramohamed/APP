import { Component, inject, OnInit, signal } from '@angular/core';
import { EmptyAddressesComponent } from './components/empty-addresses/empty-addresses.component';
import { CreateAddressesComponent } from './components/create-addresses/create-addresses.component';
import { IAddress } from '../../../../core/models/addresses/address.model';
import { AddressService } from '../../../../core/services/address.service';
import { AddressCardComponent } from './components/address-card/address-card.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-addresses',
  imports: [EmptyAddressesComponent, CreateAddressesComponent, AddressCardComponent, TranslatePipe],
  templateUrl: './addresses.component.html',
  styleUrl: './addresses.component.css',
})
export class AddressesComponent implements OnInit {
  private readonly addressService = inject(AddressService);

  isAddForm = signal(false);
  isEditForm = signal(false);
  addresses = signal<IAddress[]>([]);
  toEditAddress = signal<IAddress | null>(null);

  ngOnInit(): void {
    this.loadAddresses();
  }

  loadAddresses(): void {
    this.addressService.getAddresses().subscribe({
      next: (addresses) => {
        this.addresses.set(addresses);
      },
    });
  }
  opendEditForm(address: IAddress): void {
    this.toEditAddress.set(address);
    this.isEditForm.set(true);
  }

  openAddForm(): void {
    this.isAddForm.set(true);
  }
  closeForm(): void {
    this.isAddForm.set(false);
    this.isEditForm.set(false);
  }

  updateAddresses(addresses: IAddress[]) {
    this.addresses.set(addresses);
  }
}
