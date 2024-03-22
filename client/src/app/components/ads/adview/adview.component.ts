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

    // Close the sidebar and hide the back icon
    this.isSidebarOpen = false;
    this.isBackIconVisible = false;
    
    // Update query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        cities: this.selectedCity !== 'Select City' ? this.selectedCity : null,
        categories: this.selectedStorageType !== 'Select category' ? this.selectedStorageType : null,
        sort: this.selectedSortOption
      },
      queryParamsHandling: 'merge' // Preserve existing query parameters
    });

    // Check if all filters are selected
    if (this.selectedCity !== 'Select City' && this.selectedStorageType !== 'Select category' && this.selectedSortOption !== 'Select Price') {
      this.applyAllFilters();
      return; // Return to prevent further execution
    }

    // Apply city filter
    if (this.selectedCity !== 'Select City') {
      this.filterByCity(this.selectedCity, this.selectedSortOption);
      return; // Return to prevent further execution
    }

    // Apply category filter
    if (this.selectedStorageType !== 'Select category') {
      this.filterByCategory(this.selectedStorageType, this.selectedSortOption);
      return; // Return to prevent further execution
    }

    // Apply sorting option
    if (this.selectedSortOption === 'Price - Low to High') {
      this.sortLowToHigh();
    } 
    else if (this.selectedSortOption === 'Price - High to Low') {
      this.sortHighToLow();
    } 
    else {
      // Fetch all ads if no filters are applied
      this.fetchAds();
    }
  }

  getSortOptionValue(): string {
    if (this.selectedSortOption === 'Price - Low to High') {
      return 'low-to-high'; // Map to backend value for low-to-high sorting
    } else if (this.selectedSortOption === 'Price - High to Low') {
      return 'high-to-low'; // Map to backend value for high-to-low sorting
    } else {
      return 'dateCreated'; // If no sort option is selected, return null
    }
  }


  applyAllFilters() {
    const selectedCategory: string = this.selectedStorageType !== 'Select category' ? this.selectedStorageType : '';
    const selectedCity: string = this.selectedCity !== 'Select City' ? this.selectedCity : '';
    const selectedSortOption: string = this.selectedSortOption !== 'Select Price' ? this.getSortOptionValue() : '';
  
    this.adService.allFilters(selectedCategory, selectedCity, selectedSortOption).subscribe(
      (filteredAds: any[]) => {
        this.ads = filteredAds.map(ad => {
          ad.price = this.formatPrice(ad.price);
          return ad;
        });
      },
      (error) => {
        console.error('Error applying all filters:', error);
      }
    );
  }

  filterByCity(city: string, sortOption: string | null = null) {
    this.adService.filterByCity(city).subscribe(
      (filteredAds: any[]) => {
        this.ads = filteredAds.map(ad => {
          ad.price = this.formatPrice(ad.price);
          return ad;
        });
      },
      (error) => {
        console.error('Error applying city filter:', error);
      }
    );
  }

  filterByCategory(category: string, sortOption: string | null = null) {
    this.adService.filterByCategory(category).subscribe(
      (filteredAds: any[]) => {
        this.ads = filteredAds.map(ad => {
          ad.price = this.formatPrice(ad.price);
          return ad;
        });
      },
      (error) => {
        console.error('Error applying category filter:', error);
      }
    );
  }

  sortLowToHigh() {
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

  sortHighToLow() {
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


  clearFilters() {

    // Reset filter selections
    this.selectedCity = 'Select City';
    this.selectedStorageType = 'Select category';
    this.selectedSortOption = 'Select Price';

    // Reset filter menu options
    const citySelect = document.getElementById('city') as HTMLSelectElement;
    citySelect.selectedIndex = 0;

    const storageTypeSelect = document.getElementById('storageType') as HTMLSelectElement;
    storageTypeSelect.selectedIndex = 0;

    const sortOptionSelect = document.getElementById('sortOption') as HTMLSelectElement;
    sortOptionSelect.selectedIndex = 0;

    // Remove query parameters from the URL
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'merge' // Preserve existing query parameters
    });

    // Close the sidebar and hide the back icon
    this.isSidebarOpen = false;
    this.isBackIconVisible = false;

    // Apply filters with cleared selections
    this.applyFilters();
  }

  viewAdDetails(ad: any) {
    this.router.navigate(['/details', ad.id]);
  }

}