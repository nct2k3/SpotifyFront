import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSongsManagementComponent } from './admin-songs-management.component';

describe('AdminSongsManagementComponent', () => {
  let component: AdminSongsManagementComponent;
  let fixture: ComponentFixture<AdminSongsManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminSongsManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSongsManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
