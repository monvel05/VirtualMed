import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScheduleForDoctorPage } from './schedule-for-doctor.page';

describe('ScheduleForDoctorPage', () => {
  let component: ScheduleForDoctorPage;
  let fixture: ComponentFixture<ScheduleForDoctorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleForDoctorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
