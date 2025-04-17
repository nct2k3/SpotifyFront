import { Component, OnInit, ViewChild  } from '@angular/core';
import { AlbumService } from '../services/album/album.service';
import { SongsService } from '../services/Songs/songs.service';
import { ArtistsService } from '../services/artists/artists.service';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';


@Component({
  selector: 'app-admin-album-management',
  templateUrl: './admin-album-management.component.html',
  styleUrls: ['./admin-album-management.component.css'],
})
export class AdminAlbumManagementComponent implements OnInit {
  @ViewChild('toast') toast!: ToastMessageComponent;
  originalAlbums: any[] = []; //lưu ds album gốc
  albums: any[] = []; //ds album
  availableSongs: any[] = []; //dữ liệu của các bài hát
  availableArtists: any[] = []; //dữ liệu của nghệ sĩ
  filteredArtists: any[] = []; // For search results
  filteredSongs: any[] = []; // For search results
  selectedAlbum: any = null; //những nghệ sĩ đã được chọn
  searchTerm: string = ''; //tìm kiếm
  isModalOpen: boolean = false; //bật modal xem chi tiết album
  isEditing: boolean = false; //flag edit
  showModal: boolean = false; //
  artistSearchTerm: string = ''; // Search term for artists
  songSearchTerm: string = ''; // Search term for songs
  albumToEdit: any = null;
  showSongDropdown: boolean = false; // mở ds songs
  newAlbum: any = {
    title: '',
    artist_ids: [],
    song_ids: [],
    release_date: ''
  };

  constructor(
    private albumService: AlbumService,
    private songService: SongsService,
    private artistsService: ArtistsService
  ) {}

  ngOnInit(): void {
    this.loadAlbums();
    this.loadSongs();
    this.loadArtists();
  }

  loadAlbums(): void {
    this.albumService.getAlbum().subscribe({
      next: (res) => {
        this.albums = res;
        this.originalAlbums = res; // lưu bản gốc
      },
      error: (err) => console.error('Lỗi tải album:', err),
    });
  }
  

  loadSongs(): void {
    this.songService.getTrack().subscribe({
      next: (res) => {
        this.availableSongs = res;
        this.filteredSongs = res; // Initialize filtered songs
        console.log('Loaded songs:', this.availableSongs);
      },
      error: (err) => console.error('Lỗi tải songs:', err),
    });
  }

