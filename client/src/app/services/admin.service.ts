import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3500';

  constructor(private http: HttpClient, private authService: AuthenticationService) { }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user`);
  }

  getSellers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/seller`);
  }

  getCount(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/user/get/count`);
  }

  getSellerCount(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/user/seller-count`);
  }

  getVerifiedCount(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/user/verifiedSeller-count`);
  }

  // Method to change user into seller
  changeUserToSeller(userId: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/user/change-role/${userId}`, {});
  }

  incorrectDocuments(userId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/email/${userId}`, {});
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/user/${userId}`, {});
  }

  logout() {
    this.authService.logout();
  }

}