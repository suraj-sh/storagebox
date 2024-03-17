import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdpostComponent } from './adpost.component';

describe('AdpostComponent', () => {
  let component: AdpostComponent;
  let fixture: ComponentFixture<AdpostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdpostComponent]
    });
    fixture = TestBed.createComponent(AdpostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
