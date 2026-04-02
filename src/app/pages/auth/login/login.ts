import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = signal('');
  password = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.email() || !this.password()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }

    this.isSubmitting.set(true);

    this.authService.login({ username: this.email(), password: this.password() }).subscribe({
      next: () => {
        this.router.navigate(['/app/dashboard']);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);

        if (err.status === 401) {
          const serverError = err.error?.error || err.error?.message;
          if (serverError && String(serverError).toLowerCase().includes('banni')) {
            this.errorMessage.set(serverError);
          } else {
            this.errorMessage.set('Email ou mot de passe incorrect.');
          }
        } else {
          this.errorMessage.set('Impossible de se connecter au serveur.');
        }
      },
    });
  }
}