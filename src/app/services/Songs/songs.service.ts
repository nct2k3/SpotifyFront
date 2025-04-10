import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongsService {
  private apiUrlArtist = 'https://f14c4be8-2a85-4630-a08b-e8cde023ae41.mock.pstmn.io/songsArtiest';  
  private apiUrlMyplaylist = 'http://127.0.0.1:8000/api/playlists/?mine=1';

  private apiUrl = 'http://127.0.0.1:8000/api/songs/'
  constructor(private http: HttpClient) {}

  getTrack(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(data => data.results)
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

    const url = `${this.apiUrl}${id}/`;  // Giả sử API yêu cầu thêm id vào cuối URL
    return this.http.put<any>(url, song, { headers }).pipe(
      tap((updatedSong) => console.log('Bài hát đã được cập nhật:', updatedSong))
    );
  }

  // getMyplayList(): Observable<any> {
  getMyplayList(userId: string): Observable<any[]> {
    return this.http.get<any>(this.apiUrlMyplaylist).pipe(
      map(data => {
        const playlists = data.results.filter((item: any) => item.user === userId); 
        return playlists.flatMap((playlist: any) => playlist.songs); 
      }),
      tap(songs => console.log('Songs from playlists:', songs))
    );
  }
  getAlbum(id: string): Observable<any> {
    const url = `${this.apiUrlArtist}/${id}`;
    return this.http.get<any>(url).pipe(
      tap(data => console.log('Songs album data:', data))
    );
  }
}

