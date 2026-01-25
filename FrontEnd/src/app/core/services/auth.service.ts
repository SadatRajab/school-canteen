import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { AdminLoginRequest } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private tokenKey = 'canteen_admin_token';
    private tokenSubject = new BehaviorSubject<string | null>(this.getStoredToken());

    constructor(
        private apiService: ApiService,
        private router: Router
    ) { }

    login(credentials: AdminLoginRequest): Observable<any> {
        return this.apiService.adminLogin(credentials).pipe(
            tap(response => {
                if (response.success && response.token) {
                    this.setToken(response.token);
                }
            })
        );
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
