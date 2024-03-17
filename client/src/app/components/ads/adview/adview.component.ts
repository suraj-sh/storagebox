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
      const city = params.get('city');
      const storageType = params.get('storageType');
      const sortOption = params.get('sortOption');

      this.selectedCity = city || 'Select City';
      this.selectedStorageType = storageType || 'Select category';
      this.selectedSortOption = sortOption || 'Select Price';

      this.applyFilters();
    });
  }

  fetchAds() {
    this.adService.getads().subscribe(
      (data: any[]) => {
        this.ads = data.map(ad => {
          const clonedAd = { ...ad };
          clonedAd.images.sort((a: { index: number }, b: { index: number }) => a.index - b.index);
          return clonedAd;
        });
      },
      (error) => {
        console.error('Error fetching ads:', error);
      }
    );
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
    // Update query parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        city: this.selectedCity !== 'Select City' ? this.selectedCity : null,
        storageType: this.selectedStorageType !== 'Select category' ? this.selectedStorageType : null,
        sortOption: this.selectedSortOption !== 'Select Price' ? this.selectedSortOption : null
      },
      queryParamsHandling: 'merge' // Preserve existing query parameters
    });

    this.isSidebarOpen = false
    this.isBackIconVisible = false;
    if (this.selectedStorageType !== 'Select category' && this.selectedCity !== 'Select City' && this.selectedSortOption !== 'Select Price') {
      this.adService.allFilters(this.selectedStorageType, this.selectedCity, this.selectedSortOption).subscribe(
        (filteredAds: any[]) => {
          this.ads = filteredAds;
        },
        (error) => {
          console.error('Error applying filters:', error);
        }
      );
    }
    else if (this.selectedCity !== 'Select City') {
      this.adService.filterByCity(this.selectedCity).subscribe(
        (filteredAds: any[]) => {
          this.ads = filteredAds;
        },
        (error) => {
          console.error('Error applying filters:', error);
        }
      );
    }
    else if (this.selectedStorageType !== 'Select category') {
      this.adService.filterByCategory(this.selectedStorageType).subscribe(
        (filteredAds: any[]) => {
          this.ads = filteredAds;
        },
        (error) => {
          console.error('Error applying filters:', error);
        }
      );
    }
    else if (this.selectedSortOption === 'Price - Low to High') {
      this.adService.sortLowToHigh(this.selectedSortOption).subscribe(
        (sortedAds: any[]) => {
          this.ads = sortedAds;
        },
        (error) => {
          console.error('Error sorting ads:', error);
        }
      );
    }
    else if (this.selectedSortOption === 'Price - High to Low') {
      this.adService.sortHighToLow(this.selectedSortOption).subscribe(
        (sortedAds: any[]) => {
          this.ads = sortedAds;
        },
        (error) => {
          console.error('Error sorting ads:', error);
        }
      );
    }
    else {
      this.fetchAds();
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
