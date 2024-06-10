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
  dataLoaded: boolean = false;
  skeletonAds: any[] = Array(6).fill({});
  showSpinner: boolean = false;
  noAds: boolean = false;
  hasError: boolean = false;

  constructor(private adService: AdService, private router: Router) { }

  ngOnInit(): void {
    this.fetchPostedAds();
  }

  fetchPostedAds() {
    this.adService.getPostedAds().subscribe(
      (ads: any[]) => {
        if (!ads || ads.length === 0) {
          this.noAds = true;
        } else {
          this.postedAds = ads.map(ad => ({
            ...ad,
            price: this.formatPrice(ad.price)
          }));
          this.skeletonAds = Array(this.postedAds.length).fill({});
          this.noAds = false;
        }
        this.dataLoaded = true;
        this.hasError = false;
      },
      (error) => {
        console.error('Error fetching posted ads:', error);
        this.dataLoaded = true;
        this.hasError = true;
      }
    );
  }

  formatPrice(price: string | number): string {
    const priceString = typeof price === 'number' ? price.toString() : price;
    return priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  viewAdDetails(adId: string) {
    this.router.navigate(['/details', adId]);
  }

  editAd(adId: string) {
    this.router.navigate(['/edit-ad', adId]);
  }

  deleteAd(adId: string): void {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this ad!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
    }).then((result) => {
      if (result.isConfirmed) {
        this.showSpinner = true;
        this.adService.deleteAd(adId).subscribe(
          () => {
            Swal.fire({
              title: 'Ad Deleted',
              text: 'Your ad has been deleted.',
              icon: 'success',
              iconColor: '#00ff00',
            }).then(() => {
              this.showSpinner = false;
              this.fetchPostedAds();
            });
          },
          (error) => {
            console.error('Error deleting ad:', error);
            this.showSpinner = false;
          }
        );
      }
    });
  }
}