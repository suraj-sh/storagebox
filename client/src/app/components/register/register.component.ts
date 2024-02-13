import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  passwordVisible = false;
  showOwnerDocumentsSection = false;
  currentStep = 1;
  showSpinner = false;
  filesIdProof: File | null = null;
  filesStorageProof: File | null = null;

  // Common getter function for the form inputs 
  get form() {
    return this.registrationForm.controls;
  }

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder,
    private router: Router) { }

  registrationForm = this.formBuilder.group({
    user: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    verificationCode: ['', Validators.required],
    pwd: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
    confirmPassword: ['', [Validators.required]],
    isSeller: [false, Validators.required],
    idProof: [''],
    documentProof: ['']
  });

  selectFile(event: any, formControlName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      // Check if the file is a PDF
      if (formControlName === 'idProof' && !this.isPdfFile(file)) {
        Swal.fire('Error', 'Please upload a PDF file for ID proof', 'error');
        return;
      }

      if (formControlName === 'documentProof' && !this.isPdfFile(file)) {
        Swal.fire('Error', 'Please upload a PDF file for storage unit proof', 'error');
        return;
      }

      if (formControlName === 'idProof') {
        this.filesIdProof = file;
      } 
      else if (formControlName === 'documentProof') {
        this.filesStorageProof = file;
      }
    }
  }

  isPdfFile(file: File): boolean {
    // Check if the file type is PDF
    return file.type === 'application/pdf';
  }

  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  sendVerificationCode() {

    const formData = new FormData();

    // Append all form controls to FormData
    Object.entries(this.form).forEach(([controlName, control]) => {
      if (control instanceof FormControl) {
        formData.append(controlName, String(control.value));
      }
    });

    // Append files separately, only if they are not null
    if (this.filesIdProof !== null) {
      formData.append('idProof', this.filesIdProof);
    }

    if (this.filesStorageProof !== null) {
      formData.append('documentProof', this.filesStorageProof);
    }


    // Check if the user is a seller and if the required files are uploaded
    if (this.form.isSeller?.value) {
      if (!this.filesIdProof || !this.filesStorageProof) {
        // If any of the required files are missing, show an alert and return
        Swal.fire('Error', 'Please provide both ID proof and proof of the storage unit', 'error');
        return;
      }
    }


    // Show spinner
    this.showSpinner = true;

    // Send verification email
    this.authService.sendVerificationEmail(formData).subscribe(
      (response) => {
        console.log('Verification email sent successfully');
        Swal.fire({
          title: 'Success',
          text: 'Verification Code sent to email',
          icon: 'success',
          iconColor: '#00ff00',
          confirmButtonText: 'OK'
        });
        this.showSpinner = false;
        this.nextStep();
      }
    );
  }

  register() {
    if (!this.registrationForm.invalid) {
      console.log(this.registrationForm.value);
      const formData = new FormData();

      // Append all form controls to FormData
      Object.entries(this.form).forEach(([controlName, control]) => {
        if (control instanceof FormControl) {
          formData.append(controlName, String(control.value));
        }
      });

      this.showSpinner = true;

      this.authService.registerUser(formData).subscribe(
        (response) => {
          console.log('User registered successfully', response);
          Swal.fire({
            title: 'Success',
            text: response.success || 'Registration successful',
            icon: 'success',
            iconColor: '#00ff00',
            confirmButtonText: 'OK'
          });
          // Redirect to login or perform any other post-registration actions
          this.showSpinner = false;
          this.router.navigate(['/login']);
        }
      );
    }
  }

  isButtonDisabled(): boolean {
    return this.registrationForm.invalid || this.registrationForm.get('pwd')?.value !== this.registrationForm.get('confirmPassword')?.value;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  updateOwnerDocumentsSection() {
    this.showOwnerDocumentsSection = this.form.isSeller?.value === true;
  }
}
