import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdviewService } from 'src/app/services/adview.service';

@Component({
  selector: 'app-adview',
  templateUrl: './adview.component.html',
  styleUrls: ['./adview.component.css']
})
export class AdviewComponent implements OnInit {

  isSidebarOpen: boolean = false;
  isBackIconVisible: boolean = false;

  ads: any[];

  constructor(private adViewService: AdviewService, private router: Router) { }

  ngOnInit(): void {
    this.fetchAds();
  }

  fetchAds() {
    this.adViewService.getads().subscribe(
      (data: any[]) => {
        this.ads = data;
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

  viewAdDetails(ad: any) {
    // Navigate to the details page and pass the ad data
    this.router.navigate(['/details', ad.id]);
  }

}
