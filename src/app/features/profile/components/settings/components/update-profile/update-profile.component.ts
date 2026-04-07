import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../../../core/services/auth.service';
import { TitleCasePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { EGYPTIAN_PHONE_PATTERN } from '../../../../../../core/сonstants/validators.constant';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-update-profile',
  imports: [TitleCasePipe, ReactiveFormsModule, TranslatePipe],
  templateUrl: './update-profile.component.html',
  styleUrl: './update-profile.component.css',
})
export class UpdateProfileComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);

  unexpectedError = signal(false);
  isSubmittingForm = signal(false);
  currentUser = toSignal(this.authService.currentUser$, {
    initialValue: null,
  });

  updateProfileForm: FormGroup = this.fb.group({
    name: [this.currentUser()?.name, [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(EGYPTIAN_PHONE_PATTERN)]],
  });

  onSubmit() {
    if (this.updateProfileForm.valid) {
      this.isSubmittingForm.set(true);
      const newUserData = {
        name: this.updateProfileForm.get('name')?.value,
        email: this.updateProfileForm.get('email')?.value,
        phone: this.updateProfileForm.get('phone')?.value,
      };

      this.authService
        .updateUserData(newUserData)
        .pipe(finalize(() => this.isSubmittingForm.set(false)))
        .subscribe({
          next: (response) => {
            this.toastrService.success('Profile has been updated.');
            this.authService.setUser(response.user);
            this.updateProfileForm.reset({ name: this.currentUser()?.name });
          },
          error: (error) => {
            if (error.status === 0) {
              this.unexpectedError.set(true);
            }

            if (error.error.errors.msg === 'E-mail already in use') {
              this.updateProfileForm.get('email')?.setErrors({ emailTaken: true });
            }

            this.toastrService.error('Validation errors');
          },
        });
    } else {
      this.updateProfileForm.markAllAsTouched();
    }
  }
}
