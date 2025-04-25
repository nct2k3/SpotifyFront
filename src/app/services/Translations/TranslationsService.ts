import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationsService {
  // Header component translations
  public headerTranslations = {
    'header.search.placeholder': {
      0: 'What do you want to play?',
      1: 'Bạn muốn phát nội dung gì?'
    },
    'header.login': {
      0: 'Login',
      1: 'Đăng nhập'
    },
    'header.profile': {
      0: 'Profile',
      1: 'Hồ sơ'
    },
    'header.settings': {
      0: 'Settings',
      1: 'Cài đặt'
    },
    'header.logout': {
      0: 'Logout',
      1: 'Đăng xuất'
    }
  };

  // Sidebar component translations
  public sidebarTranslations = {
    'sidebar.library': {
      0: 'Your Library',
      1: 'Thư viện của bạn'
    },
    'sidebar.playlist': {
      0: 'Playlist • ',
      1: 'Danh sách phát • '
    }
  };

  // Home component translations
  public homeTranslations = {
    'home.recommended': {
      0: 'Recommended for you',
      1: 'Đề xuất cho bạn'
    },
    'home.showall': {
      0: 'Show All',
      1: 'Xem tất cả'
    },
    'home.artistalbums': {
      0: 'Artist albums',
      1: 'Album nghệ sĩ'
    },
    'home.popularmusic': {
      0: 'Popular music',
      1: 'Nhạc phổ biến'
    },
    'home.all': {
      0: 'All',
      1: 'Tất cả'
    },
    'home.song': {
      0: 'Song',
      1: 'Bài hát'
    },
    'home.album': {
      0: 'Album',
      1: 'Album'
    }
  };

  // Album component translations
  public albumTranslations = {
    'album.album': {
      0: 'Album',
      1: 'Album'
    },
    'album.songlist': {
      0: 'Song list:',
      1: 'Danh sách bài hát:'
    },
    'album.title': {
      0: 'Title',
      1: 'Tên bài hát'
    },
    'album.duration': {
      0: 'Duration',
      1: 'Thời lượng'
    },
    'album.recommendations': {
      0: 'Recommendations',
      1: 'Đề xuất'
    },
    'album.basedon': {
      0: 'Based on content in this playlist',
      1: 'Dựa trên nội dung có trong danh sách phát này'
    },
    'album.add': {
      0: 'Add',
      1: 'Thêm'
    }
  };

  // Detail component translations
  public detailTranslations = {
    'detail.song': {
      0: 'Song',
      1: 'Bài hát'
    },
    'detail.lyrics': {
      0: 'Lyrics',
      1: 'Lời bài hát'
    },
    'detail.artist': {
      0: 'Artist',
      1: 'Nghệ sĩ'
    },
    'detail.recommendations': {
      0: 'Recommendations',
      1: 'Đề xuất'
    },
    'detail.basedon': {
      0: 'Based on content in this playlist',
      1: 'Dựa trên nội dung có trong danh sách phát này'
    },
    'detail.add': {
      0: 'Add',
      1: 'Thêm'
    },
    'detail.download': {
      0: 'Download song',
      1: 'Tải bài hát'
    },
    'detail.addtoplaylist': {
      0: 'Add to your playlist',
      1: 'Thêm vào playlist của bạn'
    }
  };

  // MyPlaylist component translations
  public myPlaylistTranslations = {
    'myplaylist.playlist': {
      0: 'Playlist',
      1: 'Danh sách phát'
    },
    'myplaylist.song': {
      0: 'Song',
      1: 'Bài hát'
    },
    'myplaylist.duration': {
      0: 'Duration',
      1: 'Thời lượng'
    },
    'myplaylist.delete': {
      0: 'Delete',
      1: 'Xóa'
    },
    'myplaylist.nosongs': {
      0: 'No songs',
      1: 'Không có bài hát nào'
    },
    'myplaylist.recommendations': {
      0: 'Recommendations',
      1: 'Đề xuất'
    },
    'myplaylist.basedon': {
      0: 'Based on content in this playlist',
      1: 'Dựa trên nội dung có trong danh sách phát này'
    },
    'myplaylist.add': {
      0: 'Add',
      1: 'Thêm'
    }
  };

  // Search component translations
  public searchTranslations = {
    'search.topresult': {
      0: 'Top Result',
      1: 'Kết quả hàng đầu'
    },
    'search.songs': {
      0: 'Songs',
      1: 'Bài hát'
    },
    'search.noresults': {
      0: 'No results found for',
      1: 'Không tìm thấy kết quả cho'
    }
  };

  // Product/List component translations
  public productTranslations = {
    'product.songsfor': {
      0: 'Songs for you',
      1: 'Bài hát cho bạn'
    },
    'product.albumsfor': {
      0: 'Albums for your',
      1: 'Album cho bạn'
    },
    'product.home': {
      0: 'Home',
      1: 'Trang chủ'
    },
    'product.song': {
      0: 'Song',
      1: 'Bài hát'
    },
    'product.album': {
      0: 'Album',
      1: 'Album'
    },
    'product.song.prefix': {
      0: 'Song:',
      1: 'Bài hát:'
    },
    'product.album.prefix': {
      0: 'Album:',
      1: 'Album:'
    }
  };

  // Notifications component translations
  public notificationsTranslations = {
    'notifications.title': {
      0: 'Notifications',
      1: 'Thông báo'
    },
    'notifications.clearall': {
      0: 'Clear All',
      1: 'Xóa tất cả'
    },
    'notifications.empty': {
      0: 'No notifications found.',
      1: 'Không có thông báo nào.'
    }
  };

  // Login/Register components translations
  public loginTranslations = {
    'login.title': {
      0: 'Login to Spotify',
      1: 'Đăng nhập vào Spotify'
    },
    'login.username': {
      0: 'Email or username',
      1: 'Email hoặc tên người dùng'
    },
    'login.password': {
      0: 'Password',
      1: 'Mật khẩu'
    },
    'login.loginBtn': {
      0: 'Login',
      1: 'Đăng nhập'
    },
    'login.forgotPassword': {
      0: 'Forgot your password?',
      1: 'Quên mật khẩu của bạn?'
    },
    'login.noAccount': {
      0: 'Don\'t have an account?',
      1: 'Bạn chưa có tài khoản?'
    },
    'login.register': {
      0: 'Register for Spotify',
      1: 'Đăng ký Spotify'
    }
  };

  // Register component translations
  public registerTranslations = {
    'register.title': {
      0: 'Register for Spotify',
      1: 'Đăng ký vào Spotify'
    },
    'register.email': {
      0: 'Email address',
      1: 'Địa chỉ email'
    },
    'register.password': {
      0: 'Password',
      1: 'Mật khẩu'
    },
    'register.confirmPassword': {
      0: 'Confirm password',
      1: 'Nhập lại mật khẩu'
    },
    'register.firstName': {
      0: 'First name',
      1: 'Tên'
    },
    'register.lastName': {
      0: 'Last name',
      1: 'Họ'
    },
    'register.username': {
      0: 'Username',
      1: 'Tên đăng nhập'
    },
    'register.next': {
      0: 'Next',
      1: 'Tiếp theo'
    },
    'register.createPassword': {
      0: 'Create password',
      1: 'Tạo mật khẩu'
    },
    'register.personalInfo': {
      0: 'Tell us about yourself',
      1: 'Giới thiệu thông tin về bản thân bạn'
    },
    'register.requirements': {
      0: 'Your password must have at least:',
      1: 'Mật khẩu của bạn phải có ít nhất:'
    },
    'register.letter': {
      0: '1 letter',
      1: '1 chữ cái'
    },
    'register.number': {
      0: '1 number or special character (e.g.: # ? ! &)',
      1: '1 chữ số hoặc ký tự đặc biệt (ví dụ: # ? ! &)'
    },
    'register.minLength': {
      0: '10 characters',
      1: '10 ký tự'
    },
    'register.passwordMatch': {
      0: 'Password and confirm password must match',
      1: 'Mật khẩu và nhập lại mật khẩu khớp nhau'
    },
    'register.registerBtn': {
      0: 'Register',
      1: 'Đăng ký'
    },
    'register.haveAccount': {
      0: 'Already have an account?',
      1: 'Bạn đã có tài khoản?'
    },
    'register.login': {
      0: 'Login to Spotify',
      1: 'Đăng nhập Spotify'
    }
  };

  // Profile component translations
  public profileTranslations = {
    'profile.title': {
      0: 'Edit Profile',
      1: 'Chỉnh sửa hồ sơ'
    },
    'profile.username': {
      0: 'Username',
      1: 'Tên đăng nhập'
    },
    'profile.email': {
      0: 'Email',
      1: 'Email'
    },
    'profile.firstName': {
      0: 'First name',
      1: 'Tên'
    },
    'profile.lastName': {
      0: 'Last name',
      1: 'Họ'
    },
    'profile.currentPassword': {
      0: 'Enter current password',
      1: 'Nhập mật khẩu hiện tại'
    },
    'profile.changePassword': {
      0: 'Change password',
      1: 'Đổi mật khẩu'
    },
    'profile.newPassword': {
      0: 'New password',
      1: 'Mật khẩu mới'
    },
    'profile.confirmPassword': {
      0: 'Confirm password',
      1: 'Nhập lại mật khẩu'
    },
    'profile.cancel': {
      0: 'Cancel',
      1: 'Hủy'
    },
    'profile.save': {
      0: 'Save profile',
      1: 'Lưu hồ sơ'
    }
  };

  // Admin components - general translations
  public adminTranslations = {
    'admin.dashboard': {
      0: 'Dashboard',
      1: 'Bảng điều khiển'
    },
    'admin.users': {
      0: 'Users',
      1: 'Người dùng'
    },
    'admin.artists': {
      0: 'Artists',
      1: 'Nghệ sĩ'
    },
    'admin.songs': {
      0: 'Songs',
      1: 'Bài hát'
    },
    'admin.albums': {
      0: 'Albums',
      1: 'Albums'
    },
    'admin.create': {
      0: 'Create',
      1: 'Tạo mới'
    },
    'admin.edit': {
      0: 'Edit',
      1: 'Chỉnh sửa'
    },
    'admin.delete': {
      0: 'Delete',
      1: 'Xóa'
    },
    'admin.cancel': {
      0: 'Cancel',
      1: 'Hủy'
    },
    'admin.save': {
      0: 'Save',
      1: 'Lưu'
    },
    'admin.update': {
      0: 'Update',
      1: 'Cập nhật'
    },
    'admin.search': {
      0: 'Search',
      1: 'Tìm kiếm'
    },
    'admin.loading': {
      0: 'Loading...',
      1: 'Đang tải...'
    }
  };

  // Footer component translations
  public footerTranslations = {
    'footer.notrack': {
      0: 'No track selected',
      1: 'Chưa chọn bài hát'
    },
    'footer.lyrics': {
      0: 'Lyrics',
      1: 'Lời bài hát'
    },
    'footer.nolyrics': {
      0: 'No lyrics available',
      1: 'Không có lời bài hát'
    }
  };

  // General translations
  public generalTranslations = {
    'general.minutes': {
      0: 'minutes',
      1: 'phút'
    },
    'general.unknownTitle': {
      0: 'Unknown Title',
      1: 'Không có tiêu đề'
    },
    'general.unknownArtist': {
      0: 'Unknown Artist',
      1: 'Nghệ sĩ không xác định'
    }
  };
  
  // Language selector translations
  public languageTranslations = {
    'language.english': {
      0: 'English',
      1: 'Tiếng Anh'
    },
    'language.vietnamese': {
      0: 'Vietnamese',
      1: 'Tiếng Việt'
    }
  };



  public getPageTranslations(page: string, languageIndex: number): { [key: string]: string } {
    let translationObj: { [key: string]: { [key: number]: string } } = {};
    
    switch (page) {
      case 'header':
        translationObj = this.headerTranslations;
        break;
      case 'sidebar':
        translationObj = this.sidebarTranslations;
        break;
      case 'home':
        translationObj = this.homeTranslations;
        break;
      case 'album':
        translationObj = this.albumTranslations;
        break;
      case 'detail':
        translationObj = this.detailTranslations;
        break;
      case 'myPlaylist':
        translationObj = this.myPlaylistTranslations;
        break;
      case 'search':
        translationObj = this.searchTranslations;
        break;
      case 'product':
        translationObj = this.productTranslations;
        break;
      case 'notifications':
        translationObj = this.notificationsTranslations;
        break;
      case 'login':
        translationObj = this.loginTranslations;
        break;
      case 'register':
        translationObj = this.registerTranslations;
        break;
      case 'profile':
        translationObj = this.profileTranslations;
        break;
      case 'admin':
        translationObj = this.adminTranslations;
        break;
      case 'footer':
        translationObj = this.footerTranslations;
        break;
      case 'general':
        translationObj = this.generalTranslations;
        break;
      case 'language':
        translationObj = this.languageTranslations;
        break;
      default:
        return {};
    }
    const result: { [key: string]: string } = {};
    
    for (const key in translationObj) {
      result[key] = translationObj[key][languageIndex] !== undefined ? translationObj[key][languageIndex] : translationObj[key][0]; // Fallback to English
    }
    
    return result;
  }
}