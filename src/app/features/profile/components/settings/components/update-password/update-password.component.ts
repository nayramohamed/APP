import { ValidationService } from './../../../../../../core/services/validation.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from './../../../../../../core/services/auth.service';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize } from 'rxjs';
import { IconComponent } from '../../../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-update-password',
  imports: [IconComponent, ReactiveFormsModule, TranslatePipe],
  templateUrl: './update-password.component.html',
  styleUrl: './update-password.component.css',
})
export class UpdatePasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toastrService = inject(ToastrService);
  private readonly validationService = inject(ValidationService);

  isCurrentPasswordShown = signal(false);
  isNewPasswordShown = signal(false);
  isConfirmPasswordShown = signal(false);
  isSubmittingForm = signal(false);

  updateUserPasswordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required, Validators.minLength(2)]],
      password: ['', [Validators.required, this.validationService.passwordValidator]],
      rePassword: ['', [Validators.required]],
    },
    { validators: this.passwordMatchValidator },
  );

  toggleShowPassword(input: string): void {
    switch (input) {
      case 'current':
        this.isCurrentPasswordShown.update((state) => !state);
        break;
      case 'new':
        this.isNewPasswordShown.update((state) => !state);
        break;

      case 'confirm':
        this.isConfirmPasswordShown.update((state) => !state);

        break;
    }
  }

  passwordMatchValidator(gp: AbstractControl) {
    const password = gp.get('password')?.value;
    const rePassword = gp.get('rePassword')?.value;

    return password === rePassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.updateUserPasswordForm.valid) {
      this.isSubmittingForm.set(true);
      const newUserData = {
        currentPassword: this.updateUserPasswordForm.get('currentPassword')?.value,
        password: this.updateUserPasswordForm.get('password')?.value,
        rePassword: this.updateUserPasswordForm.get('rePassword')?.value,
      };

      this.authService
        .updateUserPassword(newUserData)
        .pipe(finalize(() => this.isSubmittingForm.set(false)))
        .subscribe({
          next: () => {
            this.toastrService.success('Password has been updated.');
            this.updateUserPasswordForm.reset();
          },
          error: (error) => {
            this.toastrService.error('Validation errors');
          },
        });
    } else {
      this.updateUserPasswordForm.markAllAsTouched();
    }
  }
}
