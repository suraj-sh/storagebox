import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/auth.service';
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
  showTooltip = false;

  constructor(private authService: AuthenticationService, private formBuilder: FormBuilder,
              private router: Router) { }

  registrationForm = this.formBuilder.group({
    user: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
    verificationCode: ['', Validators.required],
    pwd: ['', [Validators.required, Validators.minLength(12), Validators.pattern(/^(?=.*[0-9])(?=.*[!@#$%^&*])/)]],
    confirmPassword: ['', [Validators.required]],
    isSeller: [false],
    idProof: [''],
    documentProof: ['']
  });


  get form() {
    return this.registrationForm.controls;
  }


  trimInputs() {
    const trimmedValues = {
      user: this.registrationForm.get('user')?.value?.trim() ?? '',
      email: this.registrationForm.get('email')?.value?.trim() ?? '',
      verificationCode: this.registrationForm.get('verificationCode')?.value?.trim() ?? '',
      pwd: this.registrationForm.get('pwd')?.value?.trim() ?? '',
      confirmPassword: this.registrationForm.get('confirmPassword')?.value?.trim() ?? '',
    };
  
    this.registrationForm.patchValue(trimmedValues);
  }
  

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
      } else if (formControlName === 'documentProof') {
        this.filesStorageProof = file;
      }
    }
  }

  isPdfFile(file: File): boolean {
    return file.type === 'application/pdf';
  }

  nextStep() {
    this.currentStep++;
  }

  prevStep() {
    this.currentStep--;
  }

  toggleTooltip(tooltipId: string) {
    this.showTooltip = !this.showTooltip;
  }

  sendVerificationCode() {
    this.trimInputs();

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

    if (this.form.isSeller?.value) {
      if (!this.filesIdProof || !this.filesStorageProof) {
        Swal.fire('Error', 'Please provide both ID proof and proof of the storage unit', 'error');
        return;
      }
    }

    this.showSpinner = true;

    this.authService.sendVerificationEmail(formData).subscribe(
      (response) => {
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
    this.trimInputs();

    if (!this.registrationForm.invalid) {
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
          Swal.fire({
            title: 'Success',
            text: response.success || 'Registration successful',
            icon: 'success',
            iconColor: '#00ff00',
            confirmButtonText: 'OK'
          });
          this.showSpinner = false;
          this.router.navigate(['/login']);
        }
      );
    }
  }

  isButtonDisabled(): boolean {
    return this.registrationForm.invalid || this.registrationForm.get('pwd')?.value !== this.registrationForm.get('confirmPassword')?.value;
  }

  isSendVerificationDisabled(): boolean {
    const userControl = this.registrationForm.get('user');
    const emailControl = this.registrationForm.get('email');

    if (!userControl?.value || userControl?.invalid || !emailControl?.value || emailControl.invalid) {
      return true;
    }

    const isSellerValue = this.form.isSeller?.value;
    if (isSellerValue) {
      if (!this.filesIdProof || !this.filesStorageProof) {
        return true;
      }
    }

    return false;
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  updateOwnerDocumentsSection() {
    this.showOwnerDocumentsSection = this.form.isSeller?.value === true;
  }
}
