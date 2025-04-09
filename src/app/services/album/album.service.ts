import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AlbumService {
  private apiUrl = 'http://127.0.0.1:8000/api/albums/';

  constructor(private http: HttpClient) {}

  // Lấy danh sách album
  getAlbum(): Observable<any> {
    return this.http.get<any>(this.apiUrl).pipe(
      tap(data => console.log('Albums data:', data.results)),
      map(data => data.results) 
    );
  }

  // Lấy một album cụ thể theo ID (tùy chọn)
  getAlbumByid(id: string): Observable<any> {
    const url = `${this.apiUrl}${id}/`;
    return this.http.get<any>(url).pipe(
      tap(data => console.log('Album data:', data))
    );
  }
}