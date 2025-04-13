import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent {
  @Input() sidebarVisible: boolean = true;
  @Input() myplaylist: any[] = [];
  
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  @Output() nextTrackEvent = new EventEmitter<any>();
  
  username: string | null = '';
  email: string | null = '';
  userId: string | null = '';

  ngOnInit(){
    this.username = localStorage.getItem('user');
    this.email = localStorage.getItem('email');
    this.userId = localStorage.getItem('user_id');
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  nextTrack(item: any) {
    this.nextTrackEvent.emit(item);
  }
}