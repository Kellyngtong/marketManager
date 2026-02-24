import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trabaja',
  templateUrl: './trabaja.page.html',
  styleUrls: ['./trabaja.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class TrabajaPage implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
