import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { AuthenticationService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  
  userDetailsForm: FormGroup;
  userProfile: any;
  imageFile: File | string = '';
  isEditMode: boolean = false;
  userRole: string = ''; // Add userRole property
  showSpinner = false;

  constructor(private formBuilder: FormBuilder, private profileService: ProfileService,
    private authService: AuthenticationService) { }

  // Common getter function for the form inputs 
   get userForm() {
    return this.userDetailsForm.get('username');
  }

  ngOnInit(): void {
    this.userDetailsForm = this.formBuilder.group({
      username: ['', Validators.minLength(6)],
      email: [''],
      image: ['']
    });

    this.loadUserProfile(); // Load user profile initially
    this.userDetailsForm.disable(); // Disable form fields initially  
  }

  editProfile(): void {
    this.isEditMode = true;
    this.userDetailsForm.enable();
    this.userDetailsForm.get('email')?.disable();
  }

  discardChanges(): void {
    this.userDetailsForm.reset(this.userProfile);
    this.isEditMode = false;
    this.userDetailsForm.disable();
  }

  saveProfile(): void {
    const decodedToken = this.authService.decodeToken();
    const userId = decodedToken?.userId;
    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    // Update username and email
    const updatedUserDetails = {
      username: this.userDetailsForm.get('username')?.value,
      // email: this.userDetailsForm.get('email')?.value
    };

    // Show spinner
    this.showSpinner = true;

    this.profileService.updateUser(userId, updatedUserDetails).subscribe(
      () => {
        Swal.fire({
          title: 'Success',
          text: 'Profile Updated Successfully',
          icon: 'success',
          iconColor: '#00ff00',
          confirmButtonText: 'OK'
        }).then(() => {
          this.loadUserProfile(); // Reload user profile after updating details
          this.isEditMode = false;
          this.showSpinner = false;
        });
      }
    );
  }

  loadUserProfile(): void {
    const decodedToken = this.authService.decodeToken();
    if (decodedToken) {
      const userId = decodedToken.userId;
      const userRole = decodedToken.role;
      this.profileService.getUser(userId).subscribe(
        (userData: any) => {
          this.userProfile = userData;
          this.userRole = userRole;
          this.userDetailsForm.patchValue({
            username: this.userProfile.username,
            email: this.userProfile.email,
            image: this.userProfile.image
          });
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
          alert('Failed to fetch user details. Please try again later.');
        }
      );
    } else {
      console.error('User token not found.');
    }
  }

  loadProfilePicture(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);

      const decodedToken = this.authService.decodeToken();
      const userId = decodedToken?.userId;

      if (!userId) {
        console.error('User ID not found.');
        return;
      }

      this.profileService.updateUserPic(userId, formData).subscribe(
        () => {
          // alert('Profile image updated successfully!');
          this.loadUserProfile(); // Reload user profile after updating image
        },
        (error: any) => {
          console.error('Error updating profile image:', error);
          alert('Failed to update profile image. Please try again later.');
        }
      );

      const reader = new FileReader();
      reader.onload = () => {
        this.userDetailsForm.patchValue({
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  }


  removeProfilePicture(): void {
    const decodedToken = this.authService.decodeToken();
    const userId = decodedToken?.userId;
    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    this.profileService.deleteUserPic(userId).subscribe(
      () => {
        // Reset the image file and clear the 'image' form control
        this.imageFile = '';
        this.userDetailsForm.patchValue({
          image: ''
        });
      },
      (error: any) => {
        console.error('Error deleting profile picture:', error);
        alert('Failed to delete profile picture. Please try again later.');
      }
    );
  }
}