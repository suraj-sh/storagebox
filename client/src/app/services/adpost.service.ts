import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AdpostService {

  private apiUrl = 'http://localhost:3500';

  constructor(private http: HttpClient) { }

  listad(formData: any){
    return this.http.post(`${this.apiUrl}/storage`, formData);
  }

  updateAd(id: any, formData: any){
    return this.http.put(`${this.apiUrl}/storage/${id}`, formData);
  }

  updateimage(id: any, formData: any){
    return this.http.put(`${this.apiUrl}/storage/images/${id}`, formData);
  }

  deletead(id: any){
    return this.http.delete(`${this.apiUrl}/storage/${id}`);
  }

  deleteimage(id: any, imageName: any){
    return this.http.delete(`${this.apiUrl}/storage/images/${id}/${imageName}`);
  }
}
