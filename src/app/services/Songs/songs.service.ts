import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators'; // Import map cùng với tap

@Injectable({
  providedIn: 'root'
})
export class SongsService {
  private apiUrl = 'http://127.0.0.1:8000/api/songs/';
  private apiUrlArtist = 'https://f14c4be8-2a85-4630-a08b-e8cde023ae41.mock.pstmn.io/songsArtiest';
  private apiUrlMyplaylist = 'http://127.0.0.1:8000/api/playlists/';
  private apiUrls = 'http://127.0.0.1:8000/api/';

  constructor(private http: HttpClient) {}

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
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });
    return this.http.post(`${this.apiUrls}playlists/`, playlistData, { headers }).pipe(
    );
  }
  deletePlaylist(playlistId: string): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });
    return this.http.delete(`${this.apiUrls}playlists/${playlistId}/`, { headers }).pipe(
    );
  }

  // Xóa bài hát theo id
  deleteSong(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });

    const url = `${this.apiUrl}${id}/`;  // Giả sử API yêu cầu thêm id vào cuối URL
    return this.http.delete<any>(url, {headers}).pipe(
      tap(() => console.log(`Bài hát với ID ${id} đã được xóa`))
    );
  }

  // Thêm mới bài hát
  createSong(song: any): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });

    return this.http.post<any>(this.apiUrl, song, { headers }).pipe(
      tap((newSong) => console.log('Bài hát mới đã được tạo:', newSong))
    );
  }

  // Cập nhật bài hát
  updateSong(id: number, song: any): Observable<any> {
    const token = localStorage.getItem('token');
    console.log(token);

    const headers = new HttpHeaders({
      'Authorization': `Token ${token}`
    });

    const url = `${this.apiUrl}${id}/`;
    return this.http.put<any>(url, song, { headers }).pipe(
    );
  }

  // Lấy playlist của người dùng
  getMyplayList(userId: string): Observable<any[]> {
    return this.http.get<any>(this.apiUrlMyplaylist).pipe(
      map(data => {
        const playlists = (data.results || data).filter((item: any) => item.user === userId);
        return playlists.flatMap((playlist: any) => playlist.songs);
      }),
    );
  }
  getMyplayListAll(userId: string): Observable<any[]> {
    return this.http.get<any>(this.apiUrlMyplaylist).pipe(
      map(data => {
        const playlists = (data.results || data).filter((item: any) => item.user === userId);
        return playlists; 
      }),
    );
  }

  // Lấy album theo id
  getAlbum(id: string): Observable<any> {
    const url = `${this.apiUrlArtist}/${id}`;
    return this.http.get<any>(url).pipe();
  }
}