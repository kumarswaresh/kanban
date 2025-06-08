import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { KanbanCardComponent } from './kanban-card.component';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'kanban-column',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    KanbanCardComponent,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
  ],
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.scss'],
})
export class KanbanColumnComponent {
  @Input() column: any;
  @Input() cards: any[] = [];
  @Output() cardDropped = new EventEmitter<any>();
}
