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
    // Basic validation
    if (
      !this.product.name ||
      !this.product.description ||
      this.product.price == null ||
      this.product.stock == null ||
      !this.product.tipo
    ) {
      alert('Por favor completa todos los campos obligatorios.');
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
}
