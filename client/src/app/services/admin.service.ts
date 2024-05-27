import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private authService: AuthService) { }

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