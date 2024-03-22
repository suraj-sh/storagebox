import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdService } from 'src/app/services/ad.service';

@Component({
  selector: 'app-adview',
  templateUrl: './adview.component.html',
  styleUrls: ['./adview.component.css']
})
export class AdviewComponent implements OnInit {

  isSidebarOpen: boolean = false;
  isBackIconVisible: boolean = false;
  ads: any[];
  noAdsFound: boolean = false;
  filterForm: FormGroup;

  constructor(private adService: AdService, private router: Router,
    private route: ActivatedRoute, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.filterForm = this.fb.group({
      city: ['Select City'],
      category: ['Select category'],
      price: ['Sort by Price']
    });

    this.route.queryParamMap.subscribe(params => {
      const cities = params.get('cities');
      const categories = params.get('categories');
      const price = params.get('price');

      this.filterForm.patchValue({
        city: cities || 'Select City',
        category: categories || 'Select category',
        price: price || 'Sort by Price'
      });

      this.applyFilters();
    });
  }

  fetchAds() {
    this.adService.getAds().subscribe(
      (data: any[]) => {
        this.ads = data.map(ad => {
          const clonedAd = { ...ad };
          clonedAd.price = this.formatPrice(clonedAd.price);
          clonedAd.images.forEach((image: any) => {
          });
          return clonedAd;
        });
      },
      (error) => {
        console.error('Error fetching ads:', error);
      }
    );
  }

  formatPrice(price: string | number): string {
    const priceString = typeof price === 'number' ? price.toString() : price;
    return priceString.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.isBackIconVisible = this.isSidebarOpen;
  }

  closeFilters() {
    this.isSidebarOpen = false;
    this.isBackIconVisible = false;
  }

  applyFilters() {
    this.noAdsFound = false;
    this.isSidebarOpen = false;
    this.isBackIconVisible = false;

    const filters = this.filterForm.value;
    let queryParams: any = {};

    if (filters.city !== 'Select City') {
      queryParams['cities'] = filters.city;
    }
    if (filters.category !== 'Select category') {
      queryParams['categories'] = filters.category;
    }
    if (filters.price !== 'Sort by Price') {
      queryParams['sort'] = filters.price === 'Price - Low to High' ? 'low-to-high' : 'high-to-low';
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });

    if (Object.keys(queryParams).length) {
      this.adService.allFilters(this.constructQueryString(queryParams)).subscribe(
        (filteredAds: any[]) => {

          if (filteredAds !== null && filteredAds.length > 0) {
            this.ads = filteredAds.map(ad => {
              ad.price = this.formatPrice(ad.price);
              return ad;
            });
            this.noAdsFound = false;
          }
          else {
            this.ads = [];
            this.noAdsFound = true;
          }

          // Update the form control for price to retain the selected value
          this.filterForm.patchValue({
            price: filters.price
          });

        },
        (error) => {
          console.error('Error applying filters:', error);
        }
      );
    }
    else {
      this.fetchAds();
    }

  }

  constructQueryString(params: any): string {
    let queryString = '';
    for (const key in params) {
      if (params.hasOwnProperty(key)) {
        queryString += `${key}=${encodeURIComponent(params[key])}&`;
      }
    }
    return queryString.slice(0, -1); // Remove trailing '&'
  }


  clearFilters() {
    this.filterForm.reset({
      city: 'Select City',
      category: 'Select category',
      price: 'Sort by Price'
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge'
    }).then(() => {
      // Navigate again to remove the URL fragment
      this.router.navigate(['.'], { relativeTo: this.route, replaceUrl: true });
    });

    this.noAdsFound = false;
    this.isSidebarOpen = false;
    this.isBackIconVisible = false;

    this.fetchAds(); // Fetch all ads when filters are cleared
  }


  viewAdDetails(ad: any) {
    this.router.navigate(['/details', ad.id]);
  }

}