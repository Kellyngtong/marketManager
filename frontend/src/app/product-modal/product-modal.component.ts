import { Component, Input, OnInit } from '@angular/core';
import { ModalController, IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-modal',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
})
export class ProductModalComponent {
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialProduct: any = null;
  @Input() showOferta = true;

  product: any = {
    name: '',
    description: '',
    price: null,
    stock: null,
    image: '',
    tipo: 'fruta',
    oferta: false,
  };
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  private initialSnapshot: any = null;
  readonly tipos = [
    { label: 'Fruta', value: 'fruta' },
    { label: 'Verdura', value: 'verdura' },
    { label: 'Embutidos', value: 'embutidos' },
    { label: 'Carne', value: 'carne' },
    { label: 'Pescado', value: 'pescado' },
    { label: 'Bebidas', value: 'bebidas' },
    { label: 'Bebidas alcohólicas', value: 'bebidas alcoholicas' },
    { label: 'Trigo', value: 'trigo' },
  ];

  constructor(private modalCtrl: ModalController) {}

  ngOnInit() {
    if (!this.initialProduct) {
      return;
    }

    this.product = {
      name: this.initialProduct.nombre || this.initialProduct.name || '',
      description: this.initialProduct.descripcion || this.initialProduct.description || '',
      price: this.initialProduct.precio_venta ?? this.initialProduct.price ?? null,
      stock: this.initialProduct.stock ?? null,
      image: this.initialProduct.imagen || this.initialProduct.image || '',
      tipo: this.initialProduct.tipo || 'fruta',
      oferta: !!this.initialProduct.oferta,
    };

    if (this.product.image) {
      this.previewUrl = this.product.image;
    }

    this.initialSnapshot = this.toComparable(this.product);
  }

  onFileSelected(event: any) {
    const file: File = event.target.files && event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => (this.previewUrl = e.target.result);
    reader.readAsDataURL(file);
  }

  cancel() {
    this.modalCtrl.dismiss();
  }

  submit() {
    if (!this.hasRequiredFields()) {
      alert('Por favor completa todos los campos obligatorios.');
      return;
    }

    if (this.mode === 'edit' && !this.hasChanges()) {
      alert('Realiza al menos un cambio antes de guardar.');
      return;
    }

    // Return the product and (optionally) the selected file and preview URL.
    // The outer page can upload the file or use the preview as an image string.
    this.modalCtrl.dismiss({
      product: this.product,
      file: this.selectedFile,
      previewUrl: this.previewUrl,
    });
  }

  canSubmit() {
    if (!this.hasRequiredFields()) {
      return false;
    }

    if (this.mode === 'edit') {
      return this.hasChanges();
    }

    return true;
  }

  private hasRequiredFields() {
    const name = String(this.product.name || '').trim();
    const tipo = String(this.product.tipo || '').trim();
    const price = Number(this.product.price);
    const stock = Number(this.product.stock);

    return !!name && !!tipo && !Number.isNaN(price) && !Number.isNaN(stock);
  }

  private hasChanges() {
    if (this.selectedFile) {
      return true;
    }

    const current = this.toComparable(this.product);
    const baseline = this.initialSnapshot || this.toComparable(this.initialProduct || {});
    return JSON.stringify(current) !== JSON.stringify(baseline);
  }

  private toComparable(product: any) {
    return {
      name: String(product?.name || product?.nombre || '').trim(),
      description: String(product?.description || product?.descripcion || '').trim(),
      price: Number(product?.price ?? product?.precio_venta ?? 0),
      stock: Number(product?.stock ?? 0),
      image: String(product?.image || product?.imagen || '').trim(),
      tipo: String(product?.tipo || 'fruta').trim().toLowerCase(),
      oferta: !!product?.oferta,
    };
  }
}
