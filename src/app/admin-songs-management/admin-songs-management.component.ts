import { Component, OnInit } from '@angular/core';
import { SongsService } from '../services/Songs/songs.service';
import { ArtistsService } from '../services/artists/artists.service';
import { Artist, ArtistResponse } from '../Models/artists.model';
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
  idSongEdit: number = -1;
  artistName: string = ''; //tên của nghệ sĩ
  newSong = {
    title: '',
    artist_ids: [] as number[],
    genre: '',
    duration: null,
    file_location: '',
    image_location: '',
  }; // Dữ liệu của bài hát mới

  artists: ArtistResponse[] = []; // Danh sách tất cả các nghệ sĩ
  filteredArtists: ArtistResponse[] = []; // Danh sách nghệ sĩ lọc theo tìm kiếm

  fileError: string = ''; //kiểm tra file mp4
  imageError: string = ''; //kiểm tra file ảnh
  artistError: string = ''; //kiểm tra nhập đúng từ ds không
  titleError: string = ''; //kiểm tra title đã nhập chưa
  durationError: string = ''; //đảm bảo không âm


  constructor(
    private songsService: SongsService,
    private artistsService: ArtistsService,
    private snackBar: MatSnackBar,
    private renderer: Renderer2
  ) {}

  ngOnInit(): void {
    // Lấy danh sách bài hát từ API
    this.songsService.getTrackApi().subscribe((data) => {
      console.log('Songs API data:', data);
      this.songs = data; // Lưu dữ liệu vào biến songs từ API
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
     // Reset dữ liệu
    this.newSong = {
      title: '',
      artist_ids: [] as number[],
      genre: '',
      duration: null,
      file_location: '',
      image_location: '',
    };
    this.idSongEdit = -1;
  }

  // Mở modal và truyền dữ liệu bài hát vào
  openEditModal(id:number, song: any) {
    this.isEditing = true; // Đang chỉnh sửa
    this.newSong = {
      title: song.title,
      artist_ids: song.artist,
      genre: song.genre,
      duration: song.duration,
      file_location: song.file_location,
      image_location: song.image_location,
    };
    this.idSongEdit = id;
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
  selectArtist(artist: ArtistResponse) {
    console.log(artist);
    this.artistName = artist.name;
    this.newSong.artist_ids = [artist.id]; // Gán tên nghệ sĩ vào đối tượng newSong
    this.filteredArtists = []; // Ẩn dropdown sau khi chọn
  }

  // Hàm load lại danh sách bài hát từ API
  loadSongs() {
    this.songsService.getTrack().subscribe((data) => {
      this.songs = data; // Cập nhật lại danh sách bài hát
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
  onSubmit() {
    if (!this.validateForm()) {
      return;
    }

    if (this.isEditing) {
      // Thực hiện cập nhật bài hát nếu đang chỉnh sửa
      console.log('Updating song:', this.newSong);
      this.songsService.updateSong(this.idSongEdit, this.newSong).subscribe(() => {
        this.closeModal(); // Đóng modal sau khi lưu
        alert("Sửa thành công");
        this.loadSongs();
      });
    } else {
      // Thực hiện tạo bài hát mới
      console.log('Creating new song:', this.newSong);
      console.log(this.newSong);
      this.songsService.createSong(this.newSong).subscribe(() => {
        this.closeModal(); // Đóng modal sau khi tạo
        alert("Thêm thành công")
        this.loadSongs();
      });
    }
  }

  // Xử lý khi người dùng chọn file (cả file âm thanh và hình ảnh)
  onFileSelected(event: any, field: string) {
    const file: File = event.target.files[0];
    const fileName = file?.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase();

    if (file) {
      if (field === 'file_location') {
        // Reset lỗi trước đó
        this.fileError = '';

        if (extension === 'mp4') {
          this.newSong.file_location = fileName;
        } else {
          this.newSong.file_location = '';
          this.fileError = 'Vui lòng chọn tệp .mp4 hợp lệ.';
        }
      } else if (field === 'image_location') {
        const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];

        //reset lỗi trươc đó
        this.imageError = '';

        if (validImageExtensions.includes(extension || '')) {
          this.newSong.image_location = fileName;
        } else {
          this.newSong.image_location = '';
          this.imageError = 'Vui lòng chọn tệp hình ảnh (jpg, jpeg, png, gif).';
        }
      }
    }
  }

  // Hàm lọc nghệ sĩ khi người dùng nhập vào input
  onArtistInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredArtists = this.artists.filter(
      (artist) => artist.name.toLowerCase().includes(query) // Lọc nghệ sĩ theo tên
    );
    this.artistError = ''; // Xóa lỗi khi người dùng gõ lại
    this.newSong.artist_ids = []; // Reset id nếu chưa chọn từ danh sách
  }


  //hàm kiểm tra hợp lệ của form
  validateForm(): boolean {
    let isValid = true;

    // Reset lỗi trước đó
    this.titleError = '';
    this.fileError = '';
    this.imageError = '';
    this.artistError = '';

    // Validate title
    if (!this.newSong.title || this.newSong.title.trim() === '') {
      this.titleError = 'Vui lòng nhập tiêu đề bài hát.';
      isValid = false;
    }

    if (
      this.newSong.duration == null || 
      this.newSong.duration <= 0
    ) {
      this.durationError = 'Vui lòng nhập thời lượng bài hát lớn hơn 0.';
      isValid = false;
    }

    // Validate artist
    const matchedArtist = this.artists.find(
      (artist) => artist.name === this.artistName
    );
    if (!matchedArtist) {
      this.artistError = 'Vui lòng chọn nghệ sĩ từ danh sách gợi ý.';
      isValid = false;
    } else {
      this.newSong.artist_ids = [matchedArtist.id];
    }

    // Validate song file
    if (
      !this.newSong.file_location ||
      !this.newSong.file_location.endsWith('.mp4')
    ) {
      this.fileError = 'Vui lòng chọn tệp .mp4 hợp lệ.';
      isValid = false;
    }

    // Validate image file
    const validImageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
    if (
      !this.newSong.image_location ||
      !validImageExtensions.some((ext) =>
        this.newSong.image_location.endsWith(ext)
      )
    ) {
      this.imageError = 'Vui lòng chọn tệp hình ảnh (jpg, jpeg, png, gif).';
      isValid = false;
    }

    return isValid;
  }
}
