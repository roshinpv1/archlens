import ChecklistItem, { IChecklistItem } from '@/models/ChecklistItem';
import { ChecklistItem as ChecklistItemType } from '@/types/checklist';
import { connectToDatabase } from './analysisService';

// Get all checklist items
export async function getChecklistItems(): Promise<IChecklistItem[]> {
  await connectToDatabase();
  
  try {
    const items = await ChecklistItem.find().sort({ category: 1, priority: -1, item: 1 });
    return items;
  } catch (error) {
    console.error('Error fetching checklist items:', error);
    throw new Error('Failed to fetch checklist items');
  }
}

// Get checklist items by category
export async function getChecklistItemsByCategory(category: string): Promise<IChecklistItem[]> {
  await connectToDatabase();
  
  try {
    const items = await ChecklistItem.find({ category }).sort({ priority: -1, item: 1 });
    return items;
  } catch (error) {
    console.error('Error fetching checklist items by category:', error);
    throw new Error('Failed to fetch checklist items by category');
  }
}

// Get enabled checklist items only
export async function getEnabledChecklistItems(): Promise<IChecklistItem[]> {
  await connectToDatabase();
  
  try {
    const items = await ChecklistItem.find({ enabled: true }).sort({ category: 1, priority: -1, item: 1 });
    return items;
  } catch (error) {
    console.error('Error fetching enabled checklist items:', error);
    throw new Error('Failed to fetch enabled checklist items');
  }
}

// Create a new checklist item
export async function createChecklistItem(itemData: Omit<ChecklistItemType, 'id' | 'createdAt' | 'updatedAt'>): Promise<IChecklistItem> {
  await connectToDatabase();
  
  try {
    const newItem = new ChecklistItem(itemData);
    const savedItem = await newItem.save();
    return savedItem;
  } catch (error) {
    console.error('Error creating checklist item:', error);
    throw new Error('Failed to create checklist item');
  }
}

// Update a checklist item
export async function updateChecklistItem(id: string, updates: Partial<ChecklistItemType>): Promise<IChecklistItem | null> {
  await connectToDatabase();
  
  try {
    const updatedItem = await ChecklistItem.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    return updatedItem;
  } catch (error) {
    console.error('Error updating checklist item:', error);
    throw new Error('Failed to update checklist item');
  }
}

// Delete a checklist item
export async function deleteChecklistItem(id: string): Promise<boolean> {
  await connectToDatabase();
  
  try {
    const result = await ChecklistItem.findByIdAndDelete(id);
    return !!result;
  } catch (error) {
    console.error('Error deleting checklist item:', error);
    throw new Error('Failed to delete checklist item');
  }
}

// Toggle enabled status
export async function toggleChecklistItem(id: string): Promise<IChecklistItem | null> {
  await connectToDatabase();
  
  try {
    const item = await ChecklistItem.findById(id);
    if (!item) return null;
    
    item.enabled = !item.enabled;
    item.updatedAt = new Date();
    const updatedItem = await item.save();
    return updatedItem;
  } catch (error) {
    console.error('Error toggling checklist item:', error);
    throw new Error('Failed to toggle checklist item');
  }
}

// Get checklist statistics
export async function getChecklistStats() {
  await connectToDatabase();
  
  try {
    const [
      totalItems,
      enabledItems,
      categoryStats,
      priorityStats
    ] = await Promise.all([
      ChecklistItem.countDocuments(),
      ChecklistItem.countDocuments({ enabled: true }),
      ChecklistItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, enabled: { $sum: { $cond: ['$enabled', 1, 0] } } } },
        { $sort: { _id: 1 } }
      ]),
      ChecklistItem.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 }, enabled: { $sum: { $cond: ['$enabled', 1, 0] } } } },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      totalItems,
      enabledItems,
      disabledItems: totalItems - enabledItems,
      categoryStats,
      priorityStats,
      timestamp: new Date()
    };
  } catch (error) {
    console.error('Error fetching checklist stats:', error);
    throw new Error('Failed to fetch checklist statistics');
  }
}

