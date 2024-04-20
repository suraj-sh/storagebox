import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdService } from 'src/app/services/ad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adpost',
  templateUrl: './adpost.component.html',
  styleUrls: ['./adpost.component.css']
})
export class AdpostComponent implements OnInit {
  postForm: FormGroup;
  imagePreviews: string[] = [];
  selectedImages: File[] = [];
  ad: any; // Define ad property
  adId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private adService: AdService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.adId = this.route.snapshot.params['id'];
    this.postForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      city: ['', Validators.required],
      mobileNo: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]], // Valid mobile number pattern
      price: ['', [Validators.required]],
      category: ['', Validators.required],
      isRented: [false],
      images: ['']
    });

    // Fetch ad details when editing
    if (this.adId) {
      this.fetchAdDetails();
    }
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.style.height = 'auto'; // Reset height to auto
      textarea.style.height = textarea.scrollHeight + 'px'; // Set height based on content
    }
  }

  // Format the price input with commas for thousands separators
  formatPrice(event: any) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/,/g, ''); // Remove existing commas
    let formattedValue = value.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Limit the length of the formatted value to prevent issues with large numbers
    if (formattedValue.length > 15) {
      formattedValue = formattedValue.substring(0, 15);
    }

    input.value = formattedValue;
  }

  fetchAdDetails() {
    this.adService.getAd(this.adId).subscribe(
      (ad: any) => {
        // Assign fetched ad details to ad property
        this.ad = ad;
        // Populate form fields with ad details
        this.postForm.patchValue({
          name: ad.name,
          description: ad.description,
          city: ad.city,
          mobileNo: ad.mobileNo,
          price: ad.price,
          category: ad.category,
          isRented: ad.isRented
        });

        // Display the existing images if available
        if (ad.images && ad.images.length > 0) {
          this.imagePreviews = ad.images;
        }
      },
      (error) => {
        console.error('Error fetching ad details:', error);
      }
    );
  }

  handleFileInput(event: any) {
    const fileList: FileList = event.target.files;
    const totalImages = this.selectedImages.length + fileList.length;

    if (totalImages > 8) {
      // More than 8 images selected, show error message
      Swal.fire('Error', 'Maximum 8 images allowed', 'error');
      return;
    }

    for (let i = 0; i < fileList.length; i++) {
      const file: File = fileList[i];
      // Add the image to the selectedImages array
      this.selectedImages.push(file);
      // Optional: Display image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  deleteImage(index: number) {
    // Remove the image preview from the imagePreviews array
    this.imagePreviews.splice(index, 1);

    // Remove the corresponding file from the selectedImages array
    this.selectedImages.splice(index, 1);

    // Reset selectedImages array when all images are cleared
    if (this.imagePreviews.length === 0) {
      this.selectedImages = [];
    }

    // Mark form as dirty to indicate changes
    this.postForm.markAsDirty();

    if (this.adId) {
      // Deleting an image when editing an existing ad
      if (!this.ad || !this.ad.images) {
        console.error('Invalid ad object or ad images:', this.ad);
        return;
      }

      const id = this.adId;

      console.log('Deleting image with id:', id, 'and index:', index);

      this.adService.deleteImage(id, index).subscribe(
        () => {
          // Image deleted successfully from the backend
          console.log('Image deleted successfully');
          // Remove the image from the ad object
          this.ad.images.splice(index, 1);
        },
        (error) => {
          console.error('Error deleting image:', error);
          Swal.fire('Error', 'Failed to delete image', 'error');
        }
      );
    }
  }


  post() {
    // Check if the form is valid
    if (this.postForm.valid) {

      // Remove commas from the price value
      let price = this.postForm.value.price.toString().replace(/,/g, '');
      this.postForm.patchValue({ price: price });

      // Validate if at least one image is selected
      if (this.selectedImages.length === 0 && (!this.ad || !this.ad.images || this.ad.images.length === 0)) {
        Swal.fire('Error', 'At least one image is required', 'error');
        return;
      }

      const formData = new FormData();

      // Append form data to FormData object
      Object.keys(this.postForm.value).forEach(key => {
        if (key === 'images') {
          // Append each new image file to FormData
          for (let i = 0; i < this.selectedImages.length; i++) {
            formData.append('images', this.selectedImages[i]);
          }
        } else {
          formData.append(key, this.postForm.value[key]);
        }
      });

      if (this.adId) {
        formData.append('id', this.adId);
      }

      // Determine whether to send a POST or PUT request based on whether adId exists
      const requestObservable = this.adId ?
        this.adService.updateAd(this.adId, formData) :
        this.adService.listAd(formData);

      // Send the request to update ad details
      requestObservable.subscribe(
        (response) => {
          const successMessage = this.adId ? 'Ad updated successfully' : 'Ad posted successfully';
          console.log('Ad details updated:', response);

          Swal.fire('Success', successMessage, 'success');
          this.postForm.reset(); // Reset form
          this.imagePreviews = []; // Clear image preview
          this.router.navigate(['/ads']);
        },
        (error) => {
          console.error('Error posting ad details:', error);
          const errorMessage = this.adId ? 'Failed to update ad' : 'Failed to post ad';
          Swal.fire('Error', errorMessage, 'error');
        }
      );
    }
    else {
      // Form is invalid, display an error message or handle it as needed
      console.error('Form is invalid. Cannot submit.');
      Swal.fire('Error', 'Please fill in all required fields correctly.', 'error');
    }
  }

}