import { Component, inject, input, output } from '@angular/core';
import { IAddress } from '../../../../../../core/models/addresses/address.model';
import { AddressService } from '../../../../../../core/services/address.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-address-card',
  imports: [],
  templateUrl: './address-card.component.html',
  styleUrl: './address-card.component.css',
})
export class AddressCardComponent {
  private readonly addressService = inject(AddressService);
  address = input<IAddress>();

  openEditForm = output<IAddress>();
  updateAddresses = output<IAddress[]>();

  onOpenEditForm(): void {
    this.openEditForm.emit(this.address()!);
  }

  removeAddress(): void {
    this.addressService.removeAddress(this.address()?._id!).subscribe({
      next: (addresses) => {
        this.updateAddresses.emit(addresses);
      },
    });
  }

  showRemoveDialog() {
    Swal.fire({
      icon: 'warning',
      title: 'Remove Address?',
      text: `Remove this address ${this.address()?.name} ?`,
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonText: 'Remove',

      buttonsStyling: false,

      customClass: {
        icon: 'text-xs',
        popup: 'rounded-2xl p-6',
        title: 'text-sm font-bold text-gray-800',
        htmlContainer: 'text-gray-500',
        confirmButton:
          'bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg font-semibold cursor-pointer order-2',
        cancelButton: 'bg-gray-200 text-gray-700 px-5 py-2 rounded-lg mr-2 cursor-pointer',
      },
    }).then((result) => {
      if (result.isConfirmed)
        this.removeAddress();

    });
  }
}
