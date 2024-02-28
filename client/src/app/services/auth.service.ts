import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { ProfileService } from './profile.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:3500';

  isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  constructor(private http: HttpClient, private router: Router,
    private profileService: ProfileService) { }

  loginUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth`, user)
      .pipe(
        catchError(this.handleError),
        tap((response: any) => {
          this.updateLoggedInState(true);
          if (response && response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            // Load user profile immediately after login
            this.loadUserProfile();
          }
        })
      );
  }

  decodeToken(): { userId: string, username: string, role: string } | null {
    const accessToken = this.getToken();
    if (accessToken) {
      const decodedToken: any = jwtDecode(accessToken);
      const userId = decodedToken.UserInfo.userId;
      const username = decodedToken.UserInfo.username;
      const roles = decodedToken.UserInfo.roles;
      let role = ''; // Initialize role variable

      if (Array.isArray(roles)) {
        if (roles.includes(1320)) {
          role = 'Owner';
        }
        else if (roles.includes(515)) {
          role = 'Admin';
        }
        else {
          role = 'Renter';
        }
      }
      else {
        role = 'Unknown';
      }

      return { userId, username, role };
    }
    return null;
  }

  loadUserProfile(): void {
    const decodedToken = this.decodeToken();
    if (decodedToken) {
      const userId = decodedToken.userId;
      this.profileService.getUser(userId).subscribe(
        (userData: any) => {
          // Emit event to notify other components about user profile update
          this.profileService.userInfoUpdated.emit(userData);
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
        }
      );
    }
  }


  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  logout(): void {
    this.updateLoggedInState(false);
    this.http.get(`${this.apiUrl}/logout`).subscribe(
      () => {
        Swal.fire({
          title: 'Successfully Logged Out',
          icon: 'success',
          confirmButtonText: 'Continue',
          iconColor: '#00ff00',
        });
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    );
  }

  private updateLoggedInState(isLoggedIn: boolean): void {
    this.isLoggedInSubject.next(isLoggedIn);
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
          localStorage.setItem('accessToken', response.accessToken);
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