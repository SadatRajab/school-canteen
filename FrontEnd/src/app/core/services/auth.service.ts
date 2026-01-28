import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AdminLoginRequest } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenKey = 'canteen_admin_token';
    private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());

    // Demo credentials for frontend-only version
    private readonly DEMO_EMAIL = 'admin@schoolcanteen.com';
    private readonly DEMO_PASSWORD = 'admin123';

    constructor(
        private router: Router
    ) { }

    login(credentials: AdminLoginRequest): Observable<any> {
        // Frontend-only authentication (demo mode)
        const { email, password } = credentials;

        // Simulate async API call
        return new Observable(observer => {
            setTimeout(() => {
                if (email === this.DEMO_EMAIL && password === this.DEMO_PASSWORD) {
                    const mockToken = this.generateMockToken();
                    this.setToken(mockToken);
                    observer.next({ success: true, token: mockToken });
                    observer.complete();
                } else {
                    observer.error({
                        error: {
                            message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
                        }
                    });
                }
            }, 500);
        });
    }

    private generateMockToken(): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(2);
        return `demo-token-${timestamp}-${random}`;
    }

    logout(): void {
        this.clearToken();
        this.router.navigate(['/admin/login']);
    }

    private setToken(token: string): void {
        sessionStorage.setItem(this.tokenKey, token);
        this.tokenSubject.next(token);
    }

    private clearToken(): void {
        sessionStorage.removeItem(this.tokenKey);
        this.tokenSubject.next(null);
    }

    private getStoredToken(): string | null {
        return sessionStorage.getItem(this.tokenKey);
    }

    getToken(): string | null {
        return this.tokenSubject.value;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    get token$(): Observable<string | null> {
        return this.tokenSubject.asObservable();
    }
}
