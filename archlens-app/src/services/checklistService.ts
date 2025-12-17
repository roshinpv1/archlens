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

// Initialize default checklist items with comprehensive cloud security, compliance, NFRs, and operational excellence checklist
export async function initializeDefaultChecklist(): Promise<void> {
  await connectToDatabase();
  
  try {
    // Clear existing items
    await ChecklistItem.deleteMany({});
    console.log('Cleared existing checklist items');

    const defaultItems = [
      // ============================================
      // SECURITY & IDENTITY
      // ============================================
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
      },

      // ============================================
      // PERFORMANCE & SCALABILITY (NFRs)
      // ============================================
      {
        category: 'Performance & Scalability',
        item: 'Auto-scaling configuration',
        description: 'Dynamic resource scaling based on demand',
        recommendedAction: 'Configure horizontal auto-scaling (HPA/KEDA) with min/max replicas. Set CPU/memory thresholds. Implement predictive scaling where applicable.',
        owner: 'Platform/SRE',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Load balancing strategy',
        description: 'Distribute traffic efficiently',
        recommendedAction: 'Implement application load balancers with health checks. Use weighted routing for canary deployments. Configure session affinity if required.',
        owner: 'Platform/Network',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Caching strategy',
        description: 'Reduce latency and database load',
        recommendedAction: 'Implement multi-layer caching (CDN, application cache, database query cache). Set appropriate TTLs. Use cache invalidation strategies.',
        owner: 'Architecture/DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'CDN implementation',
        description: 'Optimize static asset delivery',
        recommendedAction: 'Use CDN for static assets (images, CSS, JS). Configure cache headers. Enable compression (gzip/brotli).',
        owner: 'DevOps/Frontend',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Database performance tuning',
        description: 'Optimize database queries and indexes',
        recommendedAction: 'Create appropriate indexes. Optimize slow queries. Use connection pooling. Implement read replicas for read-heavy workloads.',
        owner: 'Database/DBA',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Response time SLAs',
        description: 'Define and monitor performance targets',
        recommendedAction: 'Set response time targets (e.g., API <200ms p95, page load <2s). Implement monitoring and alerting. Track SLA compliance.',
        owner: 'Product/SRE',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Throughput requirements',
        description: 'Handle expected traffic volumes',
        recommendedAction: 'Define RPS/TPS requirements. Load test to validate capacity. Plan for traffic spikes (10x normal).',
        owner: 'Architecture/SRE',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Resource utilization targets',
        description: 'Optimize resource usage',
        recommendedAction: 'Set CPU/memory utilization targets (e.g., 70% average). Implement resource quotas. Monitor and alert on over/under utilization.',
        owner: 'Platform/FinOps',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Stateless design',
        description: 'Enable horizontal scaling',
        recommendedAction: 'Design stateless services. Store session state externally (Redis/DB). Avoid server-side session storage.',
        owner: 'Architecture',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Queue-based async processing',
        description: 'Handle long-running tasks asynchronously',
        recommendedAction: 'Use message queues (SQS, RabbitMQ, Kafka) for async jobs. Implement retry logic and dead-letter queues.',
        owner: 'Architecture/DevOps',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Performance & Scalability',
        item: 'Database scaling strategy',
        description: 'Plan for database growth',
        recommendedAction: 'Implement read replicas. Consider sharding for large datasets. Use connection pooling. Plan vertical/horizontal scaling.',
        owner: 'Database/Architecture',
        priority: 'High' as const,
        enabled: true
      },

      // ============================================
      // AVAILABILITY & RELIABILITY (NFRs)
      // ============================================
      {
        category: 'Availability & Reliability',
        item: 'SLA definition and monitoring',
        description: 'Define and track availability targets',
        recommendedAction: 'Set SLA targets (99.9%, 99.99%, 99.999%). Monitor uptime. Calculate actual vs target SLA. Report on SLA compliance.',
        owner: 'Product/SRE',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Availability & Reliability',
        item: 'Circuit breaker pattern',
        description: 'Prevent cascading failures',
        recommendedAction: 'Implement circuit breakers for external dependencies. Configure failure thresholds and recovery timeouts. Monitor circuit states.',
        owner: 'Architecture/DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Availability & Reliability',
        item: 'Health check implementation',
        description: 'Monitor service health',
        recommendedAction: 'Implement liveness and readiness probes. Configure health check endpoints. Set appropriate timeouts and intervals.',
        owner: 'Platform/DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Availability & Reliability',
        item: 'Graceful degradation',
        description: 'Maintain partial functionality during failures',
        recommendedAction: 'Design fallback mechanisms. Cache critical data. Implement feature flags for non-critical features. Show user-friendly error messages.',
        owner: 'Architecture/Product',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Availability & Reliability',
        item: 'Retry policies',
        description: 'Handle transient failures',
        recommendedAction: 'Implement exponential backoff retry. Set max retry attempts. Use jitter to avoid thundering herd. Log retry attempts.',
        owner: 'DevOps/Architecture',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Availability & Reliability',
        item: 'Self-healing mechanisms',
        description: 'Automatically recover from failures',
        recommendedAction: 'Implement automatic pod/container restarts. Use Kubernetes liveness probes. Auto-replace failed instances.',
        owner: 'Platform/SRE',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Availability & Reliability',
        item: 'Multi-region failover',
        description: 'Survive regional outages',
        recommendedAction: 'Design active-passive or active-active multi-region. Implement DNS failover. Test failover procedures regularly.',
        owner: 'Architecture/SRE',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Availability & Reliability',
        item: 'RTO/RPO documentation',
        description: 'Define recovery objectives',
        recommendedAction: 'Document RTO (Recovery Time Objective) and RPO (Recovery Point Objective) for each service. Design architecture to meet targets.',
        owner: 'Architecture/Business',
        priority: 'High' as const,
        enabled: true
      },

      // ============================================
      // COMPLIANCE FRAMEWORKS
      // ============================================
      {
        category: 'SOC 2 Compliance',
        item: 'Access control (CC6)',
        description: 'Logical and physical access controls',
        recommendedAction: 'Implement MFA, role-based access, access reviews, and physical security controls. Document access policies.',
        owner: 'Security/Compliance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'SOC 2 Compliance',
        item: 'System operations (CC7)',
        description: 'System operations and change management',
        recommendedAction: 'Document change management process. Implement change approvals. Monitor system operations. Maintain runbooks.',
        owner: 'DevOps/Compliance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'SOC 2 Compliance',
        item: 'Risk assessment (CC3)',
        description: 'Ongoing risk assessment process',
        recommendedAction: 'Conduct regular risk assessments. Document identified risks. Implement risk mitigation strategies. Review quarterly.',
        owner: 'Security/Risk',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'SOC 2 Compliance',
        item: 'Monitoring activities (CC7)',
        description: 'System monitoring and anomaly detection',
        recommendedAction: 'Implement comprehensive monitoring. Set up alerts for anomalies. Review logs regularly. Document monitoring procedures.',
        owner: 'SecOps/SRE',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'ISO 27001 Compliance',
        item: 'Information security policy (A.5.1)',
        description: 'Establish information security policies',
        recommendedAction: 'Create and maintain information security policy. Review annually. Communicate to all personnel.',
        owner: 'Security/Compliance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'ISO 27001 Compliance',
        item: 'Access control policy (A.9.1)',
        description: 'Control access to information',
        recommendedAction: 'Implement access control policy. Use least privilege. Regular access reviews. Document access rights.',
        owner: 'Security',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'ISO 27001 Compliance',
        item: 'Cryptography (A.10.1)',
        description: 'Cryptographic controls',
        recommendedAction: 'Use approved cryptographic algorithms. Manage encryption keys securely. Document cryptographic policies.',
        owner: 'Security/Data',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'ISO 27001 Compliance',
        item: 'Incident management (A.16.1)',
        description: 'Information security incident management',
        recommendedAction: 'Establish incident response procedures. Define roles and responsibilities. Test incident response plan. Document incidents.',
        owner: 'SecOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'PCI-DSS Compliance',
        item: 'Cardholder data protection (Req 3)',
        description: 'Protect stored cardholder data',
        recommendedAction: 'Encrypt cardholder data at rest. Use strong encryption. Limit data retention. Mask PAN when displayed.',
        owner: 'Security/Compliance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'PCI-DSS Compliance',
        item: 'Encrypt transmission (Req 4)',
        description: 'Encrypt cardholder data in transit',
        recommendedAction: 'Use TLS 1.2+ for all transmissions. Never send unencrypted PANs. Use strong cryptography.',
        owner: 'Security/Network',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'PCI-DSS Compliance',
        item: 'Vulnerability management (Req 6)',
        description: 'Develop and maintain secure systems',
        recommendedAction: 'Install security patches within 30 days. Use secure coding practices. Perform vulnerability scans. Maintain secure configurations.',
        owner: 'Security/DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'PCI-DSS Compliance',
        item: 'Access control (Req 7)',
        description: 'Restrict access to cardholder data',
        recommendedAction: 'Implement least privilege. Use role-based access. Regular access reviews. Document access rights.',
        owner: 'Security',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'HIPAA Compliance',
        item: 'Administrative safeguards (164.308)',
        description: 'Administrative security measures',
        recommendedAction: 'Appoint security officer. Conduct risk analysis. Implement access controls. Train workforce on security.',
        owner: 'Security/Compliance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'HIPAA Compliance',
        item: 'Physical safeguards (164.310)',
        description: 'Physical security controls',
        recommendedAction: 'Control facility access. Secure workstations. Control media access. Implement device controls.',
        owner: 'Security/IT',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'HIPAA Compliance',
        item: 'Technical safeguards (164.312)',
        description: 'Technical security controls',
        recommendedAction: 'Implement access controls. Audit logs. Integrity controls. Transmission security (encryption).',
        owner: 'Security/IT',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'HIPAA Compliance',
        item: 'PHI encryption (164.312)',
        description: 'Encrypt protected health information',
        recommendedAction: 'Encrypt PHI at rest and in transit. Use NIST-approved encryption. Manage encryption keys securely.',
        owner: 'Security/Data',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'GDPR Compliance',
        item: 'Data protection by design (Art 25)',
        description: 'Privacy by design and default',
        recommendedAction: 'Implement data minimization. Use pseudonymization. Limit data processing. Default privacy settings.',
        owner: 'Privacy/Architecture',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'GDPR Compliance',
        item: 'Data subject rights (Art 15-22)',
        description: 'Enable data subject rights',
        recommendedAction: 'Implement right to access, rectification, erasure, portability. Provide data export functionality. Process requests within 30 days.',
        owner: 'Privacy/Legal',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'GDPR Compliance',
        item: 'Data breach notification (Art 33)',
        description: 'Breach notification procedures',
        recommendedAction: 'Detect breaches within 72 hours. Notify supervisory authority. Notify data subjects if high risk. Document all breaches.',
        owner: 'Security/Privacy',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'GDPR Compliance',
        item: 'Data processing records (Art 30)',
        description: 'Maintain processing activity records',
        recommendedAction: 'Document all data processing activities. Record purposes, categories, recipients. Maintain up-to-date records.',
        owner: 'Privacy/Compliance',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'NIST Cybersecurity Framework',
        item: 'Identify (ID) function',
        description: 'Develop organizational understanding',
        recommendedAction: 'Inventory assets. Identify business environment. Assess risk. Establish governance.',
        owner: 'Security/Risk',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'NIST Cybersecurity Framework',
        item: 'Protect (PR) function',
        description: 'Develop safeguards',
        recommendedAction: 'Implement access control. Protect data. Maintain security policies. Train workforce.',
        owner: 'Security',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'NIST Cybersecurity Framework',
        item: 'Detect (DE) function',
        description: 'Develop detection capabilities',
        recommendedAction: 'Implement continuous monitoring. Detect anomalies. Maintain detection processes.',
        owner: 'SecOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'NIST Cybersecurity Framework',
        item: 'Respond (RS) function',
        description: 'Develop response capabilities',
        recommendedAction: 'Plan response procedures. Communicate during incidents. Analyze incidents. Mitigate impacts.',
        owner: 'SecOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'NIST Cybersecurity Framework',
        item: 'Recover (RC) function',
        description: 'Develop recovery capabilities',
        recommendedAction: 'Plan recovery procedures. Improve recovery processes. Coordinate recovery activities.',
        owner: 'SRE/Backup',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'CIS Benchmarks',
        item: 'CIS Level 1 controls',
        description: 'Essential security controls',
        recommendedAction: 'Implement CIS Level 1 benchmarks for cloud platforms. Use CIS hardened images. Regular compliance scanning.',
        owner: 'Security/Platform',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'CIS Benchmarks',
        item: 'CIS Level 2 controls',
        description: 'Defense-in-depth controls',
        recommendedAction: 'Implement CIS Level 2 benchmarks for enhanced security. Use for production environments.',
        owner: 'Security/Platform',
        priority: 'Medium' as const,
        enabled: true
      },

      // ============================================
      // OPERATIONAL EXCELLENCE
      // ============================================
      {
        category: 'Operational Excellence',
        item: 'Deployment automation',
        description: 'Automate deployment processes',
        recommendedAction: 'Implement CI/CD pipelines. Automate testing. Use infrastructure as code. Enable one-click deployments.',
        owner: 'DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Operational Excellence',
        item: 'Change management process',
        description: 'Manage changes systematically',
        recommendedAction: 'Document change process. Require approvals for production. Use change windows. Track all changes.',
        owner: 'DevOps/Change',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Operational Excellence',
        item: 'Feature flags implementation',
        description: 'Enable safe feature rollouts',
        recommendedAction: 'Use feature flags for gradual rollouts. Enable canary deployments. Quick rollback capability. A/B testing support.',
        owner: 'DevOps/Product',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Operational Excellence',
        item: 'Monitoring dashboards',
        description: 'Comprehensive observability',
        recommendedAction: 'Create dashboards for key metrics. Monitor SLIs/SLOs. Set up alerts. Review dashboards regularly.',
        owner: 'SRE/DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Operational Excellence',
        item: 'Deployment strategies',
        description: 'Safe deployment practices',
        recommendedAction: 'Use blue-green or canary deployments. Implement automated rollback. Test in staging first. Monitor during rollout.',
        owner: 'DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Operational Excellence',
        item: 'Rollback procedures',
        description: 'Quick recovery from bad deployments',
        recommendedAction: 'Automate rollback procedures. Test rollback process. Maintain deployment history. Document rollback steps.',
        owner: 'DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Operational Excellence',
        item: 'A/B testing infrastructure',
        description: 'Enable experimentation',
        recommendedAction: 'Implement A/B testing framework. Track experiment metrics. Statistical significance testing. Feature flag integration.',
        owner: 'Product/Data',
        priority: 'Low' as const,
        enabled: true
      },
      {
        category: 'Operational Excellence',
        item: 'Post-mortem process',
        description: 'Learn from incidents',
        recommendedAction: 'Conduct blameless post-mortems. Document root causes. Create action items. Share learnings.',
        owner: 'SRE/DevOps',
        priority: 'High' as const,
        enabled: true
      },

      // ============================================
      // COST MANAGEMENT
      // ============================================
      {
        category: 'Cost Management',
        item: 'Budget tracking and alerts',
        description: 'Monitor and control spending',
        recommendedAction: 'Set budget limits per project/environment. Configure budget alerts (50%, 80%, 100%). Review monthly. Forecast spending.',
        owner: 'FinOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Cost Management',
        item: 'Cost allocation and tagging',
        description: 'Attribute costs accurately',
        recommendedAction: 'Implement consistent tagging strategy (project, environment, team, cost-center). Enforce tags via policies. Regular tag audits.',
        owner: 'FinOps/CloudOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Cost Management',
        item: 'Reserved instance strategy',
        description: 'Optimize compute costs',
        recommendedAction: 'Analyze usage patterns. Purchase reserved instances for steady workloads. Use savings plans where applicable.',
        owner: 'FinOps/CloudOps',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Cost Management',
        item: 'Spot instance usage',
        description: 'Reduce compute costs for flexible workloads',
        recommendedAction: 'Use spot instances for batch jobs, dev/test. Implement spot interruption handling. Mix spot and on-demand.',
        owner: 'FinOps/Platform',
        priority: 'Low' as const,
        enabled: true
      },
      {
        category: 'Cost Management',
        item: 'Resource lifecycle management',
        description: 'Remove unused resources',
        recommendedAction: 'Identify and terminate unused resources. Schedule non-prod shutdowns. Implement resource expiration policies.',
        owner: 'FinOps/CloudOps',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Cost Management',
        item: 'Cost anomaly detection',
        description: 'Detect unexpected spending',
        recommendedAction: 'Set up cost anomaly alerts. Review daily cost changes. Investigate spikes immediately. Document cost anomalies.',
        owner: 'FinOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Cost Management',
        item: 'Cost optimization reviews',
        description: 'Regular cost optimization',
        recommendedAction: 'Monthly cost reviews. Rightsize resources. Identify waste. Implement optimization recommendations.',
        owner: 'FinOps/CloudOps',
        priority: 'Medium' as const,
        enabled: true
      },

      // ============================================
      // MAINTAINABILITY (NFRs)
      // ============================================
      {
        category: 'Maintainability',
        item: 'Code quality standards',
        description: 'Maintain high code quality',
        recommendedAction: 'Enforce code style guides. Use linters and formatters. Code reviews required. Maintain code quality metrics.',
        owner: 'Engineering',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Maintainability',
        item: 'Documentation requirements',
        description: 'Comprehensive documentation',
        recommendedAction: 'Document APIs, architecture, runbooks. Keep docs up-to-date. Use documentation as code. Regular doc reviews.',
        owner: 'Engineering/Architecture',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Maintainability',
        item: 'Testing coverage',
        description: 'Adequate test coverage',
        recommendedAction: 'Maintain >80% code coverage. Unit, integration, and E2E tests. Test in CI/CD. Regular test reviews.',
        owner: 'Engineering/QA',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Maintainability',
        item: 'Technical debt management',
        description: 'Manage technical debt',
        recommendedAction: 'Track technical debt. Allocate time for refactoring. Prioritize high-impact debt. Regular debt reviews.',
        owner: 'Engineering',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Maintainability',
        item: 'Dependency management',
        description: 'Keep dependencies updated',
        recommendedAction: 'Regular dependency updates. Security vulnerability scanning. Test updates in staging. Document breaking changes.',
        owner: 'Engineering/DevOps',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Maintainability',
        item: 'Code review process',
        description: 'Ensure code quality through reviews',
        recommendedAction: 'Require peer reviews. Use review checklists. Automated checks. Review within 24 hours.',
        owner: 'Engineering',
        priority: 'High' as const,
        enabled: true
      },

      // ============================================
      // USABILITY (NFRs)
      // ============================================
      {
        category: 'Usability',
        item: 'API versioning strategy',
        description: 'Manage API evolution',
        recommendedAction: 'Version APIs (URL or header). Maintain backward compatibility. Deprecation policy. Migration guides.',
        owner: 'API/Architecture',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Usability',
        item: 'Backward compatibility',
        description: 'Maintain compatibility with clients',
        recommendedAction: 'Avoid breaking changes. Use feature flags. Gradual migrations. Communicate changes early.',
        owner: 'API/Product',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Usability',
        item: 'Error handling and messages',
        description: 'User-friendly error handling',
        recommendedAction: 'Clear error messages. Appropriate HTTP status codes. Error codes for programmatic handling. User guidance.',
        owner: 'Engineering/Product',
        priority: 'Medium' as const,
        enabled: true
      },
      {
        category: 'Usability',
        item: 'Rate limiting and throttling',
        description: 'Protect services from abuse',
        recommendedAction: 'Implement rate limits per user/IP. Return 429 status. Provide rate limit headers. Document limits.',
        owner: 'API/Platform',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Usability',
        item: 'API documentation',
        description: 'Comprehensive API docs',
        recommendedAction: 'OpenAPI/Swagger specs. Interactive API explorer. Code examples. Keep docs current.',
        owner: 'API/Engineering',
        priority: 'High' as const,
        enabled: true
      },
      {
        category: 'Usability',
        item: 'User experience monitoring',
        description: 'Monitor user experience',
        recommendedAction: 'Track page load times. Monitor error rates. User session analytics. Performance budgets.',
        owner: 'Product/Frontend',
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
