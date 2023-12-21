import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:3500';

  constructor(private http: HttpClient, private router: Router) {}

  registerUser(user: any){
   return this.http.post<any>(`${this.apiUrl}/register`, user); 
  }

  loginUser(user: any){
   return this.http.post<any>(`${this.apiUrl}/auth`, user); 
  }

  forgotpass(user: any){
    return this.http.post<any>(`${this.apiUrl}/auth/forgotpassword`, user);
  }

  loggedIn(){
    return !!localStorage.getItem('token')
  }

  logout(){
    localStorage.removeItem('token')
    this.router.navigate(['/home'])
  }

  
 }
