import { IAddress } from './../../../../../../core/models/addresses/address.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import {
  Component,
  effect,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { AddressService } from '../../../../../../core/services/address.service';
import { finalize } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-create-addresses',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './create-addresses.component.html',
  styleUrl: './create-addresses.component.css',
})
export class CreateAddressesComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly addressService: AddressService = inject(AddressService);

  isEditMode = input();
  addressToEdit = input<IAddress | null>();
  closeForm = output();
  updateAddresses = output<IAddress[]>();

  isSubmitting = signal(false);

  addressForm!: FormGroup;

  @ViewChild('addressFormView') addressFormView!: ElementRef;

  constructor() {
    this.initForm();

    effect(() => {
      const address = this.addressToEdit();

      if (this.isEditMode() && address && this.addressForm) {
        this.addressForm.patchValue({
          name: address.name,
          details: address.details,
          phone: address.phone,
          city: address.city,
        });
      }
    });
  }

  initForm() {
    this.addressForm = this.fb.group({
      name: ['', [Validators.required]],
      details: ['', [Validators.required, Validators.minLength(10)]],
      phone: ['', [Validators.required, Validators.pattern(/01[0125][0-9]{8}/)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  onCloseForm(): void {
    this.closeForm.emit();
  }

  onSubmit(): void {
    if (this.addressForm.valid) {
      this.isSubmitting.set(true);

      this.isEditMode() ? this.editAddress() : this.addAddress();
    } else {
      this.addressForm.markAllAsTouched();
    }
  }

  addAddress(): void {
    this.addressService
      .addAddress(this.addressForm.value)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (addresses) => {
          this.onCompleteTask(addresses);
        },
      });
  }

  editAddress(): void {
    this.addressService
      .updateAddress(this.addressToEdit()?._id!, this.addressForm.value)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (addresses) => {
          this.onCompleteTask(addresses);
        },
      });
  }

  onCompleteTask(addresses: IAddress[]): void {
    this.updateAddresses.emit(addresses);
    this.onCloseForm();
    this.addressForm.reset();
  }

  @HostListener('document:click', ['$event'])
  autoCloseForm(event: MouseEvent) {
    if (!this.addressFormView) return;

    const form = this.addressFormView.nativeElement.contains(event.target);
    if (!form) {
      this.onCloseForm();
    }
  }
}
