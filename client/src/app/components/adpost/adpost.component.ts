import { Component } from '@angular/core';

@Component({
  selector: 'app-adpost',
  templateUrl: './adpost.component.html',
  styleUrls: ['./adpost.component.css']
})
export class AdpostComponent {

  imagePreviews: string[] = [];

  handleFileInput(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviews.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  } 

}
