import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AdpostService } from 'src/app/services/adpost.service';
import { AdviewService } from 'src/app/services/adview.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-adpost',
  templateUrl: './adpost.component.html',
  styleUrls: ['./adpost.component.css']
})
export class AdpostComponent implements OnInit {
  postForm: FormGroup;
  imagePreviews: string[] = [];
  selectedImage: File | null = null;
  isUpdate: boolean = true;
  ad: any; // Define ad property
  adId: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private adPostService: AdpostService,
    private adViewService: AdviewService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.adId = this.route.snapshot.params['id'];
    this.postForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      city: ['', Validators.required],
      mobileNo: ['', Validators.required],
      price: ['', Validators.required],
      category: ['', Validators.required],
      isRented: [false, Validators.required], // Initialize isRented to false
      image: [''] // No need for required since it's optional when editing
    });

    // Fetch ad details when editing
    if (this.adId) {
      this.fetchAdDetails();
    }
  }

  removeImage(imageUrl: string) {
    // Find the index of the image in the imagePreviews array
    const index = this.imagePreviews.indexOf(imageUrl);
    if (index !== -1) {
      // Remove the image from the imagePreviews array
      this.imagePreviews.splice(index, 1);
    }
  }

  fetchAdDetails() {
    this.adViewService.getad(this.adId).subscribe(
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
          category: ad.category
        });

        // Display the existing image if available
        if (ad.image) {
          this.imagePreviews = [ad.image];
        }
      },
      (error) => {
        console.error('Error fetching ad details:', error);
      }
    );
  }

  handleFileInput(event: any) {
    const fileList: FileList = event.target.files;
    if (fileList.length > 0) {
      this.selectedImage = fileList[0]; // Assuming only one file is selected
      // Optional: Display image preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    if (textarea instanceof HTMLTextAreaElement) {
      textarea.style.height = 'auto'; // Reset height to auto
      textarea.style.height = textarea.scrollHeight + 'px'; // Set height based on content
    }
  }

  handleAdditionalImageInput(event: any) {
    const fileList: FileList = event.target.files;
    for (let i = 0; i < fileList.length; i++) {
      const file: File = fileList[i];
    }
  }

  deleteImage() {
    if (!this.ad || !this.ad.image || !this.ad.id) {
      console.error('Invalid ad object:', this.ad);
      return;
    }

    const imageName = this.ad.image;
    const id = this.ad.id;

    console.log('Deleting image with id:', id, 'and name:', imageName);

    this.adPostService.deleteimage(id, imageName).subscribe(
      () => {
        // Image deleted successfully
        console.log('Image deleted successfully');
        // Remove the image from the previews array
        this.imagePreviews = this.imagePreviews.filter(preview => preview !== imageName);
      },
      (error) => {
        console.error('Error deleting image:', error);
        Swal.fire('Error', 'Failed to delete image', 'error');
      }
    );
  }



  post() {
    if (!this.postForm.valid) {
      Swal.fire('Error', 'Please fill in all required fields', 'error');
      return;
    }
  
    // Create FormData object
    const formData = new FormData();
  
    // Append form data to FormData object
    Object.keys(this.postForm.value).forEach(key => {
      formData.append(key, this.postForm.value[key]);
    });
  
    // Append ad ID to the form data if it exists
    if (this.adId) {
      formData.append('id', this.adId);
    }
  
    // Append image file to FormData if a new image is selected
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }
  
    // Determine whether to send a POST or PUT request based on whether adId exists
    const requestObservable = this.adId ?
      this.adPostService.updateAd(this.adId, formData) :
      this.adPostService.listad(formData);
  
    // Send the request to update ad details
    requestObservable.subscribe(
      (response) => {
        const successMessage = this.adId ? 'Ad updated successfully' : 'Ad posted successfully';
        console.log('Ad details updated:', response);
  
        // If a new image is selected, update the image separately
        if (this.selectedImage) {
          // Call updateimage method to update the image
          this.adPostService.updateimage(this.adId, formData).subscribe(
            (imageResponse) => {
              console.log('Image updated successfully:', imageResponse);
            },
            (imageError) => {
              console.error('Error updating image:', imageError);
              Swal.fire('Error', 'Failed to update image', 'error');
            }
          );
        }
  
        Swal.fire('Success', successMessage, 'success');
        this.postForm.reset(); // Reset form
        this.imagePreviews = []; // Clear image preview
      },
      (error) => {
        console.error('Error posting ad details:', error);
        const errorMessage = this.adId ? 'Failed to update ad' : 'Failed to post ad';
        Swal.fire('Error', errorMessage, 'error');
      }
    );
  }
  

}
