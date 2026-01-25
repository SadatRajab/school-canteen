import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

// Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { TimezoneInterceptor } from './core/interceptors/timezone.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

// Shared Components
import { LanguageToggleComponent } from './shared/components/language-toggle/language-toggle.component';

@NgModule({
    declarations: [
        AppComponent,
        LanguageToggleComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: TimezoneInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
