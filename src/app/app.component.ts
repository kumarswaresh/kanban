
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, moveItemInArray, transferArrayItem, DragDropModule } from '@angular/cdk/drag-drop';
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
import { CardDetailDialogComponent } from './card-detail-dialog/card-detail-dialog.component';

interface Comment {
  author: string;
  body: string;
  date: Date;
}

interface Attachment {
  name: string;
  url: string;
}

interface Request {
  id: number;
  title: string;
  creator: string;
  reviewOwner: string;
  createdDate: Date;
  status: string;
  totalApprovals: number;
  currentStage: number;
  canDrag: boolean;
  comments: Comment[];
  approvalLogs: string[];
  attachment: Attachment | null;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  tags?: string[];
  description?: string;
}

interface Column {
  title: string;
  status: string;
  color?: string;
}

@Component({
  selector: 'app-root',
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
    MatTooltipModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Kanban Board';

  columns: Column[] = [
    { title: 'To Do', status: 'ToDo', color: '#e3f2fd' },
    { title: 'Approved by One', status: 'ApprovedByOne', color: '#fff3e0' },
    { title: 'Approved by Second', status: 'ApprovedBySecond', color: '#e8f5e8' },
    { title: 'Rejected', status: 'Rejected', color: '#ffebee' },
  ];

  requests: Request[] = [
    {
      id: 101,
      title: 'Change CTA button',
      creator: 'Alice',
      reviewOwner: 'Bob',
      createdDate: new Date(),
      status: 'ToDo',
      totalApprovals: 2,
      currentStage: 1,
      canDrag: true,
      comments: [
        { author: 'Alice', body: 'Initial request for CTA button changes', date: new Date() },
      ],
      approvalLogs: ['Created by Alice'],
      attachment: { name: 'spec.pdf', url: '#' },
      priority: 'High',
      tags: ['UI', 'Frontend'],
      description: 'Update the call-to-action button design and improve user engagement'
    },
    {
      id: 102,
      title: 'Redesign dashboard',
      creator: 'Charlie',
      reviewOwner: 'Dana',
      createdDate: new Date(),
      status: 'ApprovedByOne',
      totalApprovals: 2,
      currentStage: 2,
      canDrag: true,
      comments: [
        { author: 'Dana', body: 'Looks good, proceeding to second approval', date: new Date() }
      ],
      approvalLogs: ['Created by Charlie', 'Approved by Bob'],
      attachment: null,
      priority: 'Medium',
      tags: ['Design', 'UX'],
      description: 'Complete redesign of the main dashboard interface'
    },
    {
      id: 103,
      title: 'Landing page optimization',
      creator: 'Eve',
      reviewOwner: 'Frank',
      createdDate: new Date(),
      status: 'Rejected',
      totalApprovals: 2,
      currentStage: 0,
      canDrag: false,
      comments: [
        { author: 'Frank', body: 'Needs more specific requirements and user research data', date: new Date() },
      ],
      approvalLogs: ['Created by Eve', 'Rejected by Frank'],
      attachment: null,
      priority: 'Low',
      tags: ['SEO', 'Performance'],
      description: 'Optimize landing page for better conversion rates'
    },
  ];

  config = { 
    search: '',
    showPriority: true,
    showTags: true,
    showAssignee: true,
    allowDragDrop: true
  };

  filteredRequests: Request[] = [...this.requests];

  constructor(private dialog: MatDialog) {
    this.updateFilteredRequests();
  }

  drop(event: CdkDragDrop<Request[]>) {
    if (!this.config.allowDragDrop) return;

    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const item = event.previousContainer.data[event.previousIndex];
      // Update status based on target column
      const targetColumn = this.columns.find(col => 
        this.getRequestsByStatus(col.status) === event.container.data
      );
      if (targetColumn) {
        item.status = targetColumn.status;
      }
      
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      
      // Update the main requests array
      this.updateMainRequestsArray();
    }
  }

  updateMainRequestsArray() {
    // Rebuild requests array from filtered data
    const allRequests: Request[] = [];
    this.columns.forEach(column => {
      const columnRequests = this.getRequestsByStatus(column.status);
      allRequests.push(...columnRequests);
    });
    this.requests = allRequests;
  }

  getRequestsByStatus(status: string): Request[] {
    return this.filteredRequests.filter(request => request.status === status);
  }

  onCardClicked(request: Request) {
    const dialogRef = this.dialog.open(CardDetailDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { request: { ...request } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Update the request in the array
        const index = this.requests.findIndex(r => r.id === result.id);
        if (index !== -1) {
          this.requests[index] = result;
          this.updateFilteredRequests();
        }
      }
    });
  }

  onSearchChanged(search: string) {
    this.config.search = search;
    this.updateFilteredRequests();
  }

  updateFilteredRequests() {
    if (!this.config.search.trim()) {
      this.filteredRequests = [...this.requests];
    } else {
      const searchLower = this.config.search.toLowerCase();
      this.filteredRequests = this.requests.filter(request =>
        request.title.toLowerCase().includes(searchLower) ||
        request.creator.toLowerCase().includes(searchLower) ||
        request.reviewOwner.toLowerCase().includes(searchLower) ||
        (request.tags && request.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }
  }

  getPriorityColor(priority?: string): string {
    switch (priority) {
      case 'Critical': return '#d32f2f';
      case 'High': return '#f57c00';
      case 'Medium': return '#1976d2';
      case 'Low': return '#388e3c';
      default: return '#757575';
    }
  }

  getPriorityIcon(priority?: string): string {
    switch (priority) {
      case 'Critical': return 'keyboard_double_arrow_up';
      case 'High': return 'keyboard_arrow_up';
      case 'Medium': return 'remove';
      case 'Low': return 'keyboard_arrow_down';
      default: return 'remove';
    }
  }

  getColumnConnectedLists(): string[] {
    if (!this.config.allowDragDrop) return [];
    return this.columns.map(col => col.status);
  }
}
