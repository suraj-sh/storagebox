import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:3500';

  constructor(private http: HttpClient, private router: Router) { }

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

  deleteUser(userId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/user/${userId}`, {});
  }


  logout(): void {
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

}