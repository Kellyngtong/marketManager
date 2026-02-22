import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-product-modal',
  templateUrl: './edit-product-modal.component.html',
  styleUrls: ['./edit-product-modal.component.scss'],
  standalone: false,
})
export class EditProductModalComponent implements OnInit {
  @Input() product: any;

  productForm!: FormGroup;
  categories = [
    { id: 1, nombre: 'Frutas' },
    { id: 2, nombre: 'Verduras' },
    { id: 3, nombre: 'Bebidas' },
    { id: 4, nombre: 'Lácteos' },
    { id: 5, nombre: 'Carnes' },
    { id: 6, nombre: 'Panadería' },
  ];

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.productForm = this.formBuilder.group({
      nombre: [this.product?.nombre || '', Validators.required],
      precio_venta: [
        this.product?.precio_venta || '',
        [Validators.required, Validators.min(0)],
      ],
      stock: [
        this.product?.stock || 0,
        [Validators.required, Validators.min(0)],
      ],
      idcategoria: [
        this.product?.idcategoria || 1,
        Validators.required,
      ],
      descripcion: [this.product?.descripcion || ''],
      oferta: [this.product?.oferta || false],
    });
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async save() {
    if (this.productForm.invalid) {
      return;
    }

    const updatedProduct = {
      ...this.product,
      ...this.productForm.value,
    };

    return this.modalCtrl.dismiss(
      {
        updated: true,
        product: updatedProduct,
      },
      'save',
    );
  }
}
