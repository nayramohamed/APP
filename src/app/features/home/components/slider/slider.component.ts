import {
  afterNextRender,
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { SwiperContainer } from 'swiper/element';
import { ISlideData } from './models/slide-data.model';
import { LeftArrowIconComponent } from './icons/left-arrow-icon/left-arrow-icon.component';
import { RightArrowIconComponent } from './icons/right-arrow-icon/right-arrow-icon.component';
import { TranslatePipe } from '@ngx-translate/core';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-slider',
  imports: [LeftArrowIconComponent, RightArrowIconComponent, TranslatePipe, RouterLink],
  templateUrl: './slider.component.html',
  styleUrl: './slider.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { ngSkipHydration: 'true' },
})
export class SliderComponent implements OnInit {
  slides: ISlideData[] = [];
  currentIndex = signal(0);
  loaded = signal(false);

  @ViewChild('swiperContainer') swiperContainer!: ElementRef<SwiperContainer>;

  constructor() {
    afterNextRender(() => {
      this.loaded.set(true);
    });
  }

  nextSlide(): void {
    const swiper = this.swiperContainer?.nativeElement?.swiper;

    if (!swiper || !this.slides.length) {
      return;
    }
    if (swiper.slideNext()) {
      const nextIndex = (this.currentIndex() + 1) % this.slides.length;
      this.currentIndex.set(nextIndex);
    }
  }

  prevSlide(): void {
    const swiper = this.swiperContainer?.nativeElement?.swiper;

    if (!swiper || !this.slides.length) {
      return;
    }

    if (swiper.slidePrev()) {
      const prevIndex = (this.currentIndex() - 1 + this.slides.length) % this.slides.length;
      this.currentIndex.set(prevIndex);
    }
  }

  goToSlide(index: number): void {
    const swiper = this.swiperContainer?.nativeElement?.swiper;

    if (!swiper) {
      return;
    }

    swiper.slideTo(index);
    this.currentIndex.set(index);
  }

  ngOnInit(): void {
    this.slides = [
      {
        imageUrl: 'images/slider/home-slider.png',
        title: 'home.slider.slide1.title',
        description: 'home.slider.slide1.description',
        firstButtonText: { text: 'home.slider.slide1.firstButton', action: '/products' },
        secondButtonText: { text: 'home.slider.slide1.secondButton', action: '/deals' },
      },
      {
        imageUrl: 'images/slider/home-slider.png',
        title: 'home.slider.slide2.title',
        description: 'home.slider.slide2.description',
        firstButtonText: { text: 'home.slider.slide2.firstButton', action: '/products' },
        secondButtonText: { text: 'home.slider.slide2.secondButton', action: '/about' },
      },
      {
        imageUrl: 'images/slider/home-slider.png',
        title: 'home.slider.slide3.title',
        description: 'home.slider.slide3.description',
        firstButtonText: { text: 'home.slider.slide3.firstButton', action: '/products' },
        secondButtonText: { text: 'home.slider.slide3.secondButton', action: '/delivery' },
      },
    ];
  }
}
