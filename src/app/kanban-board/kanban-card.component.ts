import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'kanban-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatChipsModule,
  ],
  templateUrl: './kanban-card.component.html',
  styleUrls: ['./kanban-card.component.scss'],
})
export class KanbanCardComponent {
  @Input() card: any;
  @Input() canDrag: boolean = true;
  @Output() viewDetail = new EventEmitter<void>();
  @Output() viewDiff = new EventEmitter<void>();
  @Output() viewComment = new EventEmitter<void>();
  @Output() viewAttachment = new EventEmitter<void>();
}
