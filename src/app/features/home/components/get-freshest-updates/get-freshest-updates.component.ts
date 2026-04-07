import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-get-freshest-updates',
  imports: [ReactiveFormsModule, IconComponent, TranslatePipe],
  templateUrl: './get-freshest-updates.component.html',
  styleUrl: './get-freshest-updates.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetFreshestUpdatesComponent {
  private readonly fb = inject(FormBuilder);

  isSubmitted = signal(false);
  newsletterForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected onSubmit(): void {
    if (this.newsletterForm.invalid) {
      this.newsletterForm.markAllAsTouched();
      return;
    }

    this.newsletterForm.reset({ email: '' });
    this.isSubmitted.set(true);
  }
}
