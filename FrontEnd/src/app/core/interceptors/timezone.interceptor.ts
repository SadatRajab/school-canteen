import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class TimezoneInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Add X-Timezone header for order-related endpoints
        const needsTimezone = [
            '/orders',
            '/admin/orders',
            '/admin/profit/today',
            '/kitchen/orders'
        ].some(path => req.url.includes(path));

        if (needsTimezone) {
            const timezone = this.getUserTimezone();
            const timezoneReq = req.clone({
                setHeaders: {
                    'X-Timezone': timezone
                }
            });
            return next.handle(timezoneReq);
        }

        return next.handle(req);
    }

    private getUserTimezone(): string {
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return 'UTC';
        }
    }
}
