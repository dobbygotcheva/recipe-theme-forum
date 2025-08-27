import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Theme } from '../interfaces/theme';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private apiUrl = '/api/favorites';

  constructor(private http: HttpClient) { }

  // Get user favorites
  getUserFavorites(): Observable<Theme[]> {
    console.log('FavoritesService: Getting user favorites from:', this.apiUrl);
    return this.http.get<Theme[]>(this.apiUrl, { withCredentials: true });
  }

  // Add recipe to favorites
  addToFavorites(themeId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${themeId}`, {}, { withCredentials: true });
  }

  // Remove recipe from favorites
  removeFromFavorites(themeId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${themeId}`, { withCredentials: true });
  }

  // Check if recipe is in favorites
  checkFavorite(themeId: string): Observable<{ isFavorite: boolean }> {
    return this.http.get<{ isFavorite: boolean }>(`${this.apiUrl}/${themeId}/check`, { withCredentials: true });
  }

  // Toggle favorite status
  toggleFavorite(themeId: string, isCurrentlyFavorite: boolean): Observable<any> {
    if (isCurrentlyFavorite) {
      return this.removeFromFavorites(themeId);
    } else {
      return this.addToFavorites(themeId);
    }
  }
}
