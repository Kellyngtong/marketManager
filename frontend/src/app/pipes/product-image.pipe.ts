import { Pipe, PipeTransform } from '@angular/core';
import { ProductImageService } from '../services/product-image.service';

@Pipe({
  name: 'productImage',
  standalone: true,
})
export class ProductImagePipe implements PipeTransform {
  constructor(private imageService: ProductImageService) {}

  transform(productName: string): string {
    return this.imageService.getProductImage(productName);
  }
}
