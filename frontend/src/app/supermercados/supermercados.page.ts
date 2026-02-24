import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-supermercados',
  templateUrl: './supermercados.page.html',
  styleUrls: ['./supermercados.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class SupermercadosPage implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
