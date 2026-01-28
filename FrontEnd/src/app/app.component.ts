import { Component, OnInit } from '@angular/core';
import { I18nService, Translation } from './core/services/i18n.service';

@Component({
    selector: 'app-root',
    template: `
    <mat-toolbar color="primary" class="no-print">
      <span>{{ t.appName }}</span>
      <span class="spacer"></span>
      <app-language-toggle></app-language-toggle>
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>menu</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <button mat-menu-item routerLink="/menu">
          <mat-icon>restaurant_menu</mat-icon>
          <span>{{ t.menu }}</span>
        </button>
        <button mat-menu-item routerLink="/display">
          <mat-icon>tv</mat-icon>
          <span>{{ t.publicDisplay }}</span>
        </button>
        <button mat-menu-item routerLink="/admin">
          <mat-icon>admin_panel_settings</mat-icon>
          <span>{{ t.admin }}</span>
        </button>
      </mat-menu>
    </mat-toolbar>

    <div class="app-container">
      <router-outlet></router-outlet>
    </div>
  `,
    styles: [`
    .spacer {
      flex: 1 1 auto;
    }
    
    .app-container {
      min-height: calc(100vh - 64px);
    }
    
    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
  `]
})
export class AppComponent implements OnInit {
    t!: Translation;

    constructor(private i18n: I18nService) { }

    ngOnInit() {
        this.i18n.lang$.subscribe(() => {
            this.t = this.i18n.getTranslations();
        });
    }
}
