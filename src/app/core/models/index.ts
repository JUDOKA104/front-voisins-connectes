// === Entités principales ===

export interface User {
  id: number;
  email?: string;
  nom: string;
  prenom: string;
  avatarUrl?: string;
  photoProfil?: string;
  roles?: string[];
  badges?: Badge[];
}

export interface Badge {
  id: number;
  nom: string;
  label?: string;
  icon?: string;
  color?: string;
}

export interface Categorie {
  id: number;
  nom: string;
}

export interface Annonce {
  id: number;
  titre: string;
  description: string;
  statut: string;
  categorie?: Categorie;
  createur?: User;
  helpers?: User[];
  maxHelpers?: number;
  _stagger?: number;
  estRemunere?: boolean;
  commentairesCount?: number;
  commentaires?: Commentaire[];
  createdAt?: string | Date;
  dateCreation?: string | Date;
  vues?: number;
}

export interface Commentaire {
  id: number;
  contenu: string;
  auteur: User;
  date?: string;
  createdAt?: string | Date;
}

// === Réponses API ===

export interface LoginResponse {
  token: string;
}

export interface BanResponse {
  isBanned: boolean;
  banMotif: string | null;
}

export interface TopCategorie {
  categorie: string;
  count?: number;
}

export interface AdminStats {
  utilisateurs_actifs: number;
  total_annonces: number;
  top_categories: TopCategorie[];
}

export interface AdminUser {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  photoProfil?: string;
  isBanned: boolean;
  banMotif?: string;
}

// === Payloads ===

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterPayload {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  password_confirm: string;
  roles?: string[];
}

export interface AnnoncePayload {
  titre: string;
  description: string;
  categorie_id: number;
  estRemunere?: boolean;
  maxHelpers?: number | null;
}