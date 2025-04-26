import { Component, OnInit, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { ArtistsService } from '../services/artists/artists.service';
import { Artist, ArtistResponse } from '../Models/artists.model';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';
import { UsersService } from '../services/users/users.service';

export interface Notification {
  id: string;
  title: string;
  user: string;
  created_at: string;
}
@Component({
  selector: 'app-admin-songs-management',
  templateUrl: './admin-songs-management.component.html',
  styleUrls: ['./admin-songs-management.component.css'],
})
export class AdminSongsManagementComponent implements OnInit {
  @ViewChild('toast') toast!: ToastMessageComponent;

  state: string = 'void';
  songs: any[] = [];
  searchTerm: string = '';
  isModalOpen: boolean = false;
  isEditing: boolean = false;
  idSongEdit: number = -1;
  artistName: string = '';
  artistSearch: string = '';
  selectedArtists: ArtistResponse[] = [];
  showArtistDropdown: boolean = false;
  users: any[] = [];


  isLoading: boolean = false; 
  isSubmitting: boolean = false; 

  // Lưu file tạm thời
  selectedSongFile: File | null = null;
  selectedImageFile: File | null = null;

  newSong = {
    title: '',
    artist_ids: [] as string[],
    genre: '',
    duration: null as number | null,
    file_location: '',
    image_location: '',
    lyrics: '',
  };

  artists: ArtistResponse[] = [];
  filteredArtists: ArtistResponse[] = [];

  fileError: string = '';
  imageError: string = '';
  artistError: string = '';
  titleError: string = '';
  durationError: string = '';

  constructor(
    private songsService: SongsService,
    private artistsService: ArtistsService,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.usersService.getTrack().subscribe((data) => {
      this.users = data;
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.songsService.getTrack().subscribe({
      next: (data) => {
        console.log('Songs API data:', data);
        this.songs = data;
      },
      error: (err) => {
        console.error('Lỗi tải bài hát:', err);
        this.toast.showMessage('Lỗi tải bài hát!', 'error');
      },
      complete: () => {
        this.artistsService.getArtists().subscribe({
          next: (data) => {
            this.artists = data;
            this.filteredArtists = data;
          },
          error: (err) => {
            console.error('Lỗi tải nghệ sĩ:', err);
            this.toast.showMessage('Lỗi tải nghệ sĩ!', 'error');
          },
          complete: () => {
            this.isLoading = false;
          },
        });
      },
    });
  }

  openCreateModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.isSubmitting = false; // Reset trạng thái submitting
    this.newSong = {
      title: '',
      artist_ids: [],
      genre: '',
      duration: null,
      file_location: '',
      image_location: '',
      lyrics: '',
    };
    this.selectedSongFile = null;
    this.selectedImageFile = null;
    this.selectedArtists = [];
    this.idSongEdit = -1;
    this.artistError = '';
    this.durationError = '';
    this.fileError = '';
    this.imageError = '';
    this.titleError = '';
  }

  openEditModal(id: number, song: any) {
    this.isEditing = true;
    this.newSong = {
      title: song.title,
      artist_ids: song.artist,
      genre: song.genre,
      duration: song.duration,
      file_location: song.file_location,
      image_location: song.image_location,
      lyrics: song.lyrics,
    };
    this.selectedArtists = song.artists || [];
    this.idSongEdit = id;
    this.isModalOpen = true;
  }

  filteredSongs() {
    if (!this.songs || this.songs.length === 0) {
      return [];
    }
    
    const term = this.searchTerm?.toLowerCase().trim();
    if (!term) {
      return this.songs;
    }
    
    return this.songs.filter((song) => {
      // Check if title exists and includes search term
      const titleMatch = song.title && 
        song.title.toLowerCase().includes(term);
      
      // Check if artists array exists and any artist name includes search term
      const artistMatch = song.artists && 
        Array.isArray(song.artists) && 
        song.artists.some((artist: Artist) => 
          artist && artist.name && 
          artist.name.toLowerCase().includes(term)
        );
      
      // Check if genre exists and includes search term
      const genreMatch = song.genre && 
        song.genre.toLowerCase().includes(term);
      
      return titleMatch || artistMatch || genreMatch;
    });
  }

  toggleArtistDropdown() {
    this.showArtistDropdown = !this.showArtistDropdown;
  }

  selectArtist(artist: ArtistResponse) {
    this.artistName = artist.name;
    this.newSong.artist_ids = [artist.id];
    this.filteredArtists = [];
    this.showArtistDropdown = false;
  }

  onArtistInput(event: any) {
    this.showArtistDropdown = true;
    const value = event.target.value.toLowerCase();
    this.filteredArtists = this.artists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(value) &&
        !this.selectedArtists.some((selected) => selected.id === artist.id)
    );
    this.artistError = '';
    this.newSong.artist_ids = [];
  }

  onArtistFocus() {
    this.showArtistDropdown = true;
  }

  addArtist(artist: ArtistResponse) {
    this.selectedArtists.push(artist);
    this.filteredArtists = this.filteredArtists.filter(
      (a) => a.id !== artist.id
    );
    this.artistSearch = '';
    this.showArtistDropdown = false;
  }

  removeArtist(artist: ArtistResponse) {
    this.selectedArtists = this.selectedArtists.filter(
      (a) => a.id !== artist.id
    );
    this.filteredArtists.push(artist);
  }

  loadSongs() {
    this.isLoading = true;
    this.songsService.getTrack().subscribe({
      next: (data) => {
        this.songs = data;
      },
      error: (err) => {
        console.error('Lỗi tải bài hát:', err);
        this.toast.showMessage('Lỗi tải bài hát!', 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  getFileName(path: string): string {
    if (!path || path === '../') return 'N/A';
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  deleteSong(songId: string) {
    this.songsService.deleteSong(songId).subscribe({
      next: () => {
        this.toast.showMessage('Delete successful!', 'success');
        this.loadSongs();
      },
      error: (error) => {
        console.error('Lỗi khi xóa bài hát:', error);
        this.toast.showMessage('Delete failed!', 'error');
      },
    });
  }

  onFileSelected(event: any, field: string) {
    const file: File = event.target.files[0];
    if (!file) return;

    const fileName = file.name;
    const extension = fileName.split('.').pop()?.toLowerCase();
    const maxSongSize = 50 * 1024 * 1024; // 50MB
    const maxImageSize = 5 * 1024 * 1024; // 5MB

    if (field === 'file_location') {
      this.fileError = '';
      if (!['mp3', 'mp4'].includes(extension || '')) {
        this.fileError = 'Vui lòng chọn tệp .mp3 hoặc .mp4.';
        this.newSong.file_location = '';
        this.selectedSongFile = null;
        return;
      }
      if (file.size > maxSongSize) {
        this.fileError = 'File bài hát vượt quá 50MB.';
        this.newSong.file_location = '';
        this.selectedSongFile = null;
        return;
      }
      this.selectedSongFile = file;
      this.newSong.file_location = fileName;
    } else if (field === 'image_location') {
      this.imageError = '';
      const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
      if (!validImageExtensions.includes(extension || '')) {
        this.imageError = 'Vui lòng chọn tệp hình ảnh (.jpg, .jpeg, .png, .gif).';
        this.newSong.image_location = '';
        this.selectedImageFile = null;
        return;
      }
      if (file.size > maxImageSize) {
        this.imageError = 'File ảnh vượt quá 5MB.';
        this.newSong.image_location = '';
        this.selectedImageFile = null;
        return;
      }
      this.selectedImageFile = file;
      this.newSong.image_location = fileName;
    }
  }

  validateForm(): boolean {
    let isValid = true;

    this.titleError = '';
    this.fileError = '';
    this.imageError = '';
    this.artistError = '';
    this.durationError = '';

    if (!this.newSong.title || this.newSong.title.trim() === '') {
      this.titleError = 'Vui lòng nhập tiêu đề bài hát.';
      isValid = false;
    }

    if (this.newSong.duration == null || this.newSong.duration <= 0) {
      this.durationError = 'Vui lòng nhập thời lượng bài hát lớn hơn 0.';
      isValid = false;
    }

    if (this.selectedArtists.length === 0) {
      this.artistError = 'Vui lòng chọn ít nhất một nghệ sĩ từ danh sách.';
      isValid = false;
    } else {
      this.newSong.artist_ids = this.selectedArtists.map((artist) => artist.id);
    }

    if (!this.isEditing && !this.selectedSongFile) {
      this.fileError = 'Vui lòng chọn tệp .mp3 hoặc .mp4 hợp lệ.';
      isValid = false;
    }

    if (!this.isEditing && !this.selectedImageFile) {
      this.imageError = 'Vui lòng chọn tệp hình ảnh (.jpg, .jpeg, .png, .gif).';
      isValid = false;
    }

    return isValid;
  }

  onSubmit() {
    if (!this.validateForm()) {
      return;
    }
  
    this.isSubmitting = true;
  
    const formData = new FormData();
    formData.append('title', this.newSong.title);
    formData.append('artist_ids', this.newSong.artist_ids.toString());
    formData.append('genre', this.newSong.genre);
    formData.append('duration', this.newSong.duration?.toString() || '');
    formData.append('lyrics', this.newSong.lyrics);
  
    if (this.selectedSongFile) {
      formData.append('song_file', this.selectedSongFile, this.selectedSongFile.name);
    }
  
    if (this.selectedImageFile) {
      formData.append('image_file', this.selectedImageFile, this.selectedImageFile.name);
    }
  
    const action = this.isEditing
      ? this.songsService.updateSong(this.idSongEdit, formData)
      : this.songsService.createSong(formData);
  
    action.subscribe({
      next: (res: any) => {
        this.newSong.file_location = res.file_location;
        this.newSong.image_location = res.image_location;
  
       
        if (!this.isEditing) {
          this.users.forEach(user => {
            const notification: Notification = {
              id: '',
              title: `Nhạc mới vừa được thêm: ${this.newSong.title}`, 
              user: user.id, // ID của user nhận thông báo
              created_at: new Date().toISOString() 
            };
  
            this.songsService.createNotification(user.id, notification.title).subscribe({
              next: (res) => {
                console.log(`Notification sent to user ${user.id}:`, res);
              },
              error: (err) => {
                console.error(`Error sending notification to user ${user.id}:`, err);
                this.toast.showMessage(`Không thể gửi thông báo cho user ${user.id}`, 'error');
              }
            });
          });
        }
  
        this.closeModal();
        this.toast.showMessage(
          this.isEditing ? 'Update successful!' : 'Create successful!',
          'success'
        );
        this.loadSongs();
      },
      error: (err) => {
        console.error('Error:', err);
        let errorMessage = this.isEditing ? 'Update failed!' : 'Create failed!';
        if (err.status === 413) {
          errorMessage = 'File is too large. Please select a smaller file.';
        } else if (err.status === 400) {
          errorMessage = err.error.message || 'Invalid data.';
        } else if (err.status === 401) {
          errorMessage = 'Unauthorized. Please check your token.';
        }
        this.toast.showMessage(errorMessage, 'error');
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}