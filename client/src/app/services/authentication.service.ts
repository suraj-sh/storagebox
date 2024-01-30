import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:3500';

  // Declare isLoggedInSubject as a BehaviorSubject
  private isLoggedInSubject = new BehaviorSubject<boolean>(false);

  // Expose isLoggedIn$ as an Observable for components to subscribe to
  isLoggedIn$: Observable<boolean> = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService, private router: Router) { }

  loginUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth`, user, { withCredentials: true })
      .pipe(
        catchError(this.handleError),
        tap(() => this.isLoggedInSubject.next(true))
      );
  }

  loggedIn(): boolean {
    const token = this.cookieService.get('jwt');
    return !!token;
  }

  logout(): void {
    console.log('Logout method called');
    this.isLoggedInSubject.next(false);
  
    const token = this.cookieService.get('jwt');
  
    // Check if the token exists before making the request
    if (token) {
      const headers = {
        Authorization: `Bearer ${token}`
      };
  
      // Include the headers in the request
      this.http.post(`${this.apiUrl}/logout`, {}, { headers })
        .pipe(
          catchError((error) => {
            console.error('Error during logout:', error);
            return throwError(error);
          })
        )
        .subscribe(() => {
          this.cookieService.delete('jwt');
          this.router.navigate(['/login']);
        });
    } else {
      // If token is not present, just clear the cookie and navigate
      this.cookieService.delete('jwt');
      this.router.navigate(['/login']);
    }
  }
  


  sendVerificationEmail(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  registerUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register/verify`, user).pipe(
      catchError(this.handleError)
    );
  }


  forgotpass(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/forgotpassword`, user).pipe(
      catchError(this.handleError)
    );
  }

  resetPassword(resetObj: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/resetpassword/${resetObj.token}`, resetObj).pipe(
      catchError(this.handleError)
    );
  }


  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    }
    else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
