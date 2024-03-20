import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {

  private apiUrl = 'http://localhost:3500';

  userInfoUpdated: EventEmitter<any> = new EventEmitter<any>(); // Event emitter for user info changes

  constructor(private http: HttpClient){}

  getUser(userId: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`).pipe(
      catchError(this.handleError)
    );
  }

  updateUser(userId: any, updatedUserDetails: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/user/${userId}`, updatedUserDetails).pipe(
      catchError(this.handleError),
      tap(() => {
        this.userInfoUpdated.emit(updatedUserDetails); // Emit event after updating user info
      })
    );
  }

  updateUserPic(userId: any, formData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/user/profile/${userId}`, formData).pipe(
      catchError(this.handleError),
      tap(() => {
        this.userInfoUpdated.emit({ userId, profilePic: formData }); // Emit event after updating user pic
      })
    );
  }

  deleteUserPic(userId: any): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/user/profile/${userId}`).pipe(
      catchError(this.handleError),
      tap(() => {
        this.userInfoUpdated.emit({ userId, profilePic: null }); // Emit event after deleting user pic
      })
    );
  }

  uploadDocs(userId: any, formData: any):Observable<any>{
    return this.http.put<any>(`${this.apiUrl}/user/update-proof/${userId}`, formData).pipe(
      catchError(this.handleError),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      errorMessage = `Server-side error: ${error.status} - ${error.error}`;
    }
    console.error(errorMessage);
    return throwError(errorMessage);
  }
}
