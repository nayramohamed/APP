import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { isPlatformBrowser } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from './core/services/storage.service';
import { MytranslateService } from './core/services/my-translate.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('e-commerce');
  private readonly translateService = inject(TranslateService);
  private readonly storageService = inject(StorageService);
  private readonly myTranslateService = inject(MytranslateService);

  ngOnInit(): void {
    const savedLanguage = this.storageService.getItem('lang');
    if (savedLanguage) {
      this.translateService.use(savedLanguage);
      this.myTranslateService.changeLang(savedLanguage)
    }
  }
}
