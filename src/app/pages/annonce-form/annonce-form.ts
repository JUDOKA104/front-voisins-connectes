import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { AnnonceService } from '../../core/services/annonce.service';
import { Categorie } from '../../core/models';

@Component({
  selector: 'app-annonce-form',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './annonce-form.html',
  styleUrls: ['./annonce-form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnonceFormComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private annonceService = inject(AnnonceService);

  private annonceId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id'))),
  );

  isEditMode = computed(() => !!this.annonceId());

  categories = signal<Categorie[]>([]);
  titre = signal('');
  description = signal('');
  categorieId = signal('');
  estRemunere = signal(false);
  maxHelpers = signal<number | null>(null);
  isSubmitting = signal(false);

  constructor() {
    this.annonceService.getCategories().subscribe((c) => this.categories.set(c));

    effect(() => {
      const id = this.annonceId();
      if (id) {
        this.annonceService.getAnnonceById(id).subscribe((a) => {
          this.titre.set(a.titre);
          this.description.set(a.description);
          this.categorieId.set(a.categorie?.id?.toString() ?? '');
          this.estRemunere.set(a.estRemunere ?? false);
          this.maxHelpers.set(a.maxHelpers ?? null);
        });
      }
    });
  }

  onSubmit(): void {
    const payload = {
      titre: this.titre(),
      description: this.description(),
      categorie_id: parseInt(this.categorieId()),
      estRemunere: this.estRemunere(),
      maxHelpers: this.maxHelpers(),
    };

    this.isSubmitting.set(true);

    const request$ = this.isEditMode()
      ? this.annonceService.updateAnnonce(this.annonceId()!, payload)
      : this.annonceService.createAnnonce(payload);

    request$.subscribe({
      next: () => this.router.navigate(['/app/dashboard']),
      error: () => this.isSubmitting.set(false),
    });
  }
}