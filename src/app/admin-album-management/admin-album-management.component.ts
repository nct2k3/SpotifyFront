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
  originalAlbums: any[] = []; //lưu ds album gốc
  albums: any[] = []; //ds album
  selectedAlbum: any = null; //những nghệ sĩ đã được chọn
  searchTerm: string = ''; //tìm kiếm
  isModalOpen: boolean = false; //bật modal xem chi tiết album
  isEditing: boolean = false; //flag edit
  showModal: boolean = false; //
  albumToEdit: any = null;

  availableSongs: any[] = []; //dữ liệu của các bài hát
  filteredSongs: any[] = []; // For search results
  songSearchTerm: string = ''; // Search term for songs
  showSongDropdown: boolean = false; // mở ds songs
  selectedSongs: any[] = [];

  availableArtists: any[] = []; //dữ liệu của nghệ sĩ
  filteredArtists: any[] = []; // For search results
  artistSearchTerm: string = ''; // Search term for artists
  selectedArtists: ArtistResponse[] = [];
  showArtistDropdown: boolean = false;
  newAlbum: any = {
    title: '',
    artist_ids: [],
    song_ids: [],
    release_date: '',
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

    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
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
    this.albums = this.originalAlbums.filter((album) =>
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
      },
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
        error: (err) => {
          console.error('Lỗi xóa album:', err),
            this.toast.showMessage('Delete failed artists!', 'error');
        },
      });
    }
  }

  handleClickOutside(event: MouseEvent) {
    const song_input = document.getElementById('song_search');
    const song_dropdown = document.getElementById('song_dropdown');
    const artist_input = document.getElementById('artist_search');
    const artist_dropdown = document.getElementById('artist_dropdown');
  
    if (
      song_input && !song_input.contains(event.target as Node) &&
      song_dropdown && !song_dropdown.contains(event.target as Node)
    ) {
      this.showSongDropdown = false;
    }
    else if  (
      artist_input && !artist_input.contains(event.target as Node) &&
      artist_dropdown && !artist_dropdown.contains(event.target as Node)
    ) {
      this.showArtistDropdown = false;
    }
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

    // Xóa khỏi danh sách gợi ý
    this.filteredArtists = this.filteredArtists.filter(
      (a) => a.id !== artist.id
    );
    this.artistSearchTerm = '';
    this.showArtistDropdown = false;
  }

  removeArtist(artist: ArtistResponse) {
    this.selectedArtists = this.selectedArtists.filter(
      (a) => a.id !== artist.id
    );
    this.filteredArtists.push(artist);
    this.newAlbum.artist_ids = this.newAlbum.artist_ids.filter(
      (id: string) => id !== artist.id
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

  // Add song to selected list
  addSong(song: SongMetadata): void {
    console.log(this.newAlbum)
    console.log(song)
    this.selectedSongs.push(song);
    this.newAlbum.song_ids.push(song.id);
    // Xóa khỏi danh sách gợi ý
    this.filteredSongs = this.filteredSongs.filter(
      (a) => a.id !== song.id
    );
    this.songSearchTerm = ''; // Clear search input
    this.showSongDropdown = false;
  }

  // Remove song from selected list
  removeSong(song: SongMetadata): void {
    this.selectedSongs = this.selectedSongs.filter(
      (a) => a.id !== song.id
    );
    this.filteredArtists.push(song);
    this.newAlbum.song_ids = this.newAlbum.song_ids.filter(
      (id: string) => id !== song.id
    );
  }

  toggleSongDropdown() {
    this.showSongDropdown = !this.showSongDropdown;
  }

  // Get artist name by ID
  getArtistName(artistId: string): string {
    const artist = this.availableArtists.find((a) => a.id === artistId);
    return artist ? artist.name : 'Unknown';
  }

  // Get song title by ID
  getSongTitle(songId: string): string {
    const song = this.availableSongs.find((s) => s.id === songId);
    return song ? song.title : 'Unknown';
  }

  openCreateModal() {
    this.isModalOpen = true;
  }

  closeCreateModal() {
    this.newAlbum = {
      title: '',
      artist_ids: [],
      song_ids: [],
      release_date: '',
    };
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
      release_date: this.newAlbum.release_date,
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
      },
    });
  }
}
