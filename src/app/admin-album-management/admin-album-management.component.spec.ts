import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAlbumManagementComponent } from './admin-album-management.component';

describe('AdminAlbumManagementComponent', () => {
  let component: AdminAlbumManagementComponent;
  let fixture: ComponentFixture<AdminAlbumManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAlbumManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminAlbumManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
