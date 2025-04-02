import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { ApiResponseArtist, Artist } from 'src/app/Models/artists.model';

@Injectable({
  providedIn: 'root'
})
export class ArtistsService {
  private apiUrl = 'http://127.0.0.1:8000/api/artists/'

  constructor(private http: HttpClient) {}

  // Lấy danh sách nghệ sĩ từ API
  getArtists(): Observable<Artist[]> {
    return this.http.get<ApiResponseArtist>(this.apiUrl).pipe(
      map(response => response.results)  // Trả về mảng các nghệ sĩ từ trường results
    );
  }

  // Tạo mới một nghệ sĩ
  createArtist(artistData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, artistData);  // Gửi dữ liệu nghệ sĩ mới lên server
  }

  // Cập nhật thông tin nghệ sĩ
  updateArtist(artistId: string, artistData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${artistId}`, artistData);  // Cập nhật thông tin nghệ sĩ
  }

  // Xóa một nghệ sĩ theo ID
  deleteArtist(artistId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${artistId}`);  // Xóa nghệ sĩ theo ID
  }
}
