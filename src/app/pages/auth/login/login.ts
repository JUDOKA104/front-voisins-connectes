import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/mock.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'], // ou .scss
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.email || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }

    this.auth.login({ username: this.email, password: this.password }).subscribe({
      next: (response) => {
        console.log('Connexion réussie ! Token reçu :', response.token);
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        console.error('Erreur API :', err);

        if (err.status === 401) {
          // Symfony renvoie généralement l'erreur dans err.error.error ou err.error.message
          const serverError = err.error?.error || err.error?.message;

          // Si le serveur nous renvoie notre phrase CustomUserMessageAccountStatusException
          if (serverError && serverError.toLowerCase().includes('banni')) {
            this.errorMessage = serverError; // On affiche "Votre compte a été banni. Motif : X"
          } else {
            this.errorMessage = 'Email ou mot de passe incorrect.';
          }
        } else {
          this.errorMessage = 'Impossible de se connecter au serveur.';
        }

        this.cdr.detectChanges();
      },
    });
  }
}
