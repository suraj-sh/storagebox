import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdService } from 'src/app/services/ad.service';
import { DatePipe } from '@angular/common'; // Import DatePipe
import { ProfileService } from 'src/app/services/profile.service';

@Component({
  selector: 'app-ad-detail',
  templateUrl: './ad-detail.component.html',
  styleUrls: ['./ad-detail.component.css']
})
export class AdDetailComponent implements OnInit {

  storage: any;
  selectedImageIndex: number = 0; // Track the index of the selected image
  currentIndex: number = 0;
  dataLoaded: boolean = false;
  userProfile: any;

  constructor(private route: ActivatedRoute, private adService: AdService,
              private datePipe: DatePipe, private profileService: ProfileService) { }

  ngOnInit(): void {
    this.getStorageDetails();
  }

  getStorageDetails() {
    const storageId = this.route.snapshot.paramMap.get('id');
    this.adService.getAd(storageId).subscribe(
      (data: any) => {
        data.price = this.formatPrice(data.price);
        this.storage = data;
        this.dataLoaded = true;
        // Ensure that storage.userId is available and valid
        if (this.storage && this.storage.user && this.storage.user.id) {
          this.loadUserProfile(this.storage.user.id); // Pass the userId to loadUserProfile
        } else {
          console.error('User ID is missing or invalid.');
        }
      },
      (error) => {
        console.error('Error fetching storage details:', error);
      }
    );
  }
  
  loadUserProfile(userId: string): void {
    this.profileService.getUser(userId).subscribe(
      (userData: any) => {
        this.userProfile = userData;
      },
      (error: any) => {
        console.error('Error fetching user details:', error);
      }
    );
  }
  
  
  // Method to format price with commas
  formatPrice(price: string | number): string {
    // Convert price to string if it's a number
    const priceString = typeof price === 'number' ? price.toString() : price;
    // Use regex to add commas for thousands separator
    return priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  isSelectedImage(index: number): boolean {
    return index === this.selectedImageIndex;
  }

  prevImage() {
    if (this.selectedImageIndex > 0) {
      this.selectedImageIndex--; // Move to the previous image
    }
    else {
      // If at the first image, loop back to the last image
      this.selectedImageIndex = this.storage.images.length - 1;
    }
  }

  nextImage() {
    if (this.selectedImageIndex < this.storage.images.length - 1) {
      this.selectedImageIndex++; // Move to the next image
    }
    else {
      // If at the last image, loop back to the first image
      this.selectedImageIndex = 0;
    }
  }

  formatDate(date: string): string {
    const currentDate = new Date();
    const providedDate = new Date(date);

    // Check if the dates are from the same day
    if (currentDate.getFullYear() === providedDate.getFullYear() &&
      currentDate.getMonth() === providedDate.getMonth() &&
      currentDate.getDate() === providedDate.getDate()) {
      return 'Today';
    }
    else {
      // Get the date of yesterday
      const yesterday = new Date();
      yesterday.setDate(currentDate.getDate() - 1);

      // Check if the provided date is from yesterday
      if (yesterday.getFullYear() === providedDate.getFullYear() &&
        yesterday.getMonth() === providedDate.getMonth() &&
        yesterday.getDate() === providedDate.getDate()) {
        return 'Yesterday';
      }
      else {
        // Use DatePipe to format the date
        const formattedDate = this.datePipe.transform(providedDate, 'mediumDate');
        // Check if formattedDate is null, and provide a fallback value if so
        return formattedDate || 'Unknown Date';
      }
    }
  }

}