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

  availableSongs: any[] = [];
  filteredSongs: any[] = [];
  songSearchTerm: string = '';
  showSongDropdown: boolean = false;
  selectedSongs: any[] = [];

  availableArtists: any[] = [];
  filteredArtists: any[] = [];
  artistSearchTerm: string = '';
  selectedArtists: ArtistResponse[] = [];
  showArtistDropdown: boolean = false;

  newAlbum: any = {
    title: '',
    artist_ids: [],
    song_ids: [],
    release_date: '',
    Album_type: '', // Add Album_type
    image_file: null,
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
        this.originalAlbums = res;
      },
      error: (err) => console.error('Lỗi tải album:', err),
    });
  }

  loadSongs(): void {
    this.songService.getTrack().subscribe({
      next: (res) => {
        this.availableSongs = res;
        this.filteredSongs = res;
      },
      error: (err) => console.error('Lỗi tải songs:', err),
    });
  }

  loadArtists(): void {
    this.artistsService.getArtists().subscribe({
      next: (res) => {
        this.availableArtists = res;
        this.filteredArtists = res;
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
      this.albums = this.originalAlbums;
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
      release_date: album.release_date?.substring(0, 10),
      Album_type: album.Album_type.toString(), // Convert to string for select
      artist_ids: album.artists.map((a: any) => a.id),
      song_ids: album.songs.map((s: any) => s.id),
      image_file: null,
    };
    this.selectedArtists = album.artists;
    this.selectedSongs = album.songs;
    this.artistSearchTerm = '';
    this.songSearchTerm = '';
    this.openCreateModal();
  }

  updateAlbum() {
    if (!this.albumToEdit) return;

    const formData = new FormData();
    formData.append('title', this.newAlbum.title);
    formData.append('release_date', this.newAlbum.release_date);
    formData.append('Album_type', this.newAlbum.Album_type);
    if (this.newAlbum.artist_ids.length > 0) {
      this.newAlbum.artist_ids.forEach((id: string, index: number) => {
        formData.append(`artist_ids[${index}]`, id);
      });
    }
    if (this.newAlbum.song_ids.length > 0) {
      this.newAlbum.song_ids.forEach((id: string, index: number) => {
        formData.append(`song_ids[${index}]`, id);
      });
    }
    if (this.newAlbum.image_file) {
      formData.append('image_file', this.newAlbum.image_file);
    }

    this.albumService.updateAlbum(this.albumToEdit.id, formData).subscribe({
      next: (res) => {
        this.loadAlbums();
        this.closeCreateModal();
        this.toast.showMessage('Update successful!', 'success');
      },
      error: (err) => {
        console.error('Update failed', err);
        this.toast.showMessage(
          'Update failed: ' + (err.error?.image_file || 'Unknown error'),
          'error'
        );
      },
    });
  }

  deleteAlbum(id: string): void {
    if (confirm('Bạn có chắc muốn xóa album này?')) {
      this.albumService.deleteAlbum(id).subscribe({
        next: () => {
          this.albums = this.albums.filter((a) => a.id !== id);
          if (this.selectedAlbum?.id === id) this.selectedAlbum = null;
          this.toast.showMessage('Delete successful!', 'success');
        },
        error: (err) => {
          console.error('Lỗi xóa album:', err);
          this.toast.showMessage('Delete failed!', 'error');
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
      song_input &&
      !song_input.contains(event.target as Node) &&
      song_dropdown &&
      !song_dropdown.contains(event.target as Node)
    ) {
      this.showSongDropdown = false;
    }
    if (
      artist_input &&
      !artist_input.contains(event.target as Node) &&
      artist_dropdown &&
      !artist_dropdown.contains(event.target as Node)
    ) {
      this.showArtistDropdown = false;
    }
  }

  onImageFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.newAlbum.image_file = file;
    } else {
      this.newAlbum.image_file = null;
    }
  }

  onArtistInput(event: any) {
    this.showArtistDropdown = true;
    const value = event.target.value.toLowerCase();
    this.filteredArtists = this.filteredArtists.filter(
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
    this.newAlbum.artist_ids = this.newAlbum.artist_ids.filter(
      (id: string) => id !== artist.id
    );
    this.filteredArtists.push(artist);
  }

  onSongInput(event: any) {
    this.showSongDropdown = true;
    const term = this.songSearchTerm.toLowerCase();
    this.filteredSongs = this.filteredSongs.filter(
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
    this.filteredSongs = this.filteredSongs.filter(
      (a) => a.id !== song.id
    );
    this.songSearchTerm = '';
    this.showSongDropdown = false;
  }

  removeSong(song: SongMetadata): void {
    this.selectedSongs = this.selectedSongs.filter(
      (a) => a.id !== song.id
    );
    this.newAlbum.song_ids = this.newAlbum.song_ids.filter(
      (id: string) => id !== song.id
    );
    this.filteredSongs.push(song);
  }

  openCreateModal() {
    this.isModalOpen = true;
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
    this.albumToEdit = null;
  }

  createAlbum() {
    const formData = new FormData();
    formData.append('title', this.newAlbum.title);
    formData.append('release_date', this.newAlbum.release_date);
    formData.append('Album_type', this.newAlbum.Album_type);
    if (this.newAlbum.artist_ids.length > 0) {
      this.newAlbum.artist_ids.forEach((id: string, index: number) => {
        formData.append(`artist_ids[${index}]`, id);
      });
    }
    if (this.newAlbum.song_ids.length > 0) {
      this.newAlbum.song_ids.forEach((id: string, index: number) => {
        formData.append(`song_ids[${index}]`, id);
      });
    }
    if (this.newAlbum.image_file) {
      formData.append('image_file', this.newAlbum.image_file);
    }

    this.albumService.createAlbum(formData).subscribe({
      next: (res) => {
        this.albums.push(res);
        this.closeCreateModal();
        this.toast.showMessage('Album created successfully!', 'success');
      },
      error: (err) => {
        console.error('Lỗi tạo album:', err);
        this.toast.showMessage(
          'Create failed: ' + (err.error?.image_file || err.error?.Album_type || 'Unknown error'),
          'error'
        );
      },
    });
  }
}