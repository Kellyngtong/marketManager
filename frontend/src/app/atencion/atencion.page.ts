import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-atencion',
  templateUrl: './atencion.page.html',
  styleUrls: ['./atencion.page.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, RouterModule],
})
export class AtencionPage implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
