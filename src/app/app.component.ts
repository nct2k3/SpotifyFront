import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { Conversation } from './Models/chat.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'FronEndSpoify';
  showHeaderFooter: boolean = true;
  selectedConversation: Conversation | null = null;

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const currentUrl = this.router.url;
      this.showHeaderFooter = !currentUrl.includes('/login') && !currentUrl.includes('/admin')&&!currentUrl.includes('/login')&&!currentUrl.includes('/register');
    });
  }

  onConversationSelected(conversation: Conversation) {
    this.selectedConversation = conversation; // Update selected conversation
  }

  onChatClose() {
    this.selectedConversation = null; // Reset selected conversation when chat is closed
  }
}