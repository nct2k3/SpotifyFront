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

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  nextTrack(item: any) {
    this.nextTrackEvent.emit(item);
  }
}