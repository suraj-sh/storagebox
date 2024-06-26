import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env';

@Injectable({
  providedIn: 'root'
})
export class AdService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getAds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage`);
  }

  getAd(id: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage/${id}`);
  }

  getPostedAds(): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage/user`);
  }

  allFilters(queryParams: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/storage?${queryParams}`);
  }

  listAd(formData: any) {
    return this.http.post(`${this.apiUrl}/storage`, formData);
  }

  updateAd(id: any, formData: any) {
    return this.http.put(`${this.apiUrl}/storage/${id}`, formData);
  }

  deleteAd(id: any) {
    return this.http.delete(`${this.apiUrl}/storage/${id}`);
  }

  deleteImage(id: any, imageIndex: any) {
    return this.http.delete(`${this.apiUrl}/storage/images/${id}/${imageIndex}`);
  }

}