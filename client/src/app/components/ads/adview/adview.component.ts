import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdService } from 'src/app/services/ad.service';

@Component({
  selector: 'app-adview',
  templateUrl: './adview.component.html',
  styleUrls: ['./adview.component.css']
})
export class AdviewComponent implements OnInit {

  isSidebarOpen: boolean = false;
  isBackIconVisible: boolean = false;
  selectedCity: string = 'Select City';
  selectedStorageType: string = 'Select category';
  selectedSortOption: string = 'Select Price';
  ads: any[];

  constructor(private adService: AdService, private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const cities = params.get('cities');
      const categories = params.get('categories');
      const sort = params.get('sort');

      this.selectedCity = cities || 'Select City';
      this.selectedStorageType = categories || 'Select category';
      this.selectedSortOption = sort || 'Select Price';

      this.applyFilters();
    });
  }

  fetchAds() {
    this.adService.getAds().subscribe(
      (data: any[]) => {
        this.ads = data.map(ad => {
          const clonedAd = { ...ad };
          // Format price for the cloned ad
          clonedAd.price = this.formatPrice(clonedAd.price);
          clonedAd.images.sort((a: { index: number }, b: { index: number }) => a.index - b.index);
          return clonedAd;
        });
      },
      (error) => {
        console.error('Error fetching ads:', error);
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

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    this.isBackIconVisible = this.isSidebarOpen;
  }

  closeFilters() {
    this.isSidebarOpen = false;
    this.isBackIconVisible = false;
  }

  onCityChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedCity = target.value;
  }

  onStorageTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedStorageType = target.value;
  }

  onSortOptionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.selectedSortOption = target.value;
  }

  applyFilters() {
    console.log('Selected Sort Option:', this.selectedSortOption);
    // Update query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        cities: this.selectedCity !== 'Select City' ? this.selectedCity : null,
        categories: this.selectedStorageType !== 'Select category' ? this.selectedStorageType : null,
        sort: this.selectedSortOption !== 'Select Price' ? this.selectedSortOption : null
      },
      queryParamsHandling: 'merge' // Preserve existing query parameters
    });

    this.isSidebarOpen = false
    this.isBackIconVisible = false;

    if (this.selectedStorageType !== 'Select category' && this.selectedCity !== 'Select City' && this.selectedSortOption !== 'Select Price') {
      this.adService.allFilters(this.selectedStorageType, this.selectedCity, this.getSortOptionValue()).subscribe(
        (filteredAds: any[]) => {
          this.ads = filteredAds.map(ad => {
            ad.price = this.formatPrice(ad.price);
            return ad;
          });
        },
        (error) => {
          console.error('Error applying filters:', error);
        }
      );
    }
    else if (this.selectedCity !== 'Select City') {
      this.adService.filterByCity(this.selectedCity).subscribe(
        (filteredAds: any[]) => {
          this.ads = filteredAds.map(ad => {
            ad.price = this.formatPrice(ad.price);
            return ad;
          });
        },
        (error) => {
          console.error('Error applying filters:', error);
        }
      );
    }
    else if (this.selectedStorageType !== 'Select category') {
      this.adService.filterByCategory(this.selectedStorageType).subscribe(
        (filteredAds: any[]) => {
          this.ads = filteredAds.map(ad => {
            ad.price = this.formatPrice(ad.price);
            return ad;
          });
        },
        (error) => {
          console.error('Error applying filters:', error);
        }
      );
    }
    else if (this.selectedSortOption === 'Price - Low to High') {
      console.log('Sorting: Low to High');
      this.adService.sortLowToHigh('low-to-high').subscribe(
        (sortedAds: any[]) => {
          this.ads = sortedAds.map(ad => {
            ad.price = this.formatPrice(ad.price);
            return ad;
          });
        },
        (error) => {
          console.error('Error sorting ads:', error);
        }
      );
    }
    else if (this.selectedSortOption === 'Price - High to Low') {
      console.log('Sorting: High to Low');
      this.adService.sortHighToLow('high-to-low').subscribe(
        (sortedAds: any[]) => {
          this.ads = sortedAds.map(ad => {
            ad.price = this.formatPrice(ad.price);
            return ad;
          });
        },
        (error) => {
          console.error('Error sorting ads:', error);
        }
      );
    }
    else {
      console.log('No sorting selected, fetching ads');
      this.fetchAds();
    }
  }

  // Helper method to get the corresponding sort option value
  getSortOptionValue(): string | null {
    if (this.selectedSortOption === 'Price - Low to High') {
      return 'low-to-high'; // Map to backend value for low-to-high sorting
    } 
    else if (this.selectedSortOption === 'Price - High to Low') {
      return 'high-to-low'; // Map to backend value for high-to-low sorting
    } 
    else {
      return null; // If no sort option is selected, return null
    }
  }


  clearFilters() {
    // Reset filter selections
    this.selectedCity = 'Select City';
    this.selectedStorageType = 'Select category';
    this.selectedSortOption = 'Select Price';

    // Remove query parameters from the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge' // Preserve existing query parameters
    });

    // Apply filters with cleared selections
    this.applyFilters();
  }


  viewAdDetails(ad: any) {
    this.router.navigate(['/details', ad.id]);
  }

}