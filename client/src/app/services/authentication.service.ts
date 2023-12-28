import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private apiUrl = 'http://localhost:3500';

  constructor(private http: HttpClient) {}

  register (user: any): Observable<any>{
   return this.http.post(`${this.apiUrl}/register`, user); 
  }
  
  login (user: any): Observable<any>{
    return this.http.post(`${this.apiUrl}/login`, Credential); 
   } 

}
