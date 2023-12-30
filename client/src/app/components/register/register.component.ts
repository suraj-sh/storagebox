import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { FormBuilder, FormGroup, Validators, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
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

  get role() {
    return this.registrationForm.get('role');
  }

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder,
              private router: Router) { }

  registrationForm = this.formBuilder.group({
    user: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.email]],
    verificationCode: ['', Validators.required],
    pwd: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
    confirmPassword: ['', [Validators.required, this.passwordMatchValidator()]],
    role: ['', Validators.required],
    idProof: ['', []],
    storageProof: ['', []]
  });

  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  verifyEmail() {
    // Implement email verification logic
    const verificationCode = this.registrationForm.get('verificationCode')?.value;
    // Call your backend API to verify the code
    this.nextStep();
  }

  sendVerificationCode() {
    const email = this.email?.value; // Assuming you have an email form control
    if (email) {
      this.authService.sendVerificationEmail(email).subscribe(
        (response) => {
          // Handle success, e.g., show a message to the user
          console.log('Verification email sent successfully');
        },
        (error) => {
          // Handle error, e.g., show an error message
          console.error('Error sending verification email', error);
        }
      );
    }
  }

  register() {
    if (this.currentStep === 1) {
      const formData = this.registrationForm.value;

      if (formData.role === 'owner') {
        if (!formData.idProof || !formData.storageProof) {
          Swal.fire('Error', 'Please provide both ID proof and proof of storage unit', 'error');
          return;
        }
      }

      this.authService.registerUser(formData).subscribe(
        (res) => {
          Swal.fire({
            title: 'Success',
            text: res.success || 'Registration successful',
            icon: 'success',
            iconColor: '#00ff00',
            confirmButtonText: 'OK'
          });
          this.router.navigate(['/login']);
          this.registrationForm.reset();
          this.currentStep = 1;
        },
        (err) => {
          const errorMessage = err?.error?.message || 'An error occurred during registration';
          Swal.fire('Error', errorMessage, 'error');
        }
      );
    } else if (this.currentStep === 2) {
      this.verifyEmail();
    }
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('pwd');
      const confirmPassword = control.get('confirmPassword');

      return password && confirmPassword && password.value !== confirmPassword.value
        ? { passwordMismatch: true }
        : null;
    };
  }

  updateOwnerDocumentsSection() {
    this.showOwnerDocumentsSection = this.role?.value === 'owner';
  }
}
