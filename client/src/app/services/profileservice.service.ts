// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class ProfileService {
//   private userProfile = {
//     name: 'John Doe',
//     email: 'john@example.com',
//     bio: 'Web Developer',
//     profileImage: 'https://example.com/default-profile-image.jpg',
//     // Add more profile information as needed
//   };

//   getProfile(): Observable<any> {
//     return of(this.userProfile);
//   }

//   updateProfile(updatedProfile: any): void {
//     this.userProfile = { ...this.userProfile, ...updatedProfile };
//   }
// }
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private savedProfiles: any[] = [];

  saveProfile(profile: any): Observable<any> {
   
    this.savedProfiles.push(profile);
    return of({ success: true });
  }

  getSavedProfiles(): Observable<any[]> {
  
    return of(this.savedProfiles);
  }
}
