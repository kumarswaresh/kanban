import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { KanbanColumnComponent } from './kanban-column.component';
import { SearchBarComponent } from './search-bar.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    MatCardModule,
    MatDialogModule,
    MatTabsModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatInputModule,
    FormsModule,
    KanbanColumnComponent,
    SearchBarComponent,
    MatToolbarModule,
    MatChipsModule,
  ],
  templateUrl: './kanban-board.component.html',
  styleUrls: ['./kanban-board.component.scss'],
})
export class KanbanBoardComponent {
  @Input() columns: any[] = [];
  @Input() requests: any[] = [];
  @Input() config: any;
  @Output() cardMoved = new EventEmitter<any>();
  @Output() cardClicked = new EventEmitter<any>();
  @Output() searchChanged = new EventEmitter<string>();

  getRequestsForColumn(status: string) {
    return this.requests?.filter((r) => r.status === status) || [];
  }
}