// Initialize default checklist items with comprehensive cloud security checklist
export async function initializeDefaultChecklist(): Promise<void> {
  await connectToDatabase();
  
  try {
    // Clear existing items
    await ChecklistItem.deleteMany({});
    console.log('Cleared existing checklist items');

    const defaultItems = [
      {
        category: 'Identity & Access',
        item: 'Strong authentication',
        description: 'Protect consoles & management planes',
        recommendedAction: 'Enforce MFA for all accounts, require FIDO2/2FA for admins. Remove unused root/owner keys.',
        owner: 'Security/Cloud Ops',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Identity & Access',
        item: 'Least privilege IAM',
        description: 'Prevent over-permissive roles',
        recommendedAction: 'Audit IAM roles/policies; convert broad roles to scoped roles; use permission boundaries and just-in-time elevation.',
        owner: 'Security/DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Identity & Access',
        item: 'Service identities',
        description: 'Manage non-human access',
        recommendedAction: 'Use managed identities / service principals; avoid long-lived secrets; rotate keys.',
        owner: 'DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Logging & Monitoring',
        item: 'Audit logs',
        description: 'Capture control plane and data access events',
        recommendedAction: 'Enable provider audit logs (CloudTrail / Azure Activity Log / Cloud Audit Logs) across accounts/projects and ship to centralized store.',
        owner: 'SecOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Logging & Monitoring',
        item: 'Aggregation & retention',
        description: 'Centralized observability',
        recommendedAction: 'Forward logs to central SIEM or logging account; define retention & index lifecycle.',
        owner: 'SecOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Logging & Monitoring',
        item: 'Monitoring & alerting',
        description: 'Detect anomalies & outages',
        recommendedAction: 'Implement metrics + alerts (latency, error rates, cost spikes, auth failures). Integrate with pager/on-call.',
        owner: 'SRE',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Network',
        item: 'Network segmentation',
        description: 'Limit blast radius',
        recommendedAction: 'Implement VPC/VNet per environment; use subnets, NSGs, security groups, private endpoints and service endpoints.',
        owner: 'Cloud Network',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Network',
        item: 'Public exposure check',
        description: 'Find internet-exposed services',
        recommendedAction: 'Run periodic scans for public IPs, open ports, and publicly readable storage buckets.',
        owner: 'Cloud Ops',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Network',
        item: 'Bastion & jump hosts',
        description: 'Secure admin access',
        recommendedAction: 'Force admin access through bastion + conditional access (MFA + limited IPs) or VPN.',
        owner: 'Infra',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Data Protection',
        item: 'Encryption at rest',
        description: 'Store sensitive data encrypted',
        recommendedAction: 'Enforce provider-managed or customer-managed KMS encryption for storage, DBs, buckets. Audit key policies.',
        owner: 'Data Security',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Data Protection',
        item: 'Encryption in transit',
        description: 'Secure network traffic',
        recommendedAction: 'Enforce TLS for applications and internal service-to-service communication. Use mTLS where feasible.',
        owner: 'App/Security',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Data Protection',
        item: 'Data classification',
        description: 'Identify sensitive data',
        recommendedAction: 'Tag/classify data (PII, PHI, confidential). Apply additional controls on classified data.',
        owner: 'Data Governance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Compute & Platform',
        item: 'Image & patch management',
        description: 'Harden compute images',
        recommendedAction: 'Use golden images; automated patching schedule; baseline hardening (CIS).',
        owner: 'Platform',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Compute & Platform',
        item: 'Instance metadata & IMDS',
        description: 'Protect metadata service',
        recommendedAction: 'Enforce IMDSv2 or equivalent; block IMDS access from containers where not needed.',
        owner: 'Platform/SecOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Resilience & Backup',
        item: 'Backups & restore',
        description: 'Ensure recoverability',
        recommendedAction: 'Implement regular backups, test restores (both orchestration & data). Store backups in separate account/region.',
        owner: 'Backup Owner',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Resilience & Backup',
        item: 'Multi-AZ / Multi-region design',
        description: 'Reduce outage risk',
        recommendedAction: 'Design critical services across AZs/regions; document failover runbooks and RTO/RPO.',
        owner: 'SRE/Architecture',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Cost & Operations',
        item: 'Billing visibility',
        description: 'Track and attribute spend',
        recommendedAction: 'Tagging policy + cost center tags; enable budgets & alerts; centralize billing view.',
        owner: 'FinOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Cost & Operations',
        item: 'Rightsizing & autoscaling',
        description: 'Avoid waste',
        recommendedAction: 'Schedule non-prod shutdowns; implement rightsizing recommendations and autoscaling policies.',
        owner: 'CloudOps/FinOps',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Compliance & Governance',
        item: 'Policy & guardrails',
        description: 'Prevent risky deployments',
        recommendedAction: 'Deploy policies (Service Control Policies, Azure Policy, Organization Policy) to enforce tagging, encryption, allowed regions/services.',
        owner: 'Cloud Governance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Compliance & Governance',
        item: 'Regulatory mapping',
        description: 'Map controls to regs',
        recommendedAction: 'Map cloud controls to GDPR/PCI/HIPAA/etc.; maintain evidence & audit artifacts.',
        owner: 'Compliance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Automation & CI/CD',
        item: 'Secure CI/CD pipelines',
        description: 'Protect build & deploy artifacts',
        recommendedAction: 'Use least-privilege CI service accounts, sign artifacts, scan images for vulnerabilities, and store secrets in vaults.',
        owner: 'DevSecOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'DevSecOps',
        item: 'Image & code scanning',
        description: 'Find vulnerabilities early',
        recommendedAction: 'Add SCA/SAST and container image scanning to pipeline; block promos on high/severe findings.',
        owner: 'DevSecOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Secrets Management',
        item: 'Centralized vault',
        description: 'Avoid secrets in code',
        recommendedAction: 'Use KMS/Secrets Manager/Key Vault; rotate secrets and audit access.',
        owner: 'DevOps/Security',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Asset & Inventory',
        item: 'Resource inventory',
        description: 'Know what you run',
        recommendedAction: 'Maintain CMDB or cloud inventory per account/project; schedule drift detection.',
        owner: 'CloudOps',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Incident Response',
        item: 'IR playbooks',
        description: 'Prepare for breaches/outages',
        recommendedAction: 'Have cloud-specific IR runbooks, escalation paths, and pre-authorized scripts. Run tabletop exercises annually.',
        owner: 'SecOps/IT',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Governance',
        item: 'Account structure & landing zones',
        description: 'Standardize deployments',
        recommendedAction: 'Implement landing zones / org structure, baseline controls, and bootstrapping templates.',
        owner: 'Cloud Architecture',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Networking Security',
        item: 'WAF & DDoS',
        description: 'Protect internet apps',
        recommendedAction: 'Enable WAF, rate-limiting, and DDoS protection (Shield/Front Door/Cloud Armor).',
        owner: 'AppSec',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Observability',
        item: 'Cost & security tagging',
        description: 'Enforce tags for ops',
        recommendedAction: 'Require tags: environment, owner, cost_center, compliance_class; deny untagged resources via policies.',
        owner: 'Cloud Governance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Documentation',
        item: 'Runbooks & run-lists',
        description: 'Knowledge & continuity',
        recommendedAction: 'Maintain runbooks for deployment, failover, and common ops tasks in a central wiki.',
        owner: 'Ops',
        priority: 'Medium' as const,
        enabled: true
      }
    ];

    await ChecklistItem.insertMany(defaultItems);
    console.log(`Initialized ${defaultItems.length} comprehensive checklist items`);
  } catch (error) {
    console.error('Error initializing default checklist:', error);
    throw new Error('Failed to initialize default checklist');
  }
}
