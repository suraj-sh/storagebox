import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
//backend code
export class AuthenticationService {
  private apiUrl = 'http://localhost:3500';

  // Initialize isLoggedInSubject with the value from local storage, defaulting to false if not found
  isLoggedInSubject = new BehaviorSubject<boolean>(false);
  // Expose isLoggedIn$ as an Observable for components to subscribe to
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private cookieService: CookieService,
    private router: Router) { }

  loginUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth`, user)
      .pipe(
        catchError(this.handleError),
        tap((response) => {
          this.updateLoggedInState(true);
        })
      );
  }

  logout(): void {
    this.updateLoggedInState(false);

    this.http.get(`${this.apiUrl}/logout`).subscribe(
      (res) => {
        Swal.fire({
          title: 'Successfully Logged Out',
          icon: 'success',
          confirmButtonText: 'Continue',
          iconColor: '#00ff00',
        });
        // Remove token from local 
        localStorage.removeItem('isLoggedIn');
        this.router.navigate(['/login']);
      }
    );
  }

  // Helper function to update the login state
  private updateLoggedInState(isLoggedIn: boolean): void {
    this.isLoggedInSubject.next(isLoggedIn);
     // Store the login state in local storage
     if (isLoggedIn) {
      localStorage.setItem('isLoggedIn', 'true');
    } else {
      localStorage.removeItem('isLoggedIn');
    }
  }

  refreshToken(): Observable<any> {
    return this.http.get(`${this.apiUrl}/refresh`).pipe(
      catchError(this.handleError),
      switchMap((response: any) => {
        if (response && response.accessToken) {
          this.cookieService.set('jwt', response.accessToken);
          return new Observable((observer) => observer.next(response.accessToken));
        } else {
          return throwError('Refresh token response is missing or invalid.');
        }
      })
    );
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

  getSellers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/seller`);
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