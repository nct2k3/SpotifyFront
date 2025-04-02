import { Component, OnInit } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { ArtistsService } from '../services/artists/artists.service';
import { Artist } from '../Models/artists.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Renderer2 } from '@angular/core';
@Component({
  selector: 'app-admin-songs-management',
  templateUrl: './admin-songs-management.component.html',
  styleUrls: ['./admin-songs-management.component.css'],
})
export class AdminSongsManagementComponent implements OnInit {
  state: string = 'void';
  songs: any[] = [];
  searchTerm: string = ''; // search
  isModalOpen: boolean = false; //create
  isEditing: boolean = false; // update
  newSong = {
    title: '',
    artist: '',
    genre: '',
    duration: null,
    file_location: '',
    image_location: '',
  }; // Dữ liệu của bài hát mới

  artists: Artist[] = []; // Danh sách tất cả các nghệ sĩ
  filteredArtists: Artist[] = []; // Danh sách nghệ sĩ lọc theo tìm kiếm

  constructor(
    private songsService: SongsService,
    private artistsService: ArtistsService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Lấy danh sách bài hát từ API
    this.songsService.getTrack().subscribe((data) => {
      console.log('Songs API data:', data);
      this.songs = data.results; // Lưu dữ liệu vào biến songs từ API
    });

    // Lấy danh sách nghệ sĩ từ API
    this.artistsService.getArtists().subscribe((data) => {
      this.artists = data; // Lưu danh sách nghệ sĩ
      this.filteredArtists = data; // Gán danh sách nghệ sĩ cho filteredArtists
    });
  }

  // Mở modal khi bấm "Create"
  openCreateModal() {
    this.isModalOpen = true;
  }

  // Đóng modal khi bấm "Cancel"
  closeModal() {
    this.isModalOpen = false;
    this.isEditing = false;
    this.newSong = {
      title: '',
      artist: '',
      genre: '',
      duration: null,
      file_location: '',
      image_location: '',
    }; // Reset dữ liệu
  }

  // Mở modal và truyền dữ liệu bài hát vào
  openEditModal(song: any) {
    this.isEditing = true; // Đang chỉnh sửa
    this.newSong = {
      title: song.title,
      artist: song.artist, // Giả sử song.artist là tên nghệ sĩ
      genre: song.genre,
      duration: song.duration,
      file_location: song.file_location,
      image_location: song.image_location,
    };
    this.isModalOpen = true;
  }
  // Hàm lọc bài hát theo từ khóa tìm kiếm
  filteredSongs() {
    return this.songs.filter((song) => {
      return (
        song.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        song.artists.some((artist: Artist) =>
          artist.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        ) ||
        song.genre.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
  }

  // Hàm chọn nghệ sĩ từ dropdown
  selectArtist(artist: Artist) {
    this.newSong.artist = artist.name; // Gán tên nghệ sĩ vào đối tượng newSong
    this.filteredArtists = []; // Ẩn dropdown sau khi chọn
  }

  // Hàm load lại danh sách bài hát từ API
  loadSongs() {
    this.songsService.getTrack().subscribe((data) => {
      this.songs = data.results; // Cập nhật lại danh sách bài hát
    });
  }

  // Chức năng xóa người dùng
  deleteSong(songId: string) {
    this.songsService.deleteSong(songId).subscribe(
      (response) => {
        console.log('Bài hát đã được xóa:', response);
        alert('Xóa thành công!');
        this.loadSongs();
      },
      (error) => {
        console.error('Lỗi khi xóa bài hát:', error);
        // Hiển thị thông báo lỗi
        alert('Xảy ra lỗi');
      }
    );
    console.log('Song deleted with id:', songId);
  }

  // Hàm lưu bài hoặc cập nhật bài hát
  createOrUpdateSong() {
    if (this.isEditing) {
      // Thực hiện cập nhật bài hát nếu đang chỉnh sửa
      console.log('Updating song:', this.newSong);
      // this.songsService.updateSong(this.newSong).subscribe(() => {
      //   this.closeModal(); // Đóng modal sau khi lưu
      // });
    } else {
      // Thực hiện tạo bài hát mới
      console.log('Creating new song:', this.newSong);
      // this.songsService.createSong(this.newSong).subscribe(() => {
      //   this.closeModal(); // Đóng modal sau khi tạo
      // });
    }
  }

  // Xử lý khi người dùng chọn file (cả file âm thanh và hình ảnh)
  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      if (field === 'file_location') {
        this.newSong.file_location = file.name; // Lưu tên file âm thanh vào đối tượng
      } else if (field === 'image_location') {
        this.newSong.image_location = file.name; // Lưu tên file hình ảnh vào đối tượng
      }
    }
  }

  // Hàm lọc nghệ sĩ khi người dùng nhập vào input
  onArtistInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredArtists = this.artists.filter(
      (artist) => artist.name.toLowerCase().includes(query) // Lọc nghệ sĩ theo tên
    );
  }
}
