export interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  description: string;
  recommendedAction: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChecklistCategory {
  name: string;
  description: string;
  items: ChecklistItem[];
}

export const CHECKLIST_CATEGORIES = [
  'Identity & Access',
  'Logging & Monitoring', 
  'Network',
  'Data Protection',
  'Compute & Platform',
  'Resilience & Backup',
  'Cost & Operations',
  'Compliance & Governance',
  'Automation & CI/CD',
  'DevSecOps',
  'Secrets Management',
  'Asset & Inventory',
  'Incident Response',
  'Governance',
  'Networking Security',
  'Observability',
  'Documentation'
] as const;

export const PRIORITY_LEVELS = ['High', 'Medium', 'Low'] as const;

export const OWNER_TYPES = [
  'Security/Cloud Ops',
  'Security/DevOps', 
  'DevOps',
  'SecOps',
  'SRE',
  'Cloud Network',
  'Cloud Ops',
  'Infra',
  'Data Security',
  'App/Security',
  'Data Governance',
  'Platform',
  'Platform/SecOps',
  'Backup Owner',
  'SRE/Architecture',
  'FinOps',
  'CloudOps/FinOps',
  'Cloud Governance',
  'Compliance',
  'DevSecOps',
  'DevOps/Security',
  'CloudOps',
  'SecOps/IT',
  'Cloud Architecture',
  'AppSec',
  'Ops'
] as const;
