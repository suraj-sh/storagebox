import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdviewComponent } from './adview.component';

describe('AdviewComponent', () => {
  let component: AdviewComponent;
  let fixture: ComponentFixture<AdviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdviewComponent]
    });
    fixture = TestBed.createComponent(AdviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
