import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { AlbumService } from '../services/album/album.service';
import { SongsService } from '../services/Songs/songs.service';
import { ArtistsService } from '../services/artists/artists.service';
import { UsersService } from '../services/users/users.service';
import { Album } from '../Models/albums.model';
// import { LoginService } from '../services/login/login.service';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard-management',
  templateUrl: './admin-dashboard-management.component.html',
  styleUrls: ['./admin-dashboard-management.component.css'],
})
export class AdminDashboardManagementComponent implements OnInit {
  stats = {
    albums: [] as Album[],
    totalAlbums: 0,
    totalSongs: 0,
    totalArtists: 0,
    totalUsers: 0,
    genres1: 'Pop',
    genres2: 'Rock',
    genres3: 'Jazz',
    genres4: 'Other',
    totalGeneres1: 0,
    totalGeneres2: 0,
    totalGeneres3: 0,
  };

  constructor(
    private albumService: AlbumService,
    private songsService: SongsService,
    private artistsService: ArtistsService,
    private userService: UsersService
  ) // private loginService: LoginService
  {}

  ngOnInit(): void {
    this.fetchStats();
  }

  fetchStats(): void {
    // Lấy tổng số albums
    this.albumService.getAlbum().subscribe(
      (albums) => {
        this.stats.totalAlbums = albums.length;
        this.stats.albums = albums; // Lưu trữ danh sách album để sử dụng trong biểu đồ
        this.renderCharts();
      },
      (error) => {
        console.error('Error fetching albums:', error);
      }
    );

    // Lấy tổng số bài hát
    this.songsService.getTrack().subscribe(
      (songs) => {
        this.stats.totalSongs = songs.length;

        // Tính toán 3 thể loại cao nhất
        const genreCounts: { [key: string]: number } = {};
        songs.forEach((song) => {
          if (song.genre) {
            genreCounts[song.genre] = (genreCounts[song.genre] || 0) + 1;
          }
        });

        // Sắp xếp thể loại theo số lượng giảm dần
        const sortedGenres = Object.entries(genreCounts).sort(
          (a, b) => b[1] - a[1]
        );

        // Gán giá trị cho genres1, genres2, genres3 và tổng số bài hát
        this.stats.genres1 = sortedGenres[0]?.[0] || 'N/A';
        this.stats.totalGeneres1 = sortedGenres[0]?.[1] || 0;

        this.stats.genres2 = sortedGenres[1]?.[0] || 'N/A';
        this.stats.totalGeneres2 = sortedGenres[1]?.[1] || 0;

        this.stats.genres3 = sortedGenres[2]?.[0] || 'N/A';
        this.stats.totalGeneres3 = sortedGenres[2]?.[1] || 0;

        console.log(
          'Top genres:',
          this.stats.genres1,
          this.stats.genres2,
          this.stats.genres3
        );
      },
      (error) => {
        console.error('Error fetching songs:', error);
      }
    );

    // Lấy tổng số nghệ sĩ
    this.artistsService.getArtists().subscribe(
      (artists) => {
        this.stats.totalArtists = artists.length;
      },
      (error) => {
        console.error('Error fetching artists:', error);
      }
    );

    //Lấy tổng số người dùng
    // Lấy tổng số người dùng
    this.userService.getTrack().subscribe(
      (users) => {
        this.stats.totalUsers = users.length;
      },
      (error) => {
        console.error('Error fetching users:', error);
      }
    );
  }

  renderCharts(): void {
    // Tính toán 7 ngày từ ngày hiện tại trở lại
    const today = new Date();
    const labels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i)); // Lấy ngày từ 6 ngày trước đến hôm nay
      return date.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
      }); // Hiển thị ngày/tháng
    });

    // Đếm số lượng album phát hành theo từng ngày
    const albumCounts = Array(7).fill(0); // Mảng chứa số lượng album cho mỗi ngày
    this.stats.albums.forEach((album) => {
      const releaseDate = new Date(album.release_date); // Ngày phát hành của album
      const releaseDateString = releaseDate.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
      });
      const index = labels.indexOf(releaseDateString); // Tìm ngày phát hành trong mảng labels
      if (index !== -1) {
        albumCounts[index]++; // Tăng số lượng album cho ngày tương ứng
      }
    });

    // Biểu đồ cột
    new Chart('albumsChart', {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Thống kê số album phát hành theo ngày',
            data: albumCounts, // Dữ liệu số lượng album theo ngày
            backgroundColor: [
              '#4caf50',
              '#2196f3',
              '#ff9800',
              '#e91e63',
              '#9c27b0',
              '#3f51b5',
              '#00bcd4',
            ],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true, // Bắt đầu từ 0
            suggestedMax: Math.max(...albumCounts) + 5, // Đặt giá trị tối đa lớn hơn giá trị lớn nhất một chút
            ticks: {
              stepSize: undefined, // Để Chart.js tự động tính toán bước nhảy
            },
          },
        },
      },
    });

    // Biểu đồ tròn: Số lượng nhạc theo thể loại
    new Chart('genresChart', {
      type: 'pie',
      data: {
        labels: [
          this.stats.genres1,
          this.stats.genres2,
          this.stats.genres3,
          this.stats.genres4,
        ],
        datasets: [
          {
            data: [
              this.stats.totalGeneres1,
              this.stats.totalGeneres2,
              this.stats.totalGeneres3,
              this.stats.totalSongs -
                this.stats.totalGeneres1 -
                this.stats.totalGeneres2 -
                this.stats.totalGeneres3,
            ],
            backgroundColor: ['#4caf50', '#2196f3', '#ff9800', '#e91e63'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
      },
    });
  }
}
