import { Component, OnInit, ViewChild } from '@angular/core';
import { AlbumService } from '../services/album/album.service';
import { SongsService } from '../services/Songs/songs.service';
import { ArtistsService } from '../services/artists/artists.service';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';
import { ArtistResponse } from '../Models/artists.model';
import { SongMetadata } from '../Models/song-metadata.model';

@Component({
  selector: 'app-admin-album-management',
  templateUrl: './admin-album-management.component.html',
  styleUrls: ['./admin-album-management.component.css'],
})
export class AdminAlbumManagementComponent implements OnInit {
  @ViewChild('toast') toast!: ToastMessageComponent;
  originalAlbums: any[] = [];
  albums: any[] = [];
  selectedAlbum: any = null;
  searchTerm: string = '';
  isModalOpen: boolean = false;
  isEditing: boolean = false;
  showModal: boolean = false;
  albumToEdit: any = null;

  availableSongs: SongMetadata[] = [];
  filteredSongs: SongMetadata[] = [];
  songSearchTerm: string = '';
  showSongDropdown: boolean = false;
  selectedSongs: SongMetadata[] = [];

  availableArtists: ArtistResponse[] = [];
  filteredArtists: ArtistResponse[] = [];
  artistSearchTerm: string = '';
  selectedArtists: ArtistResponse[] = [];
  showArtistDropdown: boolean = false;

  // Biến trạng thái loading
  isLoading: boolean = false; // Cho việc tải dữ liệu ban đầu
  isSubmitting: boolean = false; // Cho việc tạo/cập nhật

  newAlbum: any = {
    title: '',
    artist_ids: [],
    song_ids: [],
    release_date: '',
    Album_type: '',
    image_file: null,
  };

  constructor(
    private albumService: AlbumService,
    private songService: SongsService,
    private artistsService: ArtistsService
  ) {}

