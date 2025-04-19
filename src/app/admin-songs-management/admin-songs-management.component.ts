import { Component, OnInit, ViewChild } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { ArtistsService } from '../services/artists/artists.service';
import { Artist, ArtistResponse } from '../Models/artists.model';
import { ToastMessageComponent } from '../shared/toast-message/toast-message.component';

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
    private artistsService: ArtistsService
  ) {}

  ngOnInit(): void {
    this.songsService.getTrack().subscribe((data) => {
      console.log('Songs API data:', data);
      this.songs = data;
    });

    this.artistsService.getArtists().subscribe((data) => {
      this.artists = data;
      this.filteredArtists = data;
    });
  }

  openCreateModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
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
    return this.songs.filter((song) =>
      song.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      song.artists.some((artist: Artist) =>
        artist.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      ) ||
      song.genre.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
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
    this.songsService.getTrack().subscribe((data) => {
      this.songs = data;
    });
  }

  getFileName(path: string): string {
    if (!path || path === '../') return 'N/A';
    const parts = path.split('/');
    return parts[parts.length - 1];
  }

  deleteSong(songId: string) {
    this.songsService.deleteSong(songId).subscribe(
      () => {
        this.toast.showMessage('Delete successful!', 'success');
        this.loadSongs();
      },
      (error) => {
        console.error('Lỗi khi xóa bài hát:', error);
        this.toast.showMessage('Delete failed!', 'error');
      }
    );
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
      this.newSong.file_location = fileName; // Tạm thời hiển thị tên file
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
      this.newSong.image_location = fileName; // Tạm thời hiển thị tên file
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
  
    action.subscribe(
      (res: any) => {
        this.newSong.file_location = res.file_location;
        this.newSong.image_location = res.image_location;
        this.closeModal();
        this.toast.showMessage(
          this.isEditing ? 'Update successful!' : 'Create successful!',
          'success'
        );
        this.loadSongs();
      },
      (err) => {
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
      }
    );
  }
}