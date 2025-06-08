import { Component } from '@angular/core';
import { KanbanComponent } from './kanban/kanban.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [KanbanComponent],
  template: '<app-kanban></app-kanban>',
})
export class AppComponent {
  title = 'Kanban Board';
}
