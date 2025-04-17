import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDashboardManagementComponent } from './admin-dashboard-management.component';

describe('AdminDashboardManagementComponent', () => {
  let component: AdminDashboardManagementComponent;
  let fixture: ComponentFixture<AdminDashboardManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminDashboardManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboardManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
