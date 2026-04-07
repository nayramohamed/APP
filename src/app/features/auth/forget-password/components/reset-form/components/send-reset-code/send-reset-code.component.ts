import { Component, inject, input, output, signal } from '@angular/core';
import { AuthService } from '../../../../../../../core/services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-send-reset-code',
  imports: [ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './send-reset-code.component.html',
  styleUrl: './send-reset-code.component.css',
})
export class SendResetCodeComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService: AuthService = inject(AuthService);
  private readonly toastrService: ToastrService = inject(ToastrService);

  email = input<string>();
  codeSent = output<string>();

  submittedOnce = signal(false);
  isSubmiting = signal(false);

  sendCodeForm!: FormGroup;

  ngOnInit(): void {
    this.sendCodeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.sendCodeForm.get('email')?.setValue(this.email());
  }

  sendCode() {
    this.submittedOnce.set(true);
    if (this.sendCodeForm.valid) {
      this.isSubmiting.set(true);
      const email = this.sendCodeForm.get('email')?.value || '';

      this.authService
        .sendCode(email)
        .pipe(finalize(() => this.isSubmiting.set(false)))
        .subscribe({
          next: (response) => {
            this.toastrService.success('Reset code sent to your email!');
            this.codeSent.emit(email);
          },
          error: (error) => {
            if (error.status === 404) {
              this.toastrService.error(
                `There is no user registered with this email address ${email}.`,
                'Error',
              );
            }
          },
        });
    }
  }
}
