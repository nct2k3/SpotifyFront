import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarChatComponent } from './side-bar-chat.component';

describe('SideBarChatComponent', () => {
  let component: SideBarChatComponent;
  let fixture: ComponentFixture<SideBarChatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SideBarChatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
