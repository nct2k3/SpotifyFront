import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SongsService {
<<<<<<< Updated upstream
  private apiUrl = 'https://40733aaf-b85f-4031-9bd3-4c7699e98edf.mock.pstmn.io/songs'; 
=======
  // private apiUrl = 'https://9e279ba3-83b0-4fdb-b1a2-4c891154f83a.mock.pstmn.io/songs';
  private apiUrlArtist = 'https://f14c4be8-2a85-4630-a08b-e8cde023ae41.mock.pstmn.io/songsArtiest';  
  private apiUrlMyplaylist = 'https://d2768f67-ebb0-4044-b0de-ee96da3d416c.mock.pstmn.io/myplaylist';
>>>>>>> Stashed changes

  private apiUrl = 'http://127.0.0.1:8000/api/songs/'
  constructor(private http: HttpClient) {}

  getTrack(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => console.log('Songs data:', data))
    );
  }
<<<<<<< Updated upstream
=======
  // Xóa bài hát theo id
  deleteSong(id: string): Observable<any> {
    const url = `${this.apiUrl}${id}/`;  // Giả sử API yêu cầu thêm id vào cuối URL
    return this.http.delete<any>(url).pipe(
      tap(() => console.log(`Bài hát với ID ${id} đã được xóa`))
    );
  }

  // Thêm mới bài hát
  createSong(song: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, song).pipe(
      tap((newSong) => console.log('Bài hát mới đã được tạo:', newSong))
    );
  }

  // Cập nhật bài hát
  updateSong(id: string, song: any): Observable<any> {
    const url = `${this.apiUrl}${id}/`;  // Giả sử API yêu cầu thêm id vào cuối URL
    return this.http.put<any>(url, song).pipe(
      tap((updatedSong) => console.log('Bài hát đã được cập nhật:', updatedSong))
    );
  }

  getMyplayList(): Observable<any> {
    return this.http.get<any>(this.apiUrlMyplaylist).pipe(
      tap(data => console.log('Songs my data:', data))
    );
  }
  getAlbum(id: string): Observable<any> {
    const url = `${this.apiUrlArtist}/${id}`;
    return this.http.get<any>(url).pipe(
      tap(data => console.log('Songs album data:', data))
    );
  }
>>>>>>> Stashed changes
}

