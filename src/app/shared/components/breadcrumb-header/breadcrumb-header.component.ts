import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-breadcrumb-header',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './breadcrumb-header.component.html',
  styleUrl: './breadcrumb-header.component.css',
})
export class BreadcrumbHeaderComponent {
  classes = input('bg-linear-to-r from-[#1BAA4B] via-[#23B854] to-[#35C867]');
  iconClass = input('fa-headset');
  title = input('Contact Us');
  subtitle = input("We'd love to hear from you. Get in touch with our team.");
  parentLabels = input<string[]>([]);
  parentRoutes = input<string[]>([]);
  image = input('');
  iconBackgroundClass = input('');
  titleClasses = input('');
  subtitleClasses = input('');
  lastRouteNameClasses = input('');
  linkClasses = input('');
  navigationSlashesClasses = input();
}
