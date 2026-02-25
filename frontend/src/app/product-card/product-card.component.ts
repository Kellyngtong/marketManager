import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import {
  getBaseOriginalPrice,
  getOfferDiscountPercent,
  getOriginalPricesMap,
  getPremiumUnitPrice,
  isOfferProduct,
} from '../utils/premium-pricing.util';
import { ProductImageService } from '../services/product-image.service';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: false,
})
export class ProductCardComponent implements OnChanges {
  @Input() product: any;
  @Input() cartCount = 0;
  @Input() isPremiumClient = false;
  @Output() addToCart = new EventEmitter<{ product: any; quantity: number }>();
  @Output() goToDetail = new EventEmitter<any>();
  private originalPricesCache: Record<string, number> | null = null;

  quantity = 1;

  constructor(public imageService: ProductImageService) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product']) {
      this.quantity = 1;
    }
  }

  handleImageError(event: Event, productName: string): void {
    const img = event.target as HTMLImageElement;
    const localUrl = this.imageService.getLocalImageUrl(productName);
    if (localUrl && img.src !== localUrl) {
      img.src = localUrl;
    } else {
      img.src = this.imageService.getProductImage(productName);
    }
  }

  increaseQuantity() {
    const max = this.product?.stock ?? 1;
    if (this.quantity < max) {
      this.quantity += 1;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity -= 1;
    }
  }

  normalizeQuantity(event?: any) {
    const rawValue = event?.detail?.value ?? this.quantity;
    const parsed = Math.max(
      1,
      Math.min(parseInt(rawValue, 10) || 1, this.product?.stock ?? 1),
    );
    this.quantity = parsed;
  }

  emitAddToCart() {
    this.addToCart.emit({ product: this.product, quantity: this.quantity });
  }

  isOfferProduct(product: any): boolean {
    return isOfferProduct(product);
  }

  getCurrentPrice(product: any): number {
    return this.toPositiveNumber(product?.precio_venta ?? product?.price);
  }

  getOriginalPrice(product: any): number {
    const currentPrice = this.getCurrentPrice(product);
    const candidateOriginal = getBaseOriginalPrice(
      product,
      this.getOriginalPricesMap(),
    );

    if (candidateOriginal > currentPrice) {
      return candidateOriginal;
    }

    return currentPrice;
  }

  hasOfferComparison(product: any): boolean {
    const currentPrice = this.getCurrentPrice(product);
    const originalPrice = this.getOriginalPrice(product);
    return currentPrice > 0 && originalPrice > currentPrice;
  }

  getDisplayPrice(product: any): number {
    const currentPrice = this.getCurrentPrice(product);
    if (!this.isPremiumClient) {
      return currentPrice;
    }

    return getPremiumUnitPrice(product, this.getOriginalPricesMap());
  }

  getBasePriceForDisplay(product: any): number {
    if (this.isPremiumClient) {
      if (this.isOfferProduct(product)) {
        const originalPrice = this.getOriginalPrice(product);
        if (originalPrice > 0) {
          return originalPrice;
        }
      }

      return this.getCurrentPrice(product);
    }

    return this.getOriginalPrice(product);
  }

  hasPremiumComparison(product: any): boolean {
    if (!this.isPremiumClient) {
      return false;
    }

    const basePrice = this.getCurrentPrice(product);
    const premiumPrice = this.getDisplayPrice(product);
    return basePrice > 0 && premiumPrice > 0 && premiumPrice < basePrice;
  }

  isPremiumOfferDisplay(product: any): boolean {
    if (!this.isPremiumClient || !this.isOfferProduct(product)) {
      return false;
    }

    const basePrice = this.getBasePriceForDisplay(product);
    const premiumPrice = this.getDisplayPrice(product);
    return basePrice > 0 && premiumPrice > 0 && premiumPrice < basePrice;
  }

  getDiscountPercent(product: any): number {
    if (this.isPremiumClient && this.isOfferProduct(product)) {
      const base = getOfferDiscountPercent(
        product,
        this.getOriginalPricesMap(),
      );
      if (base > 0) {
        return Math.min(base + 10, 95);
      }
      return 10;
    }

    const currentPrice = this.getCurrentPrice(product);
    const originalPrice = this.getOriginalPrice(product);

    if (originalPrice > currentPrice && currentPrice > 0) {
      const computed = ((originalPrice - currentPrice) / originalPrice) * 100;
      return Math.max(1, Math.round(computed));
    }

    return 0;
  }

  private getOriginalPricesMap(): Record<string, number> {
    if (this.originalPricesCache) {
      return this.originalPricesCache;
    }

    this.originalPricesCache = getOriginalPricesMap();
    return this.originalPricesCache;
  }

  private toPositiveNumber(value: any): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }
}
