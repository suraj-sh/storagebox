import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AdviewService } from 'src/app/services/adview.service';
import { DatePipe } from '@angular/common'; // Import DatePipe

@Component({
  selector: 'app-ad-detail',
  templateUrl: './ad-detail.component.html',
  styleUrls: ['./ad-detail.component.css']
})
export class AdDetailComponent implements OnInit {

  storage: any;

  constructor(private route: ActivatedRoute, private adViewService: AdviewService, 
              private datePipe: DatePipe) { }

  ngOnInit(): void {
    this.getStorageDetails();
  }

  getStorageDetails() {
    const storageId = this.route.snapshot.paramMap.get('id');
    this.adViewService.getad(storageId).subscribe(
      (data: any) => {
        this.storage = data;
      },
      (error) => {
        console.error('Error fetching storage details:', error);
      }
    );
  }

  formatDate(date: string): string {
    const currentDate = new Date();
    const providedDate = new Date(date);

    // Check if the dates are from the same day
    if (
        currentDate.getFullYear() === providedDate.getFullYear() &&
        currentDate.getMonth() === providedDate.getMonth() &&
        currentDate.getDate() === providedDate.getDate()
    ) {
        return 'Today';
    } else {
        // Get the date of yesterday
        const yesterday = new Date();
        yesterday.setDate(currentDate.getDate() - 1);

        // Check if the provided date is from yesterday
        if (
            yesterday.getFullYear() === providedDate.getFullYear() &&
            yesterday.getMonth() === providedDate.getMonth() &&
            yesterday.getDate() === providedDate.getDate()
        ) {
            return 'Yesterday';
        } else {
            // Use DatePipe to format the date
            const formattedDate = this.datePipe.transform(providedDate, 'mediumDate');
            // Check if formattedDate is null, and provide a fallback value if so
            return formattedDate || 'Unknown Date';
        }
    }
}


}
