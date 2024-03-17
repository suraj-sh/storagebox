import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdService {

  private apiUrl = 'http://localhost:3500';

  constructor(private http: HttpClient) { }

  getads(): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage`);
  }

  getad(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage/${id}`);
  }

  getPostedAds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage/user`);
  }

  filterByCategory(categories: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage?categories=${categories}`);
  }

  filterByCity(cities: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage?cities=${cities}`);
  }

  sortLowToHigh(sort: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage?sort=${sort}`);
  }

  sortHighToLow(sort: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage?sort=${sort}`);
  }

  allFilters(categories: any, cities: any, sort: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage?categories=${categories}&cities=${cities}&sort=${sort}`);
  }


  listad(formData: any) {
    return this.http.post(`${this.apiUrl}/storage`, formData);
  }

  updateAd(id: any, formData: any) {
    return this.http.put(`${this.apiUrl}/storage/${id}`, formData);
  }

  // updateimage(id: any, formData: any) {
  //   return this.http.put(`${this.apiUrl}/storage/images/${id}`, formData);
  // }

  deletead(id: any) {
    return this.http.delete(`${this.apiUrl}/storage/${id}`);
  }

  deleteimage(id: any, imageIndex: any) {
    return this.http.delete(`${this.apiUrl}/storage/images/${id}/${imageIndex}`);
  }

}
