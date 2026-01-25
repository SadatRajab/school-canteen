import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';
import { I18nService, Translation } from '../../../core/services/i18n.service';

@Component({
    selector: 'app-admin-login',
    templateUrl: './admin-login.component.html',
    styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
    t!: Translation;
    loginForm!: FormGroup;
    loading = false;
    hidePassword = true;
    currentLang = 'ar';
    showPasswordError = false;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private i18n: I18nService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    private readonly ADMIN_EMAIL = 'admin@schoolcanteen.com';

    ngOnInit() {
        this.i18n.lang$.subscribe((lang) => {
            this.currentLang = lang;
            this.t = this.i18n.getTranslations();
        });

        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });
    }

    toggleLanguage() {
        const newLang = this.currentLang === 'ar' ? 'en' : 'ar';
        this.i18n.setLanguage(newLang);
    }

    onSubmit() {
        if (this.loginForm.invalid) {
            this.showPasswordError = true;
            return;
        }

        this.showPasswordError = false;
        this.loading = true;
        const { email, password } = this.loginForm.value;

        this.authService.login({ email, password }).subscribe({
            next: () => {
                this.snackBar.open(this.t.loginSuccess, this.t.close, { duration: 2000 });
                this.router.navigate(['/admin/dashboard']);
            },
            error: (err) => {
                this.loading = false;
                this.showPasswordError = true;
                const message = err.error?.message || this.t.loginFailed;
                this.snackBar.open(message, this.t.close, { duration: 3000 });
            }
        });
    }
}
