import { Component, ViewChild } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';
import { LightboxComponent } from 'src/app/shared/lightbox/lightbox.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('fadeSlideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('1s 200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class HomeComponent {
  @ViewChild(LightboxComponent) lightbox!: LightboxComponent;
  visibleLightbox = false;

  miniGallery = [
    { src: 'assets/images/hero1.jpg', caption: 'Curcoma', thumb: 'assets/images/hero1.jpg', inventory: 1 },
    { src: 'assets/images/hero2.jpg', caption: 'Cassava', thumb: 'assets/images/hero2.jpg', inventory: 1 },
    { src: 'assets/images/hero3.jpg', caption: 'Knockout Roses', thumb: 'assets/images/hero3.jpg', inventory: 1 },
    { src: 'assets/images/hero4.jpg', caption: 'Chia', thumb: 'assets/images/hero4.jpg', inventory: 1 }
  ];

  openLightbox(index: number): void {
    this.lightbox.open(this.miniGallery, index);
  }
}
