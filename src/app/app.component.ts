import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
interface Conversation {
  id: number;
  name: string;
  profilePicture?: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'FronEndSpoify';
  showHeaderFooter: boolean = true;
  selectedConversation: Conversation | null = null;

  onConversationSelected(conversation: Conversation) {
    this.selectedConversation = conversation; // Cập nhật hội thoại được chọn
  }

  onChatClose() {
    this.selectedConversation = null; // Đóng chat và reset hội thoại
  }


  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.showHeaderFooter = !currentUrl.includes('/login')
      this.showHeaderFooter = !currentUrl.includes('/admin');
      ;
    });
  }
}
