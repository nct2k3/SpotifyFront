import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-songs-management',
  templateUrl: './admin-songs-management.component.html',
  styleUrls: ['./admin-songs-management.component.css']
})
export class AdminSongsManagementComponent {
  searchTerm: string = ''; // Dùng để tìm kiếm người dùng
  songs = [
    { title: "1", artists: 'join', genre: 'John', file_location: 'Doe', image_location: 'john@example.com', duration: 'Admin'},
    { title: "1", artists: 'join', genre: 'John', file_location: 'Doe', image_location: 'john@example.com', duration: 'Admin'},
    { title: "1", artists: 'join', genre: 'John', file_location: 'Doe', image_location: 'john@example.com', duration: 'Admin'},
    { title: "1", artists: 'join', genre: 'John', file_location: 'Doe', image_location: 'john@example.com', duration: 'Admin'},
    { title: "1", artists: 'join', genre: 'John', file_location: 'Doe', image_location: 'john@example.com', duration: 'Admin'},
    { title: "1", artists: 'join', genre: 'John', file_location: 'Doe', image_location: 'john@example.com', duration: 'Admin'},
  ];

  // Hàm lọc người dùng theo từ khóa tìm kiếm
  filteredSongs() {
    return this.songs.filter(song => {
      return song.title.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
             song.artists.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
             song.genre.toLowerCase().includes(this.searchTerm.toLowerCase());
    });
  }

  // Chức năng edit người dùng (hiện tại chỉ là một phương thức mẫu)
  editSong(song: any) {
    console.log('Editing song:', song);
    // Bạn có thể mở một modal hoặc trang chỉnh sửa ở đây
  }

  // Chức năng xóa người dùng
  deleteSong(songTitle: string) {
    // this.songs = this.songs.filter(song => song.id !== songId);
    // console.log('Song deleted with id:', songId);
  }
}
