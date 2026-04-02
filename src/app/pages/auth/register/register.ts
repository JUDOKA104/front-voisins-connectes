import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private authService = inject(AuthService);

  prenom = signal('');
  nom = signal('');
  email = signal('');
  password = signal('');
  confirmPassword = signal('');
  errorMessage = signal('');
  isSubmitting = signal(false);
  isRegistered = signal(false);

  selectedFile = signal<File | null>(null);
  avatarPreview = signal<string | null>(null);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      this.avatarPreview.set((e.target as FileReader).result as string);
    };
    reader.readAsDataURL(file);
  }

  onSubmit(): void {
    this.errorMessage.set('');

    if (!this.prenom() || !this.nom() || !this.email() || !this.password()) {
      this.errorMessage.set('Veuillez remplir tous les champs texte.');
      return;
    }

    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    if (!this.selectedFile()) {
      this.errorMessage.set('La photo de profil est obligatoire.');
      return;
    }

    this.isSubmitting.set(true);

    const formData = new FormData();
    formData.append('prenom', this.prenom());
    formData.append('nom', this.nom());
    formData.append('email', this.email());
    formData.append('password', this.password());
    formData.append('password_confirm', this.confirmPassword());
    formData.append('photoProfil', this.selectedFile()!);

    this.authService.register(formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.isRegistered.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.erreur || 'Impossible de créer le compte.');
      },
    });
  }
}