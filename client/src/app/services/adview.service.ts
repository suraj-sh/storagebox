import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdviewService {

  private apiUrl = 'http://localhost:3500';

  constructor(private http: HttpClient) { }

  getads(): Observable<any>{
    return this.http.get(`${this.apiUrl}/storage`);
  }

  getad(id: any): Observable<any>{
    return this.http.get(`${this.apiUrl}/storage/${id}`);
  }

  getPostedAds(): Observable<any>{
    return this.http.get(`${this.apiUrl}/storage/user`);
  }

  filterByCategory(categories: any): Observable<any>{
    return this.http.get(`${this.apiUrl}/storage?${categories}=`);
  }

  filterByCity(cities: any): Observable<any>{
    return this.http.get(`${this.apiUrl}/storage?${cities}=`);
  }

  
}
