import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss'],
  standalone: false,
})
export class EditUserModalComponent implements OnInit {
  @Input() user: any;
  
  userForm!: FormGroup;
  roles = ['cliente', 'premium', 'empleado', 'admin'];

  constructor(
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.userForm = this.formBuilder.group({
      email: [this.user?.email || '', [Validators.required, Validators.email]],
      nombre: [this.user?.nombre || '', Validators.required],
      rol: [this.user?.rol || 'cliente', Validators.required],
    });
  }

  cancel() {
    return this.modalCtrl.dismiss(null, 'cancel');
  }

  async save() {
    if (this.userForm.invalid) {
      return;
    }

    const updatedUser = {
      ...this.user,
      ...this.userForm.value
    };

    return this.modalCtrl.dismiss({
      updated: true,
      user: updatedUser
    }, 'save');
  }
}
