import { ToastrService } from 'ngx-toastr';
import { Component, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../../../../../core/services/auth.service';
import { ValidationService } from '../../../../../../../core/services/validation.service';
import { IconComponent } from '../../../../../../../shared/components/icon/icon.component';
import { finalize } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-create-new-password',
  imports: [ReactiveFormsModule, IconComponent, TranslatePipe],
  templateUrl: './create-new-password.component.html',
  styleUrl: './create-new-password.component.css',
})
export class CreateNewPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly validationService: ValidationService = inject(ValidationService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly toastrService: ToastrService = inject(ToastrService);

  email = input<string>();
  onPasswordReset = output();

  isSubmiting = signal(false);
  isSubmittedOnce = signal(false);
  isNewPasswordShown = signal(false);
  isConfirmPasswordShown = signal(false);

  resetPasswordForm!: FormGroup;

  ngOnInit(): void {
    this.resetPasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, this.validationService.passwordValidator]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: [this.passwordMatchValidator],
      },
    );
  }

  passwordMatchValidator(gp: AbstractControl) {
    const newPassword = gp.get('newPassword')?.value;
    const confirmPassword = gp.get('confirmPassword')?.value;

    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  showPassword(type: 'new' | 'confirm'): void {
    if (type === 'new') {
      this.isNewPasswordShown.update((prev) => !prev);
    } else {
      this.isConfirmPasswordShown.update((prev) => !prev);
    }
  }

  resetPassword() {
    this.isSubmittedOnce.set(true);
    if (this.resetPasswordForm.valid) {
      this.isSubmiting.set(true);
      const email = this.email();
      const newPassword = this.resetPasswordForm.get('newPassword')?.value || '';

      this.authService
        .resetPassword(email!, newPassword)
        .pipe(finalize(() => this.isSubmiting.set(false)))
        .subscribe({
          next: (response) => {
            this.toastrService.success('Password reset successfully!');
            this.onPasswordReset.emit();
          },
          error: (error) => {
            console.error('Error resetting password:', error);
          },
        });
    }
  }
}
