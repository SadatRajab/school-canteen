import { Component } from '@angular/core';
import { I18nService } from '../../../core/services/i18n.service';

@Component({
    selector: 'app-language-toggle',
    template: `
    <button mat-icon-button (click)="toggleLang()" [title]="currentLang === 'ar' ? 'English' : 'العربية'">
      <mat-icon>language</mat-icon>
      <span class="lang-text">{{ currentLang === 'ar' ? 'EN' : 'ع' }}</span>
    </button>
  `,
    styles: [`
    button {
      position: relative;
    }
    
    .lang-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 10px;
      font-weight: 600;
    }
  `]
})
export class LanguageToggleComponent {
    currentLang = this.i18n.getCurrentLang();

    constructor(private i18n: I18nService) {
        this.i18n.lang$.subscribe(lang => {
            this.currentLang = lang;
        });
    }

    toggleLang() {
        this.i18n.toggleLanguage();
    }
}
