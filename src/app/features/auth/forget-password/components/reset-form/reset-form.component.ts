import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from './../../../../../core/services/auth.service';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ValidationService } from '../../../../../core/services/validation.service';
import { SendResetCodeComponent } from './components/send-reset-code/send-reset-code.component';
import { VerificationCodeComponent } from './components/verification-code/verification-code.component';
import { CreateNewPasswordComponent } from './components/create-new-password/create-new-password.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reset-form',
  imports: [
    SendResetCodeComponent,
    VerificationCodeComponent,
    CreateNewPasswordComponent,
    RouterLink, 
    TranslatePipe,
  ],
  templateUrl: './reset-form.component.html',
  styleUrl: './reset-form.component.css',
})
export class ResetFormComponent {
  stepNumber = signal(1);
  email = signal('');
  title = signal('Forgot Password?');
  description = signal("No worries, we'll send you a reset code");

  nextStepInit(email?: string): void {
    this.stepNumber.update((n) => n + 1);

    if (email) {
      this.email.set(email);
    }

    if (this.stepNumber() === 3) {
      this.title.set('Create New Password');
      this.description.set('Your new password must be different from previous passwords');
    }
  }

  backToSendCode(): void {
    this.stepNumber.set(1);
  }
}
