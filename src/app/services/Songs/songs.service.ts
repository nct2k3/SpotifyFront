import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
export interface Notification {
  id: string;
  title: string;
  user: string;
  created_at: string;
}
@Injectable({
  providedIn: 'root'
})

export class SongsService {
  private apiUrl = 'http://127.0.0.1:8000/api/songs/';
  private apiUrlArtist = 'https://f14c4be8-2a85-4630-a08b-e8cde023ae41.mock.pstmn.io/songsArtiest';
  private apiUrlMyplaylist = 'http://127.0.0.1:8000/api/playlists/';
  private apiUrls = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

  // Hàm tiện ích để tạo header với token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('Token:', token);
    return new HttpHeaders({
      'Authorization': `Token ${token}`
    });
  }

  getTrack(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(data => data.results || data)
    );
  }

  searchSongs(query: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/search?q=${query}`).pipe(
      map(data => data.results || data)
    );
  }

  getTrackById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}${id}/`);
  }

  getTrackApi(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => console.log('Songs data:', data))
    );
  }

  addPlaylist(playlistData: { title: string; song_ids: string[] }): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrls}playlists/`, playlistData, { headers });
  }

  deletePlaylist(playlistId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.delete(`${this.apiUrls}playlists/${playlistId}/`, { headers });
  }

  // Xóa bài hát theo id
  deleteSong(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}${id}/`;
    return this.http.delete<any>(url, { headers }).pipe(
      tap(() => console.log(`Bài hát với ID ${id} đã được xóa`))
    );
  }

  // Thêm mới bài hát với file upload lên S3
  createSong(formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();

    return this.http.post<any>(this.apiUrl, formData, { headers }).pipe(
      tap((newSong) => console.log('Bài hát mới đã được tạo:', newSong))
    );
  }
  
  updateSong(id: number, formData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    const url = `${this.apiUrl}${id}/`;
    return this.http.put<any>(url, formData, { headers }).pipe(
      tap((updatedSong) => console.log(`Bài hát với ID ${id} đã được cập nhật:`, updatedSong))
    );
  }

  // Lấy playlist của người dùng
  getMyplayList(userId: string): Observable<any[]> {
    return this.http.get<any>(this.apiUrlMyplaylist).pipe(
      map(data => {
        const playlists = (data.results || data).filter((item: any) => item.user === userId);
        return playlists.flatMap((playlist: any) => playlist.songs);
      })
    );
  }

  getMyplayListAll(userId: string): Observable<any[]> {
    return this.http.get<any>(this.apiUrlMyplaylist).pipe(
        map(data => {
            const playlists = (data.results || data).filter((item: any) => item.user === userId);
            return playlists;
        })
    );
}

  getAlbum(id: string): Observable<any> {
    const url = `${this.apiUrlArtist}/${id}`;
    return this.http.get<any>(url);
  }

  getMyNotification(userId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrls}notifications/`, { headers }).pipe(
      map(data => {
        const notifications = (data.results || data).filter((item: any) => item.user === userId);
        console.log('Thông báo:', notifications);
        return notifications;
        
      })
    );
  }
  createNotification(userId: string, title: string): Observable<Notification> {
    const payload = {
      title: title,
      user: userId,
    };
    const headers = this.getAuthHeaders();
    return this.http.post<Notification>(`${this.apiUrls}notifications/`, payload,{ headers }).pipe(
      catchError((error) => {
        console.error('Lỗi khi tạo thông báo:', error);
        return throwError(() => new Error('Không thể tạo thông báo, vui lòng thử lại.'));
      })
    );
  }
  deleteNotification(notificationId: string): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrls}notifications/${notificationId}/`, { headers }).pipe(
      catchError((error) => {
        console.error('Lỗi khi xóa thông báo:', error);
        return throwError(() => new Error('Không thể xóa thông báo, vui lòng thử lại.'));
      })
    );
  }

}