export interface User {
  id: number;
  email?: string;
  nom: string;
  prenom: string;
  avatarUrl?: string;
  photoProfil?: string;
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
  _stagger?: number;
  estRemunere?: boolean;
  commentairesCount?: number;
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
