import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'kanbanboard';

  columns = [
    { title: 'To Do', status: 'ToDo' },
    { title: 'Approved by One', status: 'ApprovedByOne' },
    { title: 'Approved by Second', status: 'ApprovedBySecond' },
    { title: 'Rejected', status: 'Rejected' },
  ];

  requests = [
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
        { author: 'Alice', body: 'Initial request', date: new Date() },
      ],
      approvalLogs: ['Created by Alice'],
      attachment: { name: 'spec.pdf', url: '#' },
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
      comments: [],
      approvalLogs: ['Created by Charlie', 'Approved by Bob'],
      attachment: null,
    },
    {
      id: 103,
      title: 'Landing page',
      creator: 'Eve',
      reviewOwner: 'Frank',
      createdDate: new Date(),
      status: 'Rejected',
      totalApprovals: 2,
      currentStage: 0,
      canDrag: false,
      comments: [
        { author: 'Frank', body: 'Needs more info', date: new Date() },
      ],
      approvalLogs: ['Created by Eve', 'Rejected by Frank'],
      attachment: null,
    },
  ];

  config = { search: '' };

  onCardMoved(event: any) {
    // Handle card move event
    console.log('Card moved:', event);
  }

  onCardClicked(event: any) {
    // Handle card click event
    console.log('Card clicked:', event);
  }

  onSearchChanged(search: string) {
    // Handle search change
    this.config.search = search;
    // Optionally filter requests here
    console.log('Search changed:', search);
  }
}
