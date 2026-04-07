import { Component } from '@angular/core';
import { FeaturesSectionComponent } from '../../../shared/components/features-section/features-section.component';
import { ResetFormComponent } from './components/reset-form/reset-form.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-forget-password',
  imports: [FeaturesSectionComponent, ResetFormComponent, TranslatePipe],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.css',
})
export class ForgetPasswordComponent {}