  ngOnInit(): void {
    this.loadData();
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  loadData(): void {
    this.isLoading = true;
    // Tải albums
    this.albumService.getAlbum().subscribe({
      next: (res) => {
        this.albums = res;
        this.originalAlbums = res;
      },
      error: (err) => {
        console.error('Lỗi tải album:', err);
        this.toast.showMessage('Lỗi tải album!', 'error');
      },
      complete: () => {
        // Tải songs
        this.songService.getTrack().subscribe({
          next: (res) => {
            this.availableSongs = res;
            this.filteredSongs = res;
          },
          error: (err) => {
            console.error('Lỗi tải songs:', err);
            this.toast.showMessage('Lỗi tải songs!', 'error');
          },
          complete: () => {
            // Tải artists
            this.artistsService.getArtists().subscribe({
              next: (res) => {
                this.availableArtists = res;
                this.filteredArtists = res;
              },
              error: (err) => {
                console.error('Lỗi tải artists:', err);
                this.toast.showMessage('Lỗi tải artists!', 'error');
              },
              complete: () => {
                this.isLoading = false; // Tắt trạng thái loading khi hoàn tất
              },
            });
          },
        });
      },
    });
  }

  loadAlbums(): void {
    this.isLoading = true;
    this.albumService.getAlbum().subscribe({
      next: (res) => {
        this.albums = res;
        this.originalAlbums = res;
      },
      error: (err) => {
        console.error('Lỗi tải album:', err);
        this.toast.showMessage('Lỗi tải album!', 'error');
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  loadSongs(): void {
    this.songService.getTrack().subscribe({
      next: (res) => {
        this.availableSongs = res;
        this.filteredSongs = res;
      },
      error: (err) => {
        console.error('Lỗi tải songs:', err);
        this.toast.showMessage('Lỗi tải songs!', 'error');
      },
    });
  }

  loadArtists(): void {
    this.artistsService.getArtists().subscribe({
      next: (res) => {
        this.availableArtists = res;
        this.filteredArtists = res;
      },
      error: (err) => {
        console.error('Lỗi tải artists:', err);
        this.toast.showMessage('Lỗi tải artists!', 'error');
      },
    });
  }

  getFileName(path: string): string {
    if (!path || path === '../') return 'N/A';
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  selectAlbum(album: any): void {
    this.selectedAlbum = album;
    this.showModal = true;
  }

  searchAlbums(): void {
    // If no search term or empty after trimming, show all albums
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.albums = [...this.originalAlbums];
      return;
    }
    
    const term = this.searchTerm.toLowerCase().trim();
    
    // Filter albums based on title
    this.albums = this.originalAlbums.filter((album) => {
      // Safely check if album and title exist
      return album && album.title && album.title.toLowerCase().includes(term);
    });
  }

  closeModal() {
    this.showModal = false;
    this.selectedAlbum = null;
  }

  editAlbum(album: any) {
    if (!album) {
      this.toast.showMessage('Lỗi: Không có album để chỉnh sửa!', 'error');
      return;
    }
    this.isEditing = true;
    this.albumToEdit = album;
    this.newAlbum = {
      title: album.title,
      release_date: album.release_date?.substring(0, 10) || '',
      Album_type: album.Album_type.toString(),
      artist_ids: album.artists.map((a: any) => a.id),
      song_ids: album.songs.map((s: any) => s.id),
      image_file: null,
    };
    this.selectedArtists = album.artists;
    this.selectedSongs = album.songs;
    this.artistSearchTerm = '';
    this.songSearchTerm = '';
    this.filteredArtists = [...this.availableArtists];
    this.filteredSongs = [...this.availableSongs];
    this.openCreateModal();
  }

  updateAlbum() {
    if (!this.albumToEdit) {
      this.toast.showMessage('Lỗi: Không có album để cập nhật!', 'error');
      return;
    }

    // Validate required fields
    if (!this.newAlbum.title || !this.newAlbum.release_date || !this.newAlbum.Album_type) {
      this.toast.showMessage('Vui lòng điền đầy đủ các trường bắt buộc!', 'error');
      return;
    }

    if (this.newAlbum.artist_ids.length === 0 || this.newAlbum.song_ids.length === 0) {
      this.toast.showMessage('Phải chọn ít nhất một nghệ sĩ và một bài hát!', 'error');
      return;
    }

    this.isSubmitting = true; // Bật trạng thái submitting

    const formData = new FormData();
    formData.append('title', this.newAlbum.title);
    formData.append('release_date', this.newAlbum.release_date);
    formData.append('Album_type', this.newAlbum.Album_type);

    // Append artist_ids
    this.newAlbum.artist_ids.forEach((id: string, index: number) => {
      formData.append(`artist_ids[${index}]`, id);
    });

    // Append song_ids
    this.newAlbum.song_ids.forEach((id: string, index: number) => {
      formData.append(`song_ids[${index}]`, id);
    });

    // Handle image_file
    if (this.newAlbum.image_file) {
      formData.append('image_file', this.newAlbum.image_file);
    } else if (this.albumToEdit.image_location) {
      formData.append('image_location', this.albumToEdit.image_location);
    }

    this.albumService.updateAlbum(this.albumToEdit.id, formData).subscribe({
      next: (res) => {
        this.loadAlbums();
        this.closeCreateModal();
        this.toast.showMessage('Cập nhật album thành công!', 'success');
      },
      error: (err) => {
        console.error('Cập nhật thất bại:', err);
        let errorMessage = 'Lỗi không xác định';
        if (err.error) {
          if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.image_file) {
            errorMessage = err.error.image_file;
          } else if (err.error.errors) {
            errorMessage = Object.values(err.error.errors).join(', ');
          }
        }
        this.toast.showMessage(`Cập nhật thất bại: ${errorMessage}`, 'error');
      },
      complete: () => {
        this.isSubmitting = false; // Tắt trạng thái submitting
      },
    });
  }

  deleteAlbum(id: string): void {
    if (confirm('Bạn có chắc muốn xóa album này?')) {
      this.albumService.deleteAlbum(id).subscribe({
        next: () => {
          this.albums = this.albums.filter((a) => a.id !== id);
          if (this.selectedAlbum?.id === id) this.selectedAlbum = null;
          this.toast.showMessage('Xóa album thành công!', 'success');
        },
        error: (err) => {
          console.error('Lỗi xóa album:', err);
          this.toast.showMessage('Xóa album thất bại!', 'error');
        },
      });
    }
  }

  handleClickOutside(event: MouseEvent) {
    const songInput = document.getElementById('song_search');
    const songDropdown = document.getElementById('song_dropdown');
    const artistInput = document.getElementById('artist_search');
    const artistDropdown = document.getElementById('artist_dropdown');

    if (
      songInput &&
      !songInput.contains(event.target as Node) &&
      songDropdown &&
      !songDropdown.contains(event.target as Node)
    ) {
      this.showSongDropdown = false;
    }
    if (
      artistInput &&
      !artistInput.contains(event.target as Node) &&
      artistDropdown &&
      !artistDropdown.contains(event.target as Node)
    ) {
      this.showArtistDropdown = false;
    }
  }

  onImageFileChange(event: any) {
    const file = event.target.files[0];
    this.newAlbum.image_file = file || null;
  }

  onArtistInput(event: any) {
    this.showArtistDropdown = true;
    const value = event.target.value.toLowerCase();
    this.filteredArtists = this.availableArtists.filter(
      (artist) =>
        artist.name.toLowerCase().includes(value) &&
        !this.selectedArtists.some((selected) => selected.id === artist.id)
    );
  }

  onArtistFocus() {
    this.showArtistDropdown = true;
  }

  addArtist(artist: ArtistResponse) {
    this.selectedArtists.push(artist);
    this.newAlbum.artist_ids.push(artist.id);
    this.filteredArtists = this.availableArtists.filter(
      (a) => !this.selectedArtists.some((selected) => selected.id === a.id)
    );
    this.artistSearchTerm = '';
    this.showArtistDropdown = false;
  }

  removeArtist(artist: ArtistResponse) {
    this.selectedArtists = this.selectedArtists.filter((a) => a.id !== artist.id);
    this.newAlbum.artist_ids = this.newAlbum.artist_ids.filter((id: string) => id !== artist.id);
    this.filteredArtists = [...this.availableArtists].filter(
      (a) => !this.selectedArtists.some((selected) => selected.id === a.id)
    );
  }

  onSongInput(event: any) {
    this.showSongDropdown = true;
    const term = this.songSearchTerm.toLowerCase();
    this.filteredSongs = this.availableSongs.filter(
      (song) =>
        song.title.toLowerCase().includes(term) &&
        !this.selectedSongs.some((s) => s.id === song.id)
    );
  }

  onSongFocus() {
    this.showSongDropdown = true;
  }

  addSong(song: SongMetadata): void {
    this.selectedSongs.push(song);
    this.newAlbum.song_ids.push(song.id);
    this.filteredSongs = this.availableSongs.filter(
      (a) => !this.selectedSongs.some((s) => s.id === a.id)
    );
    this.songSearchTerm = '';
    this.showSongDropdown = false;
  }

  removeSong(song: SongMetadata): void {
    this.selectedSongs = this.selectedSongs.filter((a) => a.id !== song.id);
    this.newAlbum.song_ids = this.newAlbum.song_ids.filter((id: string) => id !== song.id);
    this.filteredSongs = [...this.availableSongs].filter(
      (a) => !this.selectedSongs.some((s) => s.id === a.id)
    );
  }

  openCreateModal() {
    this.isModalOpen = true;
    if (!this.isEditing) {
      this.newAlbum = {
        title: '',
        artist_ids: [],
        song_ids: [],
        release_date: '',
        Album_type: '',
        image_file: null,
      };
      this.selectedArtists = [];
      this.selectedSongs = [];
    }
    this.filteredArtists = [...this.availableArtists];
    this.filteredSongs = [...this.availableSongs];
  }

  closeCreateModal() {
    this.newAlbum = {
      title: '',
      artist_ids: [],
      song_ids: [],
      release_date: '',
      Album_type: '',
      image_file: null,
    };
    this.selectedArtists = [];
    this.selectedSongs = [];
    this.filteredArtists = [...this.availableArtists];
    this.filteredSongs = [...this.availableSongs];
    this.artistSearchTerm = '';
    this.songSearchTerm = '';
    this.isModalOpen = false;
    this.isEditing = false;
    this.isSubmitting = false; // Reset trạng thái submitting
    this.albumToEdit = null;
  }

  createAlbum() {
    if (!this.newAlbum.title || !this.newAlbum.release_date || !this.newAlbum.Album_type) {
      this.toast.showMessage('Vui lòng điền đầy đủ các trường bắt buộc!', 'error');
      return;
    }

    if (this.newAlbum.artist_ids.length === 0 || this.newAlbum.song_ids.length === 0) {
      this.toast.showMessage('Phải chọn ít nhất một nghệ sĩ và một bài hát!', 'error');
      return;
    }

    if (!this.newAlbum.image_file) {
      this.toast.showMessage('Vui lòng chọn hình ảnh cho album!', 'error');
      return;
    }

    this.isSubmitting = true; // Bật trạng thái submitting

    const formData = new FormData();
    formData.append('title', this.newAlbum.title);
    formData.append('release_date', this.newAlbum.release_date);
    formData.append('Album_type', this.newAlbum.Album_type);
    this.newAlbum.artist_ids.forEach((id: string, index: number) => {
      formData.append(`artist_ids[${index}]`, id);
    });
    this.newAlbum.song_ids.forEach((id: string, index: number) => {
      formData.append(`song_ids[${index}]`, id);
    });
    formData.append('image_file', this.newAlbum.image_file);

    this.albumService.createAlbum(formData).subscribe({
      next: (res) => {
        this.albums.push(res);
        this.closeCreateModal();
        this.toast.showMessage('Tạo album thành công!', 'success');
      },
      error: (err) => {
        console.error('Lỗi tạo album:', err);
        let errorMessage = err.error?.message || err.error?.image_file || err.error?.Album_type || 'Lỗi không xác định';
        this.toast.showMessage(`Tạo album thất bại: ${errorMessage}`, 'error');
      },
      complete: () => {
        this.isSubmitting = false; // Tắt trạng thái submitting
      },
    });
  }
}