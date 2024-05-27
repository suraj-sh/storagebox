import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { AuthService } from 'src/app/services/auth.service';
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
  filesIdProof: File | null = null;
  filesStorageProof: File | null = null;
  showSpinner = false;
  sellerStatus: string = '';
  dataLoaded: boolean = false;

  constructor(private formBuilder: FormBuilder, private profileService: ProfileService,
    private authService: AuthService) { }

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

    this.userDetailsForm.disable(); // Disable form fields initially
    this.loadUserProfile(); // Load user profile initially
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

  trimInputs() {
    const trimmedValues = {
      username: this.userDetailsForm.get('username')?.value?.trim() ?? '',
    };
    this.userDetailsForm.patchValue(trimmedValues);
  }

  // Method to handle file selection
  selectFile(event: any, formControlName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      // Check if the file is a PDF
      if (!this.isPdfFile(file)) {
        // Show error message
        return;
      }

      // Store the selected file
      if (formControlName === 'idProof') {
        this.filesIdProof = file;
      }
      else if (formControlName === 'documentProof') {
        this.filesStorageProof = file;
      }
    }
  }

  // Method to check if the file is a PDF
  isPdfFile(file: File): boolean {
    return file.type === 'application/pdf';
  }

  loadUserProfile(): void {
    const decodedToken = this.authService.decodeToken();
    if (decodedToken) {
      const userId = decodedToken.userId;
      let userRole = decodedToken.role;

      this.profileService.getUser(userId).subscribe(
        (userData: any) => {
          this.userProfile = userData;
          this.userRole = userRole;
          this.userDetailsForm.patchValue({
            username: this.userProfile.username,
            email: this.userProfile.email,
            image: this.userProfile.image
          });

          if (decodedToken.role === 'Renter' && this.userProfile?.isSeller && !this.userProfile?.isActiveSeller) {
            this.userRole = 'Owner';
          }

          this.dataLoaded = true;
        },
        (error: any) => {
          console.error('Error fetching user details:', error);
        }
      );
    }
    else {
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
          this.loadUserProfile(); // Reload user profile after updating image
        },
        (error: any) => {
          console.error('Error updating profile image:', error);
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
      }
    );
  }

  sendDocs(): void {
    const decodedToken = this.authService.decodeToken();
    const userId = decodedToken?.userId;
    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    // Check if files are selected
    if (!this.filesIdProof || !this.filesStorageProof) {
      console.error('No files selected.');
      return;
    }

    // Prepare form data for file uploads
    const formData = new FormData();
    formData.append('idProof', this.filesIdProof);
    formData.append('documentProof', this.filesStorageProof);

    // Show spinner
    this.showSpinner = true;

    // Call the service method to upload documents
    this.profileService.uploadDocs(userId, formData).subscribe(
      () => {
        Swal.fire({
          title: 'Success',
          text: 'Documents Uploaded Successfully',
          icon: 'success',
          iconColor: '#00ff00',
          confirmButtonText: 'OK'
        }).then(() => {
          this.loadUserProfile(); // Reload user profile after updating details
          this.showSpinner = false;
          this.filesIdProof = null;
          this.filesStorageProof = null;
        });
      },
      (error: any) => {
        console.error('Error uploading docs:', error);
        this.showSpinner = false;
      }
    );
  }


  saveProfile(): void {
    const decodedToken = this.authService.decodeToken();
    const userId = decodedToken?.userId;
    if (!userId) {
      console.error('User ID not found.');
      return;
    }

    this.trimInputs(); // Trim inputs before saving

    // Update username and email
    const updatedUserDetails = {
      username: this.userDetailsForm.get('username')?.value,
      // Add other user details as needed
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
          this.userDetailsForm.disable();
          this.isEditMode = false;
          this.showSpinner = false;
        });
      },
      (error: any) => {
        console.error('Error updating user details:', error);
        this.showSpinner = false;
      }
    );
  }

}