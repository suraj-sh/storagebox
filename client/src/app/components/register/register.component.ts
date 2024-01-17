import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

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

  get user() {
    return this.registrationForm.get('user');
  }

  get email() {
    return this.registrationForm.get('email');
  }

  get verificationCode() {
    return this.registrationForm.get('verificationCode');
  }

  get pwd() {
    return this.registrationForm.get('pwd');
  }

  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }

  get isSeller() {
    return this.registrationForm.get('isSeller');
  }

  get idProof() {
    return this.registrationForm.get('idProof');
  }

  get documentProof() {
    return this.registrationForm.get('documentProof');
  }

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder,
    private router: Router) { }

  registrationForm = this.formBuilder.group({
    user: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, 
                  Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    verificationCode: ['', Validators.required],
    pwd: ['', [Validators.required, Validators.minLength(12),
                Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
    confirmPassword: ['', [Validators.required]],
    isSeller: [false, Validators.required],
    idProof: [''],
    documentProof: ['']
  });

  selectFile(event: any, formControlName: string) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      if (formControlName === 'idProof') {
        this.filesIdProof = file;
      } else if (formControlName === 'documentProof') {
        this.filesStorageProof = file;
      }
    }
  }

  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  sendVerificationCode() {
    // Get the values from the form controls
    const isSeller = this.isSeller?.value;
    const user = this.user?.value;
    const email = this.email?.value;
    const idProof = this.idProof?.value;
    const documentProof = this.documentProof?.value;

    // Check if the user is a seller and if the required files are uploaded
    if (isSeller) {
      if (!idProof || !documentProof) {
        // If any of the required files are missing, show an alert and return
        Swal.fire('Error', 'Please provide both ID proof and proof of the storage unit', 'error');
        return;
      }
    }

    // Prepare the form data
    const formData = {
      isSeller, user, email, idProof, documentProof
    };

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
        this.nextStep(); // Move to the next step (verification code entry)
      }
    );
  }

  register() {
    console.log(this.registrationForm.value);
    const formData = this.registrationForm.value;
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

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  updateOwnerDocumentsSection() {
    this.showOwnerDocumentsSection = this.isSeller?.value === true;
  }
}
