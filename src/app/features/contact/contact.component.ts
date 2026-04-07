import { Component } from '@angular/core';
import { BreadcrumbHeaderComponent } from '../../shared/components/breadcrumb-header/breadcrumb-header.component';
import { FeaturesSectionComponent } from '../../shared/components/features-section/features-section.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  imports: [BreadcrumbHeaderComponent, FeaturesSectionComponent, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.css',
})
export class ContactComponent {}
