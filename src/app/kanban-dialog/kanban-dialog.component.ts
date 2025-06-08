import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import {
  MatChipsModule,
  MatChipGrid,
  MatChipListbox,
} from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { Comment, Attachment, Request } from '../models/kanban.model';

@Component({
  selector: 'app-kanban-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatChipsModule,
    MatCardModule,
    MatDividerModule,
    MatTabsModule,
    MatListModule,
    MatBadgeModule,
  ],
  templateUrl: './kanban-dialog.component.html',
  styleUrl: './kanban-dialog.component.scss',
})
export class KanbanDialogComponent implements OnInit {
  @ViewChild('chipList') chipList!: MatChipGrid;
  request: Request;
  newComment: string = '';
  isEditing: boolean = false;

  statusOptions = [
    { value: 'ToDo', label: 'To Do' },
    { value: 'ApprovedByOne', label: 'Approved by One' },
    { value: 'ApprovedBySecond', label: 'Approved by Second' },
    { value: 'Rejected', label: 'Rejected' },
  ];

  priorityOptions = [
    { value: 'Low', label: 'Low', color: '#388e3c' },
    { value: 'Medium', label: 'Medium', color: '#1976d2' },
    { value: 'High', label: 'High', color: '#f57c00' },
    { value: 'Critical', label: 'Critical', color: '#d32f2f' },
  ];

  constructor(
    public dialogRef: MatDialogRef<KanbanDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { request: Request }
  ) {
    this.request = { ...data.request };
  }

  ngOnInit() {
    if (!this.request.tags) {
      this.request.tags = [];
    }
  }

  onSave() {
    this.dialogRef.close(this.request);
  }

  onCancel() {
    this.dialogRef.close();
  }

  addComment() {
    if (this.newComment.trim()) {
      this.request.comments.push({
        author: 'Current User', // In a real app, this would be the logged-in user
        body: this.newComment.trim(),
        date: new Date(),
      });
      this.newComment = '';
    }
  }

  deleteComment(index: number) {
    this.request.comments.splice(index, 1);
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  getPriorityColor(priority?: string): string {
    const priorityOption = this.priorityOptions.find(
      (p) => p.value === priority
    );
    return priorityOption?.color || '#757575';
  }

  addTag(event: any) {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      if (!this.request.tags) {
        this.request.tags = [];
      }
      this.request.tags.push(value.trim());
    }

    if (input) {
      input.value = '';
    }
  }

  removeTag(tag: string) {
    if (this.request.tags) {
      const index = this.request.tags.indexOf(tag);
      if (index >= 0) {
        this.request.tags.splice(index, 1);
      }
    }
  }

  approveRequest() {
    if (this.request.currentStage < this.request.totalApprovals) {
      this.request.currentStage++;
      this.request.approvalLogs.push(
        `Approved by Current User at stage ${this.request.currentStage}`
      );

      if (this.request.currentStage === 1) {
        this.request.status = 'ApprovedByOne';
      } else if (this.request.currentStage === this.request.totalApprovals) {
        this.request.status = 'ApprovedBySecond';
      }
    }
  }

  rejectRequest() {
    this.request.status = 'Rejected';
    this.request.currentStage = 0;
    this.request.canDrag = false;
    this.request.approvalLogs.push(`Rejected by Current User`);
  }

  reopenRequest() {
    this.request.status = 'ToDo';
    this.request.currentStage = 1;
    this.request.canDrag = true;
    this.request.approvalLogs.push(`Reopened by Current User`);
  }
}
