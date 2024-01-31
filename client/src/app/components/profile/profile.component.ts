import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profileData: any = {};

  ngOnInit(): void {
    // Load stored profile data when the component initializes
    this.getStoredProfileData();
  }

  getStoredProfileData(): void {
    const storedData = localStorage.getItem('profileData');
    this.profileData = storedData ? JSON.parse(storedData) : {};
  }

  saveProfile(): void {
    // Validate password
    if (this.profileData.password && this.profileData.password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }

    // Save profile data to localStorage
    localStorage.setItem('profileData', JSON.stringify(this.profileData));
    alert('Profile saved successfully!');
  }

  updateProfile(): void {
    // Load stored profile data before updating
    this.getStoredProfileData();
    alert('Profile data updated! You can now make changes and click "Save Profile".');
  }

  loadProfilePicture(event: any): void {
    const input = event.target;
    const reader = new FileReader();
    reader.onload = () => {
      this.profileData.profilePicture = reader.result as string;
    };
    reader.readAsDataURL(input.files[0]);
  }

  hasProfilePicture(): boolean {
    return !!this.profileData.profilePicture;
  }
  removeProfilePicture(): void {
    this.profileData.profilePicture = '';
  }
  }

