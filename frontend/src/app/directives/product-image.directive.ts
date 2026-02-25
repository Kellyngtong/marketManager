import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { ProductImageService } from '../services/product-image.service';

@Directive({
  selector: '[appProductImage]',
  standalone: true,
})
export class ProductImageDirective implements OnInit {
  @Input() appProductImage: string = ''; // Nombre del producto
  // Eliminado: ya no usamos URL remota en la directiva

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private imageService: ProductImageService,
  ) {}

  ngOnInit() {
    const img = this.el.nativeElement;

    // Establecer imagen inicial (solo local o default)
    const initialUrl = this.imageService.getProductImage(this.appProductImage);
    img.src = initialUrl;

    // Manejar errores de carga
    img.addEventListener('error', () => {
      // Si la imagen falla, volver a pedir la URL de producto (local o default)
      const fallback = this.imageService.getProductImage(this.appProductImage);
      if (img.src !== fallback) {
        img.src = fallback;
      }
    });
  }
}
