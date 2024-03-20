import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdService } from 'src/app/services/ad.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ad-dashboard',
  templateUrl: './ad-dashboard.component.html',
  styleUrls: ['./ad-dashboard.component.css']
})
export class AdDashboardComponent implements OnInit {

  postedAds: any[] = [];

  constructor(private adService: AdService, private router: Router) { }

  ngOnInit(): void {
    this.fetchPostedAds();
  }

  fetchPostedAds() {
    this.adService.getPostedAds().subscribe(
      (ads: any[]) => {
        // Format the price for each ad in the array
        this.postedAds = ads.map(ad => ({
          ...ad,
          price: this.formatPrice(ad.price) // Format the price for this ad
        }));
      },
      (error) => {
        console.error('Error fetching posted ads:', error);
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

  viewAdDetails(adId: string) {
    // Navigate to ad details view, passing the ad ID as a route parameter
    this.router.navigate(['/details', adId]);
  }

  editAd(adId: string) {
    // Navigate to the AdpostComponent with the ad ID as a parameter
    this.router.navigate(['/edit-ad', adId]);
  }

  deleteAd(adId: string): void {
    // Call the deleteAd method from the ad service
    this.adService.deleteAd(adId).subscribe(
      () => {
        Swal.fire({
          title: 'Ad Deleted',
          icon: 'success',
          iconColor: '#00ff00',
        }).then(() => {
          this.fetchPostedAds();
        });
      },
      (error) => {
        console.error('Error deleting ad:', error);
        // Handle error (e.g., display error message)
      }
    );
  }
}
