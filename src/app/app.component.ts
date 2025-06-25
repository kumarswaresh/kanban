import { Component } from '@angular/core';
import { KanbanComponent } from './kanban/kanban.component';
import { of } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

// date-ago.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';

@Pipe({ name: 'timeAgo' })
export class DateAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';
    const then = typeof value === 'string' ? new Date(value) : value;
    if (isNaN(then.getTime())) return '';
    const diff = Date.now() - then.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
      return 'just now';
    } else if (diff < hour) {
      const m = Math.floor(diff / minute);
      return `${m} minute${m > 1 ? 's' : ''} ago`;
    } else if (diff < day) {
      const h = Math.floor(diff / hour);
      return `${h} hour${h > 1 ? 's' : ''} ago`;
    } else {
      const d = Math.floor(diff / day);
      return `${d} day${d > 1 ? 's' : ''} ago`;
    }
  }
}

interface Notification {
  id: string;
  type: 'requester' | 'approver';
  user?: string; // for requester
  policy: string;
  url: string;
  date: string;
  read: boolean;
}

export const MOCK_NOTIFICATIONS: Notification[] = [
  // 10 requester notifications
  {
    id: '1',
    type: 'requester',
    user: 'user1',
    policy: 'Alpha',
    url: '/requests/alpha',
    date: '2024-06-09',
    read: false,
  },
  {
    id: '2',
    type: 'requester',
    user: 'user2',
    policy: 'Beta',
    url: '/requests/beta',
    date: '2024-06-08',
    read: false,
  },
  {
    id: '3',
    type: 'requester',
    user: 'user3',
    policy: 'Gamma',
    url: '/requests/gamma',
    date: '2024-06-07',
    read: false,
  },
  // {
  //   id: '4',
  //   type: 'requester',
  //   user: 'user4',
  //   policy: 'Delta',
  //   url: '/requests/delta',
  //   date: '2024-06-06',
  //   read: false,
  // },
  // {
  //   id: '5',
  //   type: 'requester',
  //   user: 'user5',
  //   policy: 'Epsilon',
  //   url: '/requests/epsilon',
  //   date: '2024-06-05',
  //   read: false,
  // },
  // {
  //   id: '6',
  //   type: 'requester',
  //   user: 'user6',
  //   policy: 'Zeta',
  //   url: '/requests/zeta',
  //   date: '2024-06-04',
  //   read: false,
  // },
  // {
  //   id: '7',
  //   type: 'requester',
  //   user: 'user7',
  //   policy: 'Eta',
  //   url: '/requests/eta',
  //   date: '2024-06-03',
  //   read: false,
  // },
  // {
  //   id: '8',
  //   type: 'requester',
  //   user: 'user8',
  //   policy: 'Theta',
  //   url: '/requests/theta',
  //   date: '2024-06-02',
  //   read: false,
  // },
  // {
  //   id: '9',
  //   type: 'requester',
  //   user: 'user9',
  //   policy: 'Iota',
  //   url: '/requests/iota',
  //   date: '2024-06-01',
  //   read: false,
  // },
  // {
  //   id: '10',
  //   type: 'requester',
  //   user: 'user10',
  //   policy: 'Kappa',
  //   url: '/requests/kappa',
  //   date: '2024-05-31',
  //   read: false,
  // },

  // // 10 approver notifications
  // {
  //   id: '11',
  //   type: 'approver',
  //   policy: 'Alpha',
  //   url: '/approvals/alpha',
  //   date: '2024-06-09',
  //   read: false,
  // },
  // {
  //   id: '12',
  //   type: 'approver',
  //   policy: 'Beta',
  //   url: '/approvals/beta',
  //   date: '2024-06-08',
  //   read: false,
  // },
  // {
  //   id: '13',
  //   type: 'approver',
  //   policy: 'Gamma',
  //   url: '/approvals/gamma',
  //   date: '2024-06-07',
  //   read: false,
  // },
  // {
  //   id: '14',
  //   type: 'approver',
  //   policy: 'Delta',
  //   url: '/approvals/delta',
  //   date: '2024-06-06',
  //   read: false,
  // },
  // {
  //   id: '15',
  //   type: 'approver',
  //   policy: 'Epsilon',
  //   url: '/approvals/epsilon',
  //   date: '2024-06-05',
  //   read: false,
  // },
  // {
  //   id: '16',
  //   type: 'approver',
  //   policy: 'Zeta',
  //   url: '/approvals/zeta',
  //   date: '2024-06-04',
  //   read: false,
  // },
  // {
  //   id: '17',
  //   type: 'approver',
  //   policy: 'Eta',
  //   url: '/approvals/eta',
  //   date: '2024-06-03',
  //   read: false,
  // },
  // {
  //   id: '18',
  //   type: 'approver',
  //   policy: 'Theta',
  //   url: '/approvals/theta',
  //   date: '2024-06-02',
  //   read: false,
  // },
  // {
  //   id: '19',
  //   type: 'approver',
  //   policy: 'Iota',
  //   url: '/approvals/iota',
  //   date: '2024-06-01',
  //   read: false,
  // },
  // {
  //   id: '20',
  //   type: 'approver',
  //   policy: 'Kappa',
  //   url: '/approvals/kappa',
  //   date: '2024-05-31',
  //   read: false,
  // },
];

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    KanbanComponent,
    MatToolbarModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatTabsModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    CommonModule,
  ],
  providers: [DateAgoPipe],

  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'Kanban Board';

  notifications: Notification[] = [];
  requesterNotifications: Notification[] = [];
  approverNotifications: Notification[] = [];

  get totalUnread(): number {
    return this.notifications.length;
  }

  ngOnInit() {
    of(MOCK_NOTIFICATIONS).subscribe((arr) => {
      this.notifications = arr;
      this.requesterNotifications = arr.filter((n) => n.type === 'requester');
      this.approverNotifications = arr.filter((n) => n.type === 'approver');
    });
  }

  open(n: Notification) {
    n.read = true;
    // this.router.navigateByUrl(n.url);
  }

  markAllRead() {
    this.notifications.forEach((n) => (n.read = true));
    // this.api.markAllRead().subscribe();
  }

  goToAll() {
    // this.router.navigate(['/notifications']);
  }
}
