import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Annonce, AnnoncePayload, Categorie, Commentaire } from '../models';

@Injectable({ providedIn: 'root' })
export class AnnonceService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8000/api';

  getAnnonces(categorieId?: number): Observable<Annonce[]> {
    let url = `${this.apiUrl}/annonces`;
    if (categorieId) {
      url += `?categorie=${categorieId}`;
    }
    return this.http.get<Annonce[]>(url);
  }

  getCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/categories`);
  }

  getAnnonceById(id: string | number): Observable<Annonce> {
    return this.http.get<Annonce>(`${this.apiUrl}/annonces/${id}`);
  }

  createAnnonce(annonceData: AnnoncePayload): Observable<Annonce> {
    return this.http.post<Annonce>(`${this.apiUrl}/annonces`, annonceData);
  }

  updateAnnonce(id: number | string, data: AnnoncePayload): Observable<Annonce> {
    return this.http.put<Annonce>(`${this.apiUrl}/annonces/${id}`, data);
  }

  updateAnnonceStatut(id: number, statut: string): Observable<Annonce> {
    return this.http.patch<Annonce>(`${this.apiUrl}/annonces/${id}/statut`, { statut });
  }

  deleteAnnonce(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/annonces/${id}`);
  }

  aiderAnnonce(id: number | string): Observable<Annonce> {
    return this.http.patch<Annonce>(`${this.apiUrl}/annonces/${id}/aider`, {});
  }

  desisterAnnonce(id: number | string, motif: string): Observable<Annonce> {
    return this.http.patch<Annonce>(`${this.apiUrl}/annonces/${id}/desister`, { motif });
  }

  addComment(annonceId: number | string, contenu: string): Observable<Commentaire> {
    return this.http.post<Commentaire>(`${this.apiUrl}/annonces/${annonceId}/commentaires`, {
      contenu,
    });
  }
}