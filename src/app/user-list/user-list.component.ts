import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileService } from '../services/profile/profile.service';
import { ChatService } from '../services/Chat/chat.service';
import { Users } from '../Models/user.model';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: Users[] = [];
  currentUserId: string = localStorage.getItem('user_id') || '';
  errorMessage: string = '';

  constructor(
    private profileService: ProfileService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.profileService.getAllUsers().subscribe({
      next: (users) => {
        console.log('Raw API response:', users);
        // Lọc bỏ người dùng hiện tại khỏi danh sách hiển thị (nếu cần)
        this.users = users.filter(user => user.id.toString() !== this.currentUserId);
        console.log('Filtered users:', this.users);
        this.errorMessage = this.users.length === 0 ? 'Không tìm thấy người dùng nào.' : '';
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.errorMessage = 'Không thể tải danh sách người dùng. Vui lòng kiểm tra lại đăng nhập.';
      }
    });
  }

  startChat(user: Users): void {
    if (!user || !user.id) {
      this.errorMessage = 'Không thể bắt đầu chat: ID người dùng không hợp lệ.';
      return;
    }

    this.chatService.getChatList().subscribe({
      next: (chats) => {
        const existingChat = chats.find(
          (chat: any) => chat.other_user_id === user.id.toString()
        );
        if (existingChat) {
          this.router.navigate(['/chat', existingChat.id]);
        } else {
          this.createChat(user.id);
        }
      },
      error: (err) => {
        console.error('Error starting chat:', err);
        this.errorMessage = 'Không thể bắt đầu chat. Vui lòng thử lại.';
      }
    });
  }

  createChat(otherUserId: number): void {
    if (!otherUserId) {
      this.errorMessage = 'Không thể tạo chat: ID người dùng không hợp lệ.';
      return;
    }

    this.chatService.createChat(otherUserId.toString()).subscribe({
      next: (chat) => {
        this.router.navigate(['/chat', chat.id]);
      },
      error: (err) => {
        console.error('Error creating chat:', err);
        this.errorMessage = 'Không thể tạo chat mới. Vui lòng thử lại.';
      }
    });
  }
}
