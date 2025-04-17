import { Component } from '@angular/core';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  activeComponent: string = 'dashboard';

  // Nhận sự kiện và cập nhật activeComponent
  onActiveComponentChange(component: string) {
    this.activeComponent = component;
  }
}
