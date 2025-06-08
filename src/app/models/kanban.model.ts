export interface Comment {
  author: string;
  body: string;
  date: Date;
}

export interface Attachment {
  name: string;
  url: string;
}

export interface Request {
  id: number;
  requestId: string;
  policyId: string;
  policyName: string;
  policyDescription: string;
  createdBy: string;
  createdDate: Date;
  totalRules: number;
  syncRequester: {
    name: string;
    comments: string;
  };
  syncRequestDateTime: Date;
  currentTenant: string;
  targetTenant: string;
  owner: string;
  reviewer: string;
  status: string;
  totalApprovals: number;
  currentStage: number;
  canDrag: boolean;
  comments: Comment[];
  approvalLogs: string[];
  attachment: Attachment | null;
  priority?: 'Low' | 'Medium' | 'High' | 'Critical';
  tags?: string[];
}
