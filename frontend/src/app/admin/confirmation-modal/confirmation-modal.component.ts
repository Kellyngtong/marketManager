import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-confirmation-modal',
  templateUrl: './confirmation-modal.component.html',
  styleUrls: ['./confirmation-modal.component.scss'],
  standalone: false,
})
export class ConfirmationModalComponent {
  @Input() title: string = 'Confirmación';
  @Input() message: string = '¿Estás seguro?';
  @Input() isDangerous: boolean = false;
  @Input() cancelText: string = 'Cancelar';
  @Input() confirmText: string = 'Confirmar';

  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  confirm() {
    this.modalCtrl.dismiss({ confirmed: true }, 'confirm');
  }
}
