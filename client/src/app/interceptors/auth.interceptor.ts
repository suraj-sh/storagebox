import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take, finalize } from 'rxjs/operators';
import { AuthenticationService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(private authService: AuthenticationService, private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();

    // Clone the request and add withCredentials option
    let clonedRequest = request.clone({
      withCredentials: true,
    });

    // If token is present, add Authorization header
    if (token) {
      clonedRequest = clonedRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Intercept and handle errors
    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 && token) {
          if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.refreshTokenSubject.next(null);

            return this.authService.refreshToken().pipe(
              switchMap((refreshedToken: any) => {
                this.isRefreshing = false;
                this.refreshTokenSubject.next(refreshedToken);
                return next.handle(this.addToken(request, refreshedToken));
              }),
              catchError(() => {
                this.isRefreshing = false;
                // this.router.navigate(['']);
                return throwError(error);
              }),
              finalize(() => {
                this.isRefreshing = false;
              })
            );
          } else {
            // Wait for token refresh to complete before retrying the request
            return this.refreshTokenSubject.pipe(
              filter(token => token != null),
              take(1),
              switchMap(() => {
                return next.handle(this.addToken(request, this.authService.getToken()));
              })
            );
          }
        } else {
          // If it's not a 401 error, rethrow the error
          return throwError(error);
        }
      })
    );
  }

  private addToken(request: HttpRequest<any>, token: string | null): HttpRequest<any> {
    if (token) {
      return request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }
    return request;
  }
}