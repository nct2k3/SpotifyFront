import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  activeComponent: string = 'dashboard';

  constructor(private router: Router) {}

  ngOnInit(): void {
    if (localStorage.getItem('is_staff') == 'false') {
      this.router.navigate(['/home']);
    }

    if (!localStorage.getItem('token')) {
      this.router.navigate(['/login']);
    }
  }

  // Nhận sự kiện và cập nhật activeComponent
  onActiveComponentChange(component: string) {
    this.activeComponent = component;
  }
}
