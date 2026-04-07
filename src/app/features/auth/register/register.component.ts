import { ValidationService } from '../../../core/services/validation.service';
import { ISignupFormData } from './../../../core/models/auth/signup-form-data.model';
import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { FeaturesSectionComponent } from '../../../shared/components/features-section/features-section.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import {
  AbstractControl,
  AbstractControlOptions,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, map, startWith } from 'rxjs';
import {
  UPPERCASE_PATTERN,
  LOWERCASE_PATTERN,
  SPECIAL_PATTERN,
  NUMBER_PATTERN,
  EGYPTIAN_PHONE_PATTERN,
} from '../../../core/сonstants/validators.constant';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  imports: [
    RouterLink,
    FeaturesSectionComponent,
    IconComponent,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly validationService: ValidationService = inject(ValidationService);
  private readonly authService: AuthService = inject(AuthService);
  private readonly toastrService: ToastrService = inject(ToastrService);
  private readonly router: Router = inject(Router);

  submittedOnce = signal(false);
  isSubmittingForm = signal(false);
  redirectTimerId!: ReturnType<typeof setTimeout>;
  formOptions!: AbstractControlOptions;

  registerForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.minLength(8), this.validationService.passwordValidator],
      ],
      rePassword: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern(EGYPTIAN_PHONE_PATTERN)]],
      acceptTerms: [false, Validators.requiredTrue],
    },
    {
      validators: [this.passwordMatchValidator],
    },
  );

  passwordControl = this.registerForm.get('password')!;
  readonly passwordValue = toSignal(
    this.passwordControl.valueChanges.pipe(
      startWith(this.passwordControl.value || ''),
      map((password) => password ?? ''),
    ),
  );

  readonly passwordStrengthLevel = computed(() => {
    const password = this.passwordValue();
    let score = 0;
    if (password.length >= 8) score += 20;
    if (NUMBER_PATTERN.test(password)) score += 15;
    if (UPPERCASE_PATTERN.test(password)) score += 15;
    if (LOWERCASE_PATTERN.test(password)) score += 10;
    if (SPECIAL_PATTERN.test(password)) score += 20;

    return score;
  });

  readonly passwordStrengthScore = computed(() => this.passwordStrengthLevel());

  readonly passwordStrengthLabel = computed(() => {
    const score = this.passwordStrengthLevel();

    if (score < 45) return 'Weak';
    if (score < 60) return 'Fair';
    if (score < 80) return 'Good';

    return 'Strong';
  });

  readonly passwordProgressBarColor = computed(() => {
    const score = this.passwordStrengthLevel();

    if (score < 45) return 'bg-red-500';
    if (score < 60) return 'bg-orange-500';
    if (score < 80) return 'bg-blue-500';

    return 'bg-green-500';
  });

  passwordMatchValidator(gp: AbstractControl) {
    const password = gp.get('password')?.value;
    const rePassword = gp.get('rePassword')?.value;

    return password === rePassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.submittedOnce.set(true);

    if (this.registerForm.valid) {
      this.isSubmittingForm.set(true);
      const signupFormData: ISignupFormData = {
        name: this.registerForm.get('name')?.value,
        email: this.registerForm.get('email')?.value,
        password: this.registerForm.get('password')?.value,
        rePassword: this.registerForm.get('rePassword')?.value,
        phone: this.registerForm.get('phone')?.value,
      };

      this.authService
        .signUp(signupFormData)
        .pipe(finalize(() => this.isSubmittingForm.set(false)))
        .subscribe({
          next: () => {
            this.toastrService.success('Account Created successfully');
            this.submittedOnce.set(false);
            this.registerForm.reset({ acceptTerms: false });
            this.redirectTimerId = setTimeout(() => {
              this.router.navigate(['/login']);
            }, 3000);
          },
          error: (error) => {
            if (error.status === 409) {
              this.registerForm.get('email')?.setErrors({ emailTaken: true });
            }

            this.toastrService.error('Validation errors');
          },
        });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }

  ngOnDestroy() {
    if (this.redirectTimerId) {
      clearTimeout(this.redirectTimerId);
    }
  }
}