  loadArtists(): void {
    this.artistsService.getArtists().subscribe({
      next: (res) => {
        this.availableArtists = res;
        this.filteredArtists = res; // Initialize filtered artists
        console.log('Loaded artists:', this.availableArtists);
      },
      error: (err) => console.error('Lỗi tải artists:', err),
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
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.albums = this.originalAlbums; // reset lại danh sách
      return;
    }
    this.albums = this.originalAlbums.filter(album =>
      album.title.toLowerCase().includes(term)
    );
  }  

  closeModal() {
    this.showModal = false;
    this.selectedAlbum = null;
  }

  editAlbum(album: any) {
    this.isEditing = true;
    this.albumToEdit = album;
  
    this.newAlbum = {
      title: album.title,
      release_date: album.release_date?.substring(0, 10), // cắt lấy yyyy-mm-dd
      artist_ids: album.artists.map((a: any) => a.id),
      song_ids: album.songs.map((s: any) => s.id),
    };
  
    // Nếu cần, reset search terms
    this.artistSearchTerm = '';
    this.songSearchTerm = '';

    this.openCreateModal();
  }
  
  
  updateAlbum() {
    if (!this.albumToEdit) return;
  
    const updatedAlbum = {
      ...this.albumToEdit,
      ...this.newAlbum,
    };
  
    // Gửi updatedAlbum đến API update
    this.albumService.updateAlbum(updatedAlbum.id, updatedAlbum).subscribe({
      next: (res) => {
        this.loadAlbums(); // load lại danh sách album
        this.closeCreateModal(); // đóng form
        this.toast.showMessage('Update successful artists!', 'success');
      },
      error: (err) => {
        console.error('Update failed', err);
        this.toast.showMessage('Update failed artists!', 'error');
      }
    });
  }  

  deleteAlbum(id: string): void {
    if (confirm('Bạn có chắc muốn xóa album này?')) {
      this.albumService.deleteAlbum(id).subscribe({
        next: () => {
          this.albums = this.albums.filter((a) => a.id !== id);
          if (this.selectedAlbum?.id === id) this.selectedAlbum = null;
          this.toast.showMessage('Delete successful artists!', 'success');
        },
        error: (err) =>{
          console.error('Lỗi xóa album:', err),
          this.toast.showMessage('Delete failed artists!', 'error');

        },
      });
    }
  }

  // Search artists based on input
  searchArtists(): void {
    if (!this.artistSearchTerm) {
      this.filteredArtists = this.availableArtists;
    } else {
      this.filteredArtists = this.availableArtists.filter(artist =>
        artist.name.toLowerCase().includes(this.artistSearchTerm.toLowerCase())
      );
    }
  }

  // Search songs based on input
  searchSongs(): void {
    if (!this.songSearchTerm) {
      this.filteredSongs = this.availableSongs;
    } else {
      this.filteredSongs = this.availableSongs.filter(song =>
        song.title.toLowerCase().includes(this.songSearchTerm.toLowerCase())
      );
    }
  }

  // Add artist to selected list
  addArtist(artistId: string): void {
    if (!this.newAlbum.artist_ids.includes(artistId)) {
      this.newAlbum.artist_ids.push(artistId);
    }
    this.artistSearchTerm = ''; // Clear search input
    this.filteredArtists = this.availableArtists; // Reset filtered list
  }

  // Remove artist from selected list
  removeArtist(artistId: string): void {
    this.newAlbum.artist_ids = this.newAlbum.artist_ids.filter((id: string) => id !== artistId);
  }

  
  toggleSongDropdown() {
    this.showSongDropdown = !this.showSongDropdown;
  }

  // Add song to selected list
  addSong(songId: string): void {
    if (!this.newAlbum.song_ids.includes(songId)) {
      this.newAlbum.song_ids.push(songId);
    }
    this.songSearchTerm = ''; // Clear search input
    this.filteredSongs = this.availableSongs; // Reset filtered list
  }

  // Remove song from selected list
  removeSong(songId: string): void {
    this.newAlbum.song_ids = this.newAlbum.song_ids.filter((id: string) => id !== songId);
  }

  // Get artist name by ID
  getArtistName(artistId: string): string {
    const artist = this.availableArtists.find(a => a.id === artistId);
    return artist ? artist.name : 'Unknown';
  }

  // Get song title by ID
  getSongTitle(songId: string): string {
    const song = this.availableSongs.find(s => s.id === songId);
    return song ? song.title : 'Unknown';
  }

  openCreateModal() {
    this.isModalOpen = true;
  }

  closeCreateModal() {
    this.newAlbum = { title: '', artist_ids: [], song_ids: [], release_date: '' };
    this.filteredArtists = this.availableArtists;
    this.filteredSongs = this.availableSongs;
    this.artistSearchTerm = '';
    this.songSearchTerm = '';
    this.isModalOpen = false;
  }

  createAlbum() {
    const albumPayload = {
      title: this.newAlbum.title,
      artist_ids: this.newAlbum.artist_ids,
      song_ids: this.newAlbum.song_ids,
      release_date: this.newAlbum.release_date
    };

    console.log(albumPayload);

    this.albumService.createAlbum(albumPayload).subscribe({
      next: (res) => {
        this.albums.push(res);
        this.closeCreateModal();
        
        this.toast.showMessage('Create successful artists!', 'success');
      },
      error: (err) => {
        console.error('Lỗi tạo album:', err);
        this.toast.showMessage('Create failed artists!', 'error');
      }
    });
  }
}