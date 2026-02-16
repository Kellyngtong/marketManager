import { Component, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-start-shopping-button',
  templateUrl: './start-shopping-button.component.html',
  styleUrls: ['./start-shopping-button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class StartShoppingButtonComponent {
  @Output() clicked = new EventEmitter<void>();

  constructor(private router: Router) {}

  handleClick() {
    this.clicked.emit();
    this.router.navigate(['/home']);
  }
}
