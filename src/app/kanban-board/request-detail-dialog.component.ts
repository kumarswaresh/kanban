import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'request-detail-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatTabsModule],
  templateUrl: './request-detail-dialog.component.html',
  styleUrls: ['./request-detail-dialog.component.scss'],
})
export class RequestDetailDialogComponent {
  @Input() request: any;
}
