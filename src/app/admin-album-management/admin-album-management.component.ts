import { Component } from '@angular/core';
import { AlbumService } from '../services/album/album.service';

@Component({
  selector: 'app-admin-album-management',
  templateUrl: './admin-album-management.component.html',
  styleUrls: ['./admin-album-management.component.css'],
})
export class AdminAlbumManagementComponent {
  albums: any[] = [];
  selectedAlbum: any = null;
  searchTerm: string = ''; // search
  isModalOpen: boolean = false; //create
  isEditing: boolean = false; // update

  constructor(private albumService: AlbumService) {}

  ngOnInit(): void {
    this.loadAlbums();
  }

  loadAlbums(): void {
    this.albumService.getAlbum().subscribe({
      next: (res) => (this.albums = res),
      error: (err) => console.error('Lỗi tải album:', err),
    });
  }

  selectAlbum(album: any): void {
    this.selectedAlbum = album;
  }

  editAlbum(album: any): void {
    // mở form chỉnh sửa
  }

  deleteAlbum(id: string): void {
    if (confirm('Bạn có chắc muốn xóa album này?')) {
      this.albumService.deleteAlbum(id).subscribe({
        next: () => {
          this.albums = this.albums.filter((a) => a.id !== id);
          if (this.selectedAlbum?.id === id) this.selectedAlbum = null;
        },
        error: (err) => console.error('Lỗi xóa album:', err),
      });
    }
  }

  openCreateModal() {
    this.isModalOpen = true;
  }
}
