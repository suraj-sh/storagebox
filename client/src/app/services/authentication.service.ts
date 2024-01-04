import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:3500';

  constructor(private http: HttpClient, private router: Router) { }

  registerUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  sendVerificationEmail(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/verify`, user).pipe(
      catchError(this.handleError)
    );
  }

  loginUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth`, user).pipe(
      catchError(this.handleError));
  }

  forgotpass(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgotpassword`, user).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(resetObj: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/resetpassword/`, resetObj).pipe(
      catchError(this.handleError)
    );
  }

  loggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/home']);
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
