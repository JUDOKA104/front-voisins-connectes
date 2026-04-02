import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { unsavedChangesGuard } from './core/guards/unsaved-changes.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // === ESPACE PUBLIC ===
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.HomeComponent),
    title: "LienUrbain — L'entraide de quartier",
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginComponent),
    title: 'Connexion',
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register').then((m) => m.RegisterComponent),
    title: 'Inscription',
  },

  // === ESPACE CONNECTÉ ===
  {
    path: 'app/feed',
    canActivate: [authGuard],
    // On s'assure de bien charger le composant Feed (et plus le Home !)
    loadComponent: () => import('./pages/feed/feed').then((m) => m.FeedComponent),
    title: 'Le Fil',
  },
  {
    path: 'app/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.DashboardComponent),
    title: 'Mon Kanban',
  },
  {
    path: 'app/profile',
    canActivate: [authGuard],
    canDeactivate: [unsavedChangesGuard],
    loadComponent: () => import('./pages/profile/profile').then((m) => m.ProfileComponent),
    title: 'Mon Profil',
  },
  {
    path: 'app/admin',
    canActivate: [adminGuard], // 👈 Protégé par le guard !
    loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminComponent),
    title: 'Administration',
  },

  // ⚠️ ATTENTION : 'new' doit toujours être AVANT ':id'
  {
    path: 'app/annonces/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/annonce-form/annonce-form').then((m) => m.AnnonceFormComponent),
    title: 'Publier une annonce',
  },
  {
    path: 'app/annonces/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/annonce-form/annonce-form').then((m) => m.AnnonceFormComponent),
    title: "Modifier l'annonce",
  },
  {
    path: 'app/annonces/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/annonce-detail/annonce-detail').then((m) => m.AnnonceDetailComponent),
    title: "Détail de l'annonce",
  },

  // === LE CATCH-ALL (DOIT TOUJOURS ÊTRE LA TOUTE DERNIÈRE LIGNE) ===
  { path: '**', redirectTo: '' },
];
