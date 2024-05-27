import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private spinner: NgxSpinnerService, private router: Router,
              private authService: AuthService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinner.show(); // Show spinner before making the request

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        // let errorMessage = 'An error occurred while processing your request.';

        if (error.error.message) {
          let errorMessage = 'An error occurred while processing your request.';
          errorMessage = error.error.message;

          if (errorMessage.includes('username already exists')) {
            errorMessage = 'Username already exists.';
          }
          else if (errorMessage.includes('email already exists')) {
            errorMessage = 'Email already exists.';
          }
          else if (errorMessage.includes('invalid verification code')) {
            errorMessage = 'Invalid verification code.';
          }
          else if (errorMessage.includes('verification code has expired')) {
            errorMessage = 'Verification code has expired.';
          }
          Swal.fire('Error', errorMessage, 'error');

        }

        const isRefresh = request.url.endsWith('/refresh');

        // Handling Refresh errors separately
        if (isRefresh && error.status === 401) {
          let errorMessage = 'An error occurred while processing your request.';
          errorMessage = 'Session Expired. Please login again.';
          Swal.fire('Error', errorMessage, 'error');
        
          // Clear localStorage and redirect to login page
          localStorage.clear();
          this.authService.isLoggedInSubject.next(false); // Update isLoggedIn$ to false
          this.router.navigate(['/login']);
          return throwError(errorMessage); // Return an empty observable to stop further processing
        }
        

        // Check if the request was for login
        const isLoginRequest = request.url.endsWith('/auth');

        // Handling login errors separately
        if (isLoginRequest && error.status === 401) {
          let errorMessage = 'An error occurred while processing your request.';
          errorMessage = 'Incorrect username or password. Please try again.';
          Swal.fire('Error', errorMessage, 'error');

        }

        // Check if the request was for forgot password
        const forgotpass = request.url.endsWith('/auth/forgotpassword');

        // Handling errors separately
        if (forgotpass && error.status === 400) {
          let errorMessage = 'An error occurred while processing your request.';
          errorMessage = 'Email does not exist';
          Swal.fire('Error', errorMessage, 'error');

        }

        // Check if the request was for forgot password
        const resetpass = request.url.endsWith('/auth/resetpassword/:token');

        // Handling errors separately
        if (resetpass && error.status === 400) {
          let errorMessage = 'An error occurred while processing your request.';
          errorMessage = 'Token invalid or expired';
          Swal.fire('Error', errorMessage, 'error');
        }

        return throwError(error);
      }),

      finalize(() => {
        this.spinner.hide(); // Hide spinner after request completes
      })
    );
  }
}
