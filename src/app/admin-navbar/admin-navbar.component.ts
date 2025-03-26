import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.css']
})
export class AdminNavbarComponent {
  @Output() activeComponentChange = new EventEmitter<string>();

  // Hàm phát ra sự kiện
  onComponentSelect(component: string) {
    this.activeComponentChange.emit(component);
  }
}
