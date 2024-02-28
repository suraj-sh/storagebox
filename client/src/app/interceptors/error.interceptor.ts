import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(private spinner: NgxSpinnerService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.spinner.show(); // Show spinner before making the request

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        // let errorMessage = 'An error occurred while processing your request.';

        if (request.url.includes('/register') && error.error.message) {
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

        // Swal.fire('Error', errorMessage, 'error');
        return throwError(error);
      }),
      finalize(() => {
        this.spinner.hide(); // Hide spinner after request completes
      })
    );
  }
}
