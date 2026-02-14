import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: false,
})
export class ProductCardComponent implements OnChanges {
  @Input() product: any;
  @Output() addToCart = new EventEmitter<{ product: any; quantity: number }>();
  @Output() goToDetail = new EventEmitter<any>();

  quantity = 1;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['product']) {
      this.quantity = 1;
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
    const parsed = Math.max(1, Math.min(parseInt(rawValue, 10) || 1, this.product?.stock ?? 1));
    this.quantity = parsed;
  }

  emitAddToCart() {
    this.addToCart.emit({ product: this.product, quantity: this.quantity });
  }
}
