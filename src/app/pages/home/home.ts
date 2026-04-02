import { ChangeDetectionStrategy, Component, HostListener, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Stat {
  value: string;
  label: string;
}

interface ValueItem {
  number: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  isScrolled = signal(false);

  marqueeWords = [
    'Bricolage',
    'Jardinage',
    'Soutien scolaire',
    'Informatique',
    'Déménagement',
    "Garde d'animaux",
    'Courses',
    'Cuisine',
    'Tutorat',
    'Aide à domicile',
    'Couture',
    'Photographie',
  ];

  stats: Stat[] = [
    { value: '1 200+', label: 'Membres actifs' },
    { value: '340', label: 'Annonces ce mois' },
    { value: '18', label: 'Quartiers couverts' },
  ];

  values: ValueItem[] = [
    {
      number: '01',
      title: 'Proximité réelle',
      desc: "Échangez avec des habitants de votre quartier. Pas d'inconnus à l'autre bout de la ville.",
    },
    {
      number: '02',
      title: 'Liberté de choix',
      desc: "Services gratuits ou rémunérés. Vous décidez. La plateforme facilite, n'impose pas.",
    },
    {
      number: '03',
      title: 'Confiance par défaut',
      desc: 'Profils vérifiés, évaluations transparentes. La communauté se régule elle-même.',
    },
  ];

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled.set(window.scrollY > 20);
  }
}
