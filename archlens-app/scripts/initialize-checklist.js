const mongoose = require('mongoose');

// Define the checklist item schema (matching your existing model)
const checklistItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  item: { type: String, required: true },
  description: { type: String, required: true },
  recommendedAction: { type: String, required: true },
  owner: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], required: true },
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ChecklistItem = mongoose.model('ChecklistItem', checklistItemSchema);

// Default checklist items data
const defaultChecklistItems = [
  {
    category: "Identity & Access",
    item: "Strong authentication",
    description: "Protect consoles & management planes",
    recommendedAction: "Enforce MFA for all accounts, require FIDO2/2FA for admins. Remove unused root/owner keys.",
    owner: "Security/Cloud Ops",
    priority: "High"
  },
  {
    category: "Identity & Access",
    item: "Least privilege IAM",
    description: "Prevent over-permissive roles",
    recommendedAction: "Audit IAM roles/policies; convert broad roles to scoped roles; use permission boundaries and just-in-time elevation.",
    owner: "Security/DevOps",
    priority: "High"
  },
  {
    category: "Identity & Access",
    item: "Service identities",
    description: "Manage non-human access",
    recommendedAction: "Use managed identities / service principals; avoid long-lived secrets; rotate keys.",
    owner: "DevOps",
    priority: "High"
  },
  {
    category: "Logging & Monitoring",
    item: "Audit logs",
    description: "Capture control plane and data access events",
    recommendedAction: "Enable provider audit logs (CloudTrail / Azure Activity Log / Cloud Audit Logs) across accounts/projects and ship to centralized store.",
    owner: "SecOps",
    priority: "High"
  },
  {
    category: "Logging & Monitoring",
    item: "Aggregation & retention",
    description: "Centralized observability",
    recommendedAction: "Forward logs to central SIEM or logging account; define retention & index lifecycle.",
    owner: "SecOps",
    priority: "High"
  },
  {
    category: "Logging & Monitoring",
    item: "Monitoring & alerting",
    description: "Detect anomalies & outages",
    recommendedAction: "Implement metrics + alerts (latency, error rates, cost spikes, auth failures). Integrate with pager/on-call.",
    owner: "SRE",
    priority: "High"
  },
  {
    category: "Network",
    item: "Network segmentation",
    description: "Limit blast radius",
    recommendedAction: "Implement VPC/VNet per environment; use subnets, NSGs, security groups, private endpoints and service endpoints.",
    owner: "Cloud Network",
    priority: "High"
  },
  {
    category: "Network",
    item: "Public exposure check",
    description: "Find internet-exposed services",
    recommendedAction: "Run periodic scans for public IPs, open ports, and publicly readable storage buckets.",
    owner: "Cloud Ops",
    priority: "High"
  },
  {
    category: "Network",
    item: "Bastion & jump hosts",
    description: "Secure admin access",
    recommendedAction: "Force admin access through bastion + conditional access (MFA + limited IPs) or VPN.",
    owner: "Infra",
    priority: "Medium"
  },
  {
    category: "Data Protection",
    item: "Encryption at rest",
    description: "Store sensitive data encrypted",
    recommendedAction: "Enforce provider-managed or customer-managed KMS encryption for storage, DBs, buckets. Audit key policies.",
    owner: "Data Security",
    priority: "High"
  },
  {
    category: "Data Protection",
    item: "Encryption in transit",
    description: "Secure network traffic",
    recommendedAction: "Enforce TLS for applications and internal service-to-service communication. Use mTLS where feasible.",
    owner: "App/Security",
    priority: "High"
  },
  {
    category: "Data Protection",
    item: "Data classification",
    description: "Identify sensitive data",
    recommendedAction: "Tag/classify data (PII, PHI, confidential). Apply additional controls on classified data.",
    owner: "Data Governance",
    priority: "High"
  },
  {
    category: "Compute & Platform",
    item: "Image & patch management",
    description: "Harden compute images",
    recommendedAction: "Use golden images; automated patching schedule; baseline hardening (CIS).",
    owner: "Platform",
    priority: "High"
  },
  {
    category: "Compute & Platform",
    item: "Instance metadata & IMDS",
    description: "Protect metadata service",
    recommendedAction: "Enforce IMDSv2 or equivalent; block IMDS access from containers where not needed.",
    owner: "Platform/SecOps",
    priority: "High"
  },
  {
    category: "Resilience & Backup",
    item: "Backups & restore",
    description: "Ensure recoverability",
    recommendedAction: "Implement regular backups, test restores (both orchestration & data). Store backups in separate account/region.",
    owner: "Backup Owner",
    priority: "High"
  },
  {
    category: "Resilience & Backup",
    item: "Multi-AZ / Multi-region design",
    description: "Reduce outage risk",
    recommendedAction: "Design critical services across AZs/regions; document failover runbooks and RTO/RPO.",
    owner: "SRE/Architecture",
    priority: "High"
  },
  {
    category: "Cost & Operations",
    item: "Billing visibility",
    description: "Track and attribute spend",
    recommendedAction: "Tagging policy + cost center tags; enable budgets & alerts; centralize billing view.",
    owner: "FinOps",
    priority: "High"
  },
  {
    category: "Cost & Operations",
    item: "Rightsizing & autoscaling",
    description: "Avoid waste",
    recommendedAction: "Schedule non-prod shutdowns; implement rightsizing recommendations and autoscaling policies.",
    owner: "CloudOps/FinOps",
    priority: "Medium"
  },
  {
    category: "Compliance & Governance",
    item: "Policy & guardrails",
    description: "Prevent risky deployments",
    recommendedAction: "Deploy policies (Service Control Policies, Azure Policy, Organization Policy) to enforce tagging, encryption, allowed regions/services.",
    owner: "Cloud Governance",
    priority: "High"
  },
  {
    category: "Compliance & Governance",
    item: "Regulatory mapping",
    description: "Map controls to regs",
    recommendedAction: "Map cloud controls to GDPR/PCI/HIPAA/etc.; maintain evidence & audit artifacts.",
    owner: "Compliance",
    priority: "High"
  },
  {
    category: "Automation & CI/CD",
    item: "Secure CI/CD pipelines",
    description: "Protect build & deploy artifacts",
    recommendedAction: "Use least-privilege CI service accounts, sign artifacts, scan images for vulnerabilities, and store secrets in vaults.",
    owner: "DevSecOps",
    priority: "High"
  },
  {
    category: "DevSecOps",
    item: "Image & code scanning",
    description: "Find vulnerabilities early",
    recommendedAction: "Add SCA/SAST and container image scanning to pipeline; block promos on high/severe findings.",
    owner: "DevSecOps",
    priority: "High"
  },
  {
    category: "Secrets Management",
    item: "Centralized vault",
    description: "Avoid secrets in code",
    recommendedAction: "Use KMS/Secrets Manager/Key Vault; rotate secrets and audit access.",
    owner: "DevOps/Security",
    priority: "High"
  },
  {
    category: "Asset & Inventory",
    item: "Resource inventory",
    description: "Know what you run",
    recommendedAction: "Maintain CMDB or cloud inventory per account/project; schedule drift detection.",
    owner: "CloudOps",
    priority: "Medium"
  },
  {
    category: "Incident Response",
    item: "IR playbooks",
    description: "Prepare for breaches/outages",
    recommendedAction: "Have cloud-specific IR runbooks, escalation paths, and pre-authorized scripts. Run tabletop exercises annually.",
    owner: "SecOps/IT",
    priority: "High"
  },
  {
    category: "Governance",
    item: "Account structure & landing zones",
    description: "Standardize deployments",
    recommendedAction: "Implement landing zones / org structure, baseline controls, and bootstrapping templates.",
    owner: "Cloud Architecture",
    priority: "High"
  },
  {
    category: "Networking Security",
    item: "WAF & DDoS",
    description: "Protect internet apps",
    recommendedAction: "Enable WAF, rate-limiting, and DDoS protection (Shield/Front Door/Cloud Armor).",
    owner: "AppSec",
    priority: "Medium"
  },
  {
    category: "Observability",
    item: "Cost & security tagging",
    description: "Enforce tags for ops",
    recommendedAction: "Require tags: environment, owner, cost_center, compliance_class; deny untagged resources via policies.",
    owner: "Cloud Governance",
    priority: "High"
  },
  {
    category: "Documentation",
    item: "Runbooks & run-lists",
    description: "Knowledge & continuity",
    recommendedAction: "Maintain runbooks for deployment, failover, and common ops tasks in a central wiki.",
    owner: "Ops",
    priority: "Medium"
  }
];

async function initializeChecklist() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cloudarch';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing checklist items
    await ChecklistItem.deleteMany({});
    console.log('Cleared existing checklist items');

    // Insert default checklist items
    const insertedItems = await ChecklistItem.insertMany(defaultChecklistItems);
    console.log(`Successfully inserted ${insertedItems.length} checklist items`);

    // Display summary by category
    const categorySummary = {};
    insertedItems.forEach(item => {
      if (!categorySummary[item.category]) {
        categorySummary[item.category] = { total: 0, high: 0, medium: 0, low: 0 };
      }
      categorySummary[item.category].total++;
      categorySummary[item.category][item.priority.toLowerCase()]++;
    });

    console.log('\n📋 Checklist Summary by Category:');
    Object.entries(categorySummary).forEach(([category, counts]) => {
      console.log(`${category}: ${counts.total} items (High: ${counts.high}, Medium: ${counts.medium}, Low: ${counts.low})`);
    });

    console.log('\n✅ Checklist initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing checklist:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the initialization
initializeChecklist();
