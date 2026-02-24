import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

export interface FilterOption {
  label: string;
  value: string | number | null;
}

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class FilterBarComponent {
  @Input() filterOptions: FilterOption[] = [];
  @Input() searchPlaceholder: string = 'Buscar...';
  @Input() showSearch: boolean = true;
  @Input() searchTerm: string = '';

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterChange = new EventEmitter<string | number | null>();

  selectedFilter: string | number | null = null;

  onSearchInput(event: any) {
    const value = event.detail.value || '';
    this.searchTerm = value;
    this.searchChange.emit(value);
  }

  selectFilter(value: string | number | null) {
    if (this.selectedFilter === value) {
      this.selectedFilter = null;
    } else {
      this.selectedFilter = value;
    }
    this.filterChange.emit(this.selectedFilter);
  }

  clearSearch() {
    this.searchTerm = '';
    this.searchChange.emit('');
  }
}
