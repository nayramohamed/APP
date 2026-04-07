import { TranslateService } from '@ngx-translate/core';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class MytranslateService {
  private readonly storageService = inject(StorageService);
  private readonly translateService = inject(TranslateService);
  private readonly platformId = inject(PLATFORM_ID);
  readonly currentLang = signal(this.getCurrentLang());

  changeDirection(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.storageService.getItem('lang') === 'ar'
        ? (document.documentElement.dir = 'rtl')
        : (document.documentElement.dir = 'ltr');
    }
  }

  changeLang(lang: string): void {
    this.storageService.setItem('lang', lang);
    this.translateService.use(lang);
    this.currentLang.set(lang);
    this.changeDirection();
  }

  private getCurrentLang(): string {
    const lang = this.storageService.getItem('lang');
    return lang ? lang : 'en';
  }
}
