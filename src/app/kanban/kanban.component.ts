import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
  DragDropModule,
} from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { KanbanDialogComponent } from '../kanban-dialog/kanban-dialog.component';
import { MOCK_POLICY_REQUESTS } from '../mock/policy-requests.mock';
import { Request, Comment } from '../models/kanban.model';

interface Attachment {
  name: string;
  url: string;
}

interface Column {
  title: string;
  status: string;
  color?: string;
}

@Component({
  selector: 'app-kanban',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatToolbarModule,
    MatBadgeModule,
    MatTooltipModule,
    MatSelectModule,
    MatOptionModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
  ],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
})
export class KanbanComponent implements OnInit {
  title = 'Kanban Board';

  columns: Column[] = [
    { title: 'To Do', status: 'ToDo', color: '#e3f2fd' },
    { title: 'Approved by One', status: 'ApprovedByOne', color: '#fff3e0' },
    {
      title: 'Approved by Second',
      status: 'ApprovedBySecond',
      color: '#e8f5e8',
    },
    { title: 'Rejected', status: 'Rejected', color: '#ffebee' },
  ];

  requests: Request[] = [];
  filteredRequests: Request[] = [];

  config = {
    search: '',
    showPriority: true,
    showTags: true,
    showAssignee: true,
    allowDragDrop: true,
    priorityFilter: [] as string[],
    sortBy: 'newest',
  };

  constructor(private dialog: MatDialog) {}

  ngOnInit() {
    this.initializeRequests();
    this.filteredRequests = [...this.requests];
  }

  private initializeRequests() {
    this.requests = MOCK_POLICY_REQUESTS.map((mock: Request) => ({
      ...mock,
      createdDate: new Date(mock.createdDate),
      syncRequestDateTime: new Date(mock.syncRequestDateTime),
      comments: mock.comments.map((comment: Comment) => ({
        ...comment,
        date: new Date(comment.date),
      })),
    }));
  }

  drop(event: CdkDragDrop<Request[]>) {
    if (!this.config.allowDragDrop) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      // Update status based on target column
      const targetColumn = this.columns.find(
        (col) => this.getRequestsByStatus(col.status) === event.container.data
      );
      if (targetColumn) {
        item.status = targetColumn.status;
      }

      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update the main requests array
      this.updateMainRequestsArray();
    }
  }

  updateMainRequestsArray() {
    // Rebuild requests array from filtered data
    const allRequests: Request[] = [];
    this.columns.forEach((column) => {
      const columnRequests = this.getRequestsByStatus(column.status);
      allRequests.push(...columnRequests);
    });
    this.requests = allRequests;
  }

  getRequestsByStatus(status: string): Request[] {
    return this.filteredRequests.filter((request) => request.status === status);
  }

  onCardClicked(
    request: Request,
    selectedTab: 'details' | 'comments' = 'details'
  ) {
    const dialogRef = this.dialog.open(KanbanDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        request: { ...request },
        selectedTab: selectedTab,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update the request in the array
        const index = this.requests.findIndex((r) => r.id === result.id);
        if (index !== -1) {
          this.requests[index] = result;
          this.filterRequests();
        }
      }
    });
  }

  onSearchChanged(value: string) {
    this.config.search = value;
    this.filterRequests();
  }

  onFilterChanged() {
    this.filterRequests();
  }

  onSortChanged() {
    this.filterRequests();
  }

  filterRequests() {
    let filtered = [...this.requests];

    // Apply search filter
    if (this.config.search) {
      const searchLower = this.config.search.toLowerCase();
      filtered = filtered.filter(
        (request) =>
          request.policyName.toLowerCase().includes(searchLower) ||
          request.createdBy.toLowerCase().includes(searchLower) ||
          (request.tags &&
            request.tags.some((tag) => tag.toLowerCase().includes(searchLower)))
      );
    }

    // Apply priority filter
    if (this.config.priorityFilter.length > 0) {
      filtered = filtered.filter(
        (request) =>
          request.priority &&
          this.config.priorityFilter.includes(request.priority)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.syncRequestDateTime).getTime();
      const dateB = new Date(b.syncRequestDateTime).getTime();
      return this.config.sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

    this.filteredRequests = filtered;
  }

  getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'Critical':
        return '#d32f2f';
      case 'High':
        return '#f57c00';
      case 'Medium':
        return '#1976d2';
      case 'Low':
        return '#388e3c';
      default:
        return '#757575';
    }
  }

  getPriorityIcon(priority?: string): string {
    switch (priority) {
      case 'Critical':
        return 'keyboard_double_arrow_up';
      case 'High':
        return 'keyboard_arrow_up';
      case 'Medium':
        return 'remove';
      case 'Low':
        return 'keyboard_arrow_down';
      default:
        return 'remove';
    }
  }

  getColumnConnectedLists(): string[] {
    if (!this.config.allowDragDrop) return [];
    return this.columns.map((col) => col.status);
  }
}
