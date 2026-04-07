import { Component, inject, input, output, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../../../../core/services/auth.service';
import { finalize } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-verification-code',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './verification-code.component.html',
  styleUrl: './verification-code.component.css',
})
export class VerificationCodeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService: AuthService = inject(AuthService);
  private readonly toastrService: ToastrService = inject(ToastrService);

  email = input<string>();
  codeVerified = output();
  backToSendCode = output();

  verifyCodeForm!: FormGroup;
  isSubmiting = signal(false);
  submittedOnce = signal(false);

  ngOnInit(): void {
    this.verifyCodeForm = this.fb.group({
      resetCode: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
    });
  }

  verifyCode() {
    this.submittedOnce.set(true);

    if (this.verifyCodeForm.valid) {
      this.isSubmiting.set(true);
      const resetCode = this.verifyCodeForm.get('resetCode')?.value || '';

      this.authService
        .verifyCode(resetCode)
        .pipe(finalize(() => this.isSubmiting.set(false)))
        .subscribe({
          next: (response) => {
            this.toastrService.success('Code verified!');
            this.codeVerified.emit();
          },
          error: (error) => {
            if (error.status === 400) {
              this.toastrService.error('Reset code is invalid or has expired');
              return;
            }
            console.error('Error verifying code:', error);
          },
        });
    }
  }

  resendCode(): void {
    const email = this.email() || '';
    this.isSubmiting.set(true);
    this.authService
      .sendCode(email)
      .pipe(finalize(() => this.isSubmiting.set(false)))
      .subscribe({
        next: (response) => {
          this.toastrService.success('New code sent!');
        },
        error: (error) => {
          this.toastrService.error('Failed to resend reset code. Please try again later.');
        },
      });
  }

  navigateToSendCode(): void {
    this.backToSendCode.emit();
  }
}
