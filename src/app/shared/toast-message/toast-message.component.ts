import { Component } from '@angular/core';

@Component({
  selector: 'app-toast-message',
  templateUrl: './toast-message.component.html',
  styleUrls: ['./toast-message.component.css']
})
export class ToastMessageComponent {
  message = '';
  show = false;
  type: 'success' | 'error' = 'success';

  showMessage(msg: string, type: 'success' | 'error' = 'success') {
    this.message = msg;
    this.type = type;
    this.show = true;
    setTimeout(() => this.show = false, 3000); // 3s tự ẩn
  }
}
