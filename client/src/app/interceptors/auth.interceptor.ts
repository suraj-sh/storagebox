import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private cookieService: CookieService, private authService: AuthenticationService,
              private router: Router) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.cookieService.get('jwt');

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
          // Attempt to refresh the token
          return this.authService.refreshToken().pipe(
            switchMap(() => {
              // Retry the original request with the new token
              const updatedRequest = request.clone({
                setHeaders: {
                  Authorization: `Bearer ${this.cookieService.get('jwt')}`,
                },
              });
              return next.handle(updatedRequest);
            }),
            catchError(() => {
              // If refresh fails, navigate to the login page or handle as needed
              this.router.navigate(['/login']);
              return throwError(error);
            })
          );
        } else {
          // If it's not a 401 error, rethrow the error
          return throwError(error);
        }
      })
    );
  }
}
