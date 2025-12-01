import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CancerClassifierPage } from './cancer-classifier.page';

describe('CancerClassifierPage', () => {
  let component: CancerClassifierPage;
  let fixture: ComponentFixture<CancerClassifierPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CancerClassifierPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
