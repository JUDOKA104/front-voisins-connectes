import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnonceDetail } from './annonce-detail';

describe('AnnonceDetail', () => {
  let component: AnnonceDetail;
  let fixture: ComponentFixture<AnnonceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnonceDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnonceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
