import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminArtistManagementComponent } from './admin-artist-management.component';

describe('AdminArtistManagementComponent', () => {
  let component: AdminArtistManagementComponent;
  let fixture: ComponentFixture<AdminArtistManagementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminArtistManagementComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminArtistManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
