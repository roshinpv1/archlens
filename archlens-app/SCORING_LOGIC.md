# ArchLens Scoring Logic - Detailed Explanation

## Overview

ArchLens uses **LLM-based intelligent scoring** to evaluate architecture quality across four key dimensions:
1. **Security Score** (0-100)
2. **Resiliency Score** (0-100)
3. **Cost Efficiency Score** (0-100)
4. **Compliance Score** (0-100)

The scoring is performed by an LLM (Large Language Model) that analyzes the architecture against:
- **Checklist items** (active evaluation criteria)
- **Cloud provider best practices**
- **Industry standards and frameworks**
- **Identified risks, gaps, and issues**

---

## Scoring Process Flow

### Stage 1: Component Extraction
1. **Input**: Architecture diagram (image) or IAC file
2. **Process**: LLM extracts components, connections, and metadata
3. **Output**: Structured JSON with components, connections, cloud providers, architecture patterns

### Stage 2: Comprehensive Analysis & Scoring
1. **Input**: Extracted components + Active checklist items
2. **Process**: LLM performs deep analysis and generates scores
3. **Output**: Scores, risks, compliance gaps, cost issues, recommendations

---

## How Scores Are Calculated

### 1. Security Score (0-100)

**Evaluation Criteria:**
- **Checklist-based**: Counts how many security checklist items are implemented
- **Cloud Provider Best Practices**: 
  - **AWS**: IAM policies, S3 bucket policies, VPC security groups, NACLs, WAF rules, KMS encryption
  - **Azure**: Azure AD RBAC, NSG rules, Key Vault, Security Center, Sentinel, DDoS Protection
  - **GCP**: Cloud IAM, VPC firewall rules, Secret Manager, Security Command Center, Cloud Armor
  - **Kubernetes**: RBAC, Network Policies, Pod Security Policies, Admission Controllers, Secrets management
- **Risk Assessment**: Severity and count of security risks identified
- **Compliance**: Security-related compliance gaps (encryption, access control, logging)

**Scoring Logic:**
```
Security Score = Base Score - Penalties + Bonuses

Base Score Calculation:
- Count fully implemented security checklist items
- Each implemented item = +X points (weighted by priority)
- High priority items weighted more heavily

Penalties:
- Each high-severity security risk: -10 to -20 points
- Each medium-severity security risk: -5 to -10 points
- Each low-severity security risk: -1 to -5 points
- Missing critical security controls: -15 to -25 points
- Security compliance gaps: -5 to -15 points per gap

Bonuses:
- Multi-layer security (defense in depth): +5 to +10 points
- Encryption at rest AND in transit: +5 points
- Comprehensive logging and monitoring: +5 points
- Zero-trust architecture: +10 points
```

**Example Calculation:**
- 15 security checklist items total
- 12 items fully implemented (80% compliance)
- Base score: 80 points
- 2 high-severity risks: -30 points
- 1 medium-severity risk: -7 points
- Encryption at rest + in transit: +5 points
- **Final Security Score: 48** (clamped to 0-100)

---

### 2. Resiliency Score (0-100)

**Evaluation Criteria:**
- **High Availability**: Multi-AZ, redundancy, failover mechanisms
- **Disaster Recovery**: Backup strategies, recovery time objectives (RTO), recovery point objectives (RPO)
- **Fault Tolerance**: Health checks, auto-scaling, load balancing
- **Cloud Provider Features**:
  - **AWS**: Multi-AZ deployments, Auto Scaling, ELB health checks, RDS backups
  - **Azure**: Availability Sets, Load Balancer, SQL Database geo-replication, Backup Vault
  - **GCP**: Managed Instance Groups, Load Balancing, Cloud SQL replicas, Persistent Disk snapshots
  - **Kubernetes**: Pod disruption budgets, Health checks, Rolling updates, StatefulSets

**Scoring Logic:**
```
Resiliency Score = Availability Score + Recovery Score + Fault Tolerance Score

Availability Score (0-40):
- Single point of failure: 0-10 points
- Basic redundancy (2+ instances): 20-30 points
- Multi-AZ/Region redundancy: 30-40 points

Recovery Score (0-30):
- No backup strategy: 0-5 points
- Manual backups: 10-15 points
- Automated backups: 20-25 points
- Automated backups + DR plan: 25-30 points

Fault Tolerance Score (0-30):
- No health checks: 0-5 points
- Basic health checks: 10-15 points
- Health checks + auto-scaling: 20-25 points
- Health checks + auto-scaling + load balancing: 25-30 points

Penalties:
- Single point of failure: -20 points
- No backup strategy: -15 points
- No health monitoring: -10 points
```

**Example Calculation:**
- Multi-AZ deployment: +35 points
- Automated backups: +25 points
- Health checks + auto-scaling: +25 points
- **Base Score: 85**
- No disaster recovery plan: -10 points
- **Final Resiliency Score: 75**

---

### 3. Cost Efficiency Score (0-100)

**Evaluation Criteria:**
- **Resource Optimization**: Right-sizing, reserved instances, spot/preemptible instances
- **Storage Optimization**: Appropriate storage tiers, lifecycle policies
- **Network Optimization**: Data transfer costs, CDN usage
- **Cost Issues Identified**: Overprovisioning, unused resources, inefficient services
- **Cloud Provider Features**:
  - **AWS**: Reserved Instances, Spot Instances, S3 storage classes, CloudWatch costs
  - **Azure**: Reserved Instances, Spot VMs, Storage tiers, Cost Management, Advisor recommendations
  - **GCP**: Committed Use Discounts, Preemptible VMs, Storage classes, Cost Management, Recommender

**Scoring Logic:**
```
Cost Efficiency Score = Optimization Score - Waste Penalty

Optimization Score (0-70):
- Right-sized resources: +20 points
- Reserved/Committed instances: +15 points
- Appropriate storage tiers: +10 points
- CDN usage: +10 points
- Auto-scaling (cost-aware): +15 points

Waste Penalty (0-30):
- Overprovisioned resources: -5 to -15 points
- Unused resources: -5 to -10 points
- Inefficient service choices: -5 to -10 points
- No cost monitoring: -5 points

Estimated Savings Impact:
- High savings potential (>$10k/month): -20 points
- Medium savings potential ($1k-$10k/month): -10 points
- Low savings potential (<$1k/month): -5 points
```

**Example Calculation:**
- Right-sized resources: +20 points
- Reserved instances: +15 points
- Appropriate storage: +10 points
- Auto-scaling: +15 points
- **Base Score: 60**
- Overprovisioned compute: -12 points
- Unused storage: -8 points
- **Final Cost Efficiency Score: 40**

---

### 4. Compliance Score (0-100)

**Evaluation Criteria:**
- **Framework Compliance**: SOC2, ISO27001, PCI-DSS, HIPAA, GDPR, CIS
- **Compliance Gaps**: Missing requirements, incomplete implementations
- **Cloud Provider Compliance Tools**:
  - **AWS**: AWS Config, CloudTrail, GuardDuty, Security Hub, Well-Architected Framework
  - **Azure**: Azure Policy, Blueprint, Compliance Manager, Security Center recommendations
  - **GCP**: Cloud Asset Inventory, Security Command Center, Cloud Audit Logs, Policy Intelligence

**Scoring Logic:**
```
Compliance Score = Framework Compliance Score

Framework Compliance (per framework):
- Count compliance requirements for applicable frameworks
- Each fully implemented requirement: +X points
- Each partially implemented requirement: +X/2 points
- Each missing requirement: 0 points

Score Calculation:
- Identify applicable frameworks (based on environment, data type, industry)
- For each framework:
  - Total requirements: N
  - Implemented: I
  - Partial: P
  - Missing: M
  - Framework Score = (I * 1.0 + P * 0.5) / N * 100

Overall Compliance Score:
- Average of all applicable framework scores
- Weighted by framework importance/criticality

Penalties:
- Critical compliance gap: -15 to -25 points
- High-severity gap: -10 to -15 points
- Medium-severity gap: -5 to -10 points
- Low-severity gap: -1 to -5 points
```

**Example Calculation:**
- Applicable frameworks: SOC2, ISO27001
- **SOC2**: 20 requirements, 15 implemented, 3 partial, 2 missing
  - SOC2 Score: (15 * 1.0 + 3 * 0.5) / 20 * 100 = 82.5
- **ISO27001**: 25 requirements, 18 implemented, 4 partial, 3 missing
  - ISO27001 Score: (18 * 1.0 + 4 * 0.5) / 25 * 100 = 80.0
- **Average**: (82.5 + 80.0) / 2 = 81.25
- 1 critical gap (data encryption): -20 points
- **Final Compliance Score: 61**

---

## Score Calculation Details

### Checklist-Based Scoring

The LLM evaluates the architecture against **active checklist items**:

1. **Count Implementation Status**:
   - Fully implemented: Counts as 1.0
   - Partially implemented: Counts as 0.5
   - Not implemented: Counts as 0.0

2. **Weight by Priority**:
   - High priority items: 2x weight
   - Medium priority items: 1x weight
   - Low priority items: 0.5x weight

3. **Calculate Base Score**:
   ```
   Base Score = (Sum of weighted implemented items / Sum of all weighted items) * 100
   ```

4. **Apply Adjustments**:
   - Subtract penalties for risks, gaps, issues
   - Add bonuses for best practices
   - Clamp to 0-100 range

### Cloud Provider-Specific Scoring

The LLM considers **provider-specific best practices**:

**AWS Scoring Factors:**
- IAM policies and least privilege
- VPC security groups and NACLs
- S3 bucket policies and encryption
- CloudTrail logging and monitoring
- AWS Config compliance rules
- Well-Architected Framework alignment

**Azure Scoring Factors:**
- Azure AD RBAC and identity management
- NSG rules and network security
- Key Vault for secrets management
- Security Center recommendations
- Azure Policy compliance
- Blueprint adherence

**GCP Scoring Factors:**
- Cloud IAM bindings and permissions
- VPC firewall rules
- Secret Manager usage
- Security Command Center findings
- Cloud Audit Logs
- Policy Intelligence compliance

**Kubernetes Scoring Factors:**
- RBAC policies
- Network Policies
- Pod Security Policies
- Admission Controllers
- Secrets management
- CIS Kubernetes Benchmark compliance

### Multi-Cloud/Hybrid Scoring

For multi-cloud or hybrid architectures:
- **Cross-cloud security**: Identity federation, encryption in transit
- **Data governance**: Data sovereignty, cross-border compliance
- **Network connectivity**: Secure inter-cloud connections
- **Unified monitoring**: Cross-cloud compliance tracking

---

## Score Interpretation

### Score Ranges

| Score Range | Rating | Interpretation |
|------------|--------|----------------|
| **90-100** | Excellent | Architecture follows best practices, minimal issues |
| **75-89** | Good | Architecture is well-designed with minor improvements needed |
| **60-74** | Fair | Architecture has some gaps that should be addressed |
| **40-59** | Poor | Architecture has significant issues requiring attention |
| **0-39** | Critical | Architecture has critical flaws requiring immediate action |

### Score Breakdown by Category

**Security Score:**
- 90-100: Comprehensive security controls, defense in depth
- 75-89: Good security posture, some improvements possible
- 60-74: Basic security, gaps in critical areas
- 40-59: Significant security vulnerabilities
- 0-39: Critical security flaws, high risk

**Resiliency Score:**
- 90-100: Highly available, fault-tolerant, comprehensive DR
- 75-89: Good availability, some redundancy gaps
- 60-74: Basic availability, limited fault tolerance
- 40-59: Single points of failure, poor DR
- 0-39: No redundancy, no DR plan

**Cost Efficiency Score:**
- 90-100: Optimized costs, minimal waste
- 75-89: Good cost optimization, minor waste
- 60-74: Some optimization, moderate waste
- 40-59: Significant cost inefficiencies
- 0-39: High waste, poor resource utilization

**Compliance Score:**
- 90-100: Fully compliant with applicable frameworks
- 75-89: Mostly compliant, minor gaps
- 60-74: Partially compliant, some gaps
- 40-59: Significant compliance gaps
- 0-39: Non-compliant, critical gaps

---

## Factors Affecting Scores

### Positive Factors (Increase Scores)

1. **Best Practices Implementation**:
   - Encryption at rest and in transit
   - Multi-factor authentication
   - Network segmentation
   - Comprehensive logging
   - Automated backups
   - Health monitoring

2. **Cloud Provider Features**:
   - Managed services (reduce operational overhead)
   - Auto-scaling (cost and performance optimization)
   - Multi-AZ/Region deployment (resiliency)
   - CDN usage (performance and cost)

3. **Architecture Patterns**:
   - Microservices (scalability, maintainability)
   - Event-driven architecture (loose coupling)
   - API Gateway pattern (security, management)
   - Caching layers (performance, cost)

### Negative Factors (Decrease Scores)

1. **Security Risks**:
   - Exposed credentials
   - Missing encryption
   - Weak authentication
   - No network segmentation
   - Insufficient logging

2. **Resiliency Issues**:
   - Single points of failure
   - No backup strategy
   - No health checks
   - No auto-scaling
   - No disaster recovery plan

3. **Cost Issues**:
   - Overprovisioned resources
   - Unused resources
   - Inefficient service choices
   - No cost monitoring
   - High data transfer costs

4. **Compliance Gaps**:
   - Missing encryption requirements
   - Insufficient access controls
   - No audit logging
   - Data retention policy gaps
   - Cross-border data transfer issues

---

## LLM Prompt Instructions

The LLM receives detailed instructions for scoring:

```
1. Evaluate the architecture against each active checklist item
2. Identify which checklist items are properly implemented, partially implemented, or missing
3. Generate specific risks, compliance gaps, and recommendations based on the checklist evaluation
4. Count how many checklist items are fully implemented vs missing to calculate scores
5. Focus on high-priority items first, then medium-priority items
6. Provide realistic scores (0-100) based on compliance with the checklist items
7. Consider cloud provider-specific best practices
8. Factor in identified risks, gaps, and issues
```

---

## Score Consistency

### Deterministic Factors
- **Checklist items**: Fixed evaluation criteria
- **Cloud provider**: Known best practices
- **Architecture components**: Extracted structure

### Variable Factors
- **LLM interpretation**: May vary slightly between runs
- **Risk assessment**: Subjective evaluation
- **Context understanding**: LLM's interpretation of architecture

### Improving Consistency
- Use **temperature=0** for deterministic LLM responses
- Provide **detailed, structured prompts**
- Use **specific evaluation criteria** (checklist items)
- **Standardize scoring instructions** in prompts

---

## Example: Complete Score Calculation

### Architecture Input:
- **Components**: Web App, API Gateway, Database, Cache, Load Balancer
- **Cloud Provider**: AWS
- **Checklist Items**: 20 security items, 15 resiliency items, 12 cost items, 18 compliance items

### Security Score Calculation:
1. **Checklist Evaluation**:
   - 20 security items total
   - 16 fully implemented (80%)
   - 3 partially implemented (15%)
   - 1 missing (5%)
   - Base: (16 * 1.0 + 3 * 0.5) / 20 * 100 = **87.5**

2. **Risk Assessment**:
   - 1 high-severity risk (missing encryption): -15
   - 2 medium-severity risks: -12
   - **Adjusted: 87.5 - 27 = 60.5**

3. **Best Practices Bonus**:
   - Multi-layer security: +5
   - Comprehensive logging: +5
   - **Final Security Score: 70**

### Resiliency Score Calculation:
1. **Availability**: Multi-AZ deployment: +35
2. **Recovery**: Automated backups: +25
3. **Fault Tolerance**: Health checks + auto-scaling: +25
4. **Base: 85**
5. **Penalty**: No DR plan: -10
6. **Final Resiliency Score: 75**

### Cost Efficiency Score Calculation:
1. **Optimization**: Right-sized + Reserved instances: +35
2. **Storage**: Appropriate tiers: +10
3. **Auto-scaling**: Cost-aware: +15
4. **Base: 60**
5. **Penalty**: Overprovisioned compute: -12
6. **Final Cost Efficiency Score: 48**

### Compliance Score Calculation:
1. **SOC2**: 82.5 (from example above)
2. **ISO27001**: 80.0 (from example above)
3. **Average: 81.25**
4. **Penalty**: Critical gap: -20
5. **Final Compliance Score: 61**

---

## Recommendations for Improving Scores

### Security Score
1. Implement all high-priority security checklist items
2. Enable encryption at rest and in transit
3. Implement network segmentation
4. Enable comprehensive logging and monitoring
5. Use managed security services (WAF, DDoS protection)

### Resiliency Score
1. Implement multi-AZ/Region deployment
2. Set up automated backups
3. Configure health checks and auto-scaling
4. Create disaster recovery plan
5. Use managed database services with built-in HA

### Cost Efficiency Score
1. Right-size all resources
2. Use reserved/committed instances
3. Implement appropriate storage tiers
4. Enable auto-scaling
5. Monitor and optimize costs regularly

### Compliance Score
1. Identify applicable compliance frameworks
2. Map architecture to framework requirements
3. Implement missing requirements
4. Enable compliance monitoring tools
5. Document compliance evidence

---

## Technical Implementation

### Code Location
- **Analysis Route**: `/src/app/api/analyze/route.ts`
- **Prompt Generation**: Lines 479-689
- **Score Extraction**: Lines 838-841
- **Score Storage**: MongoDB schema in `/src/models/Analysis.ts`

### Score Storage
```typescript
{
  resiliencyScore: number,    // 0-100
  securityScore: number,      // 0-100
  costEfficiencyScore: number, // 0-100
  complianceScore: number     // 0-100
}
```

### Score Display
- **Dashboard**: Overall scores displayed as cards
- **Analysis Results**: Detailed breakdown with recommendations
- **Trends**: Historical score tracking

---

## Summary

ArchLens scoring is **intelligent, context-aware, and comprehensive**:

1. **LLM-Based**: Uses advanced AI to understand architecture context
2. **Checklist-Driven**: Evaluates against specific, actionable criteria
3. **Provider-Aware**: Considers cloud provider best practices
4. **Risk-Informed**: Factors in identified risks and gaps
5. **Compliance-Focused**: Evaluates against industry frameworks
6. **Actionable**: Provides specific recommendations for improvement

The scoring system provides a **holistic view** of architecture quality, helping teams identify areas for improvement and track progress over time.

---

**Last Updated**: 2025-01-24
**Scoring Method**: LLM-based intelligent evaluation
**Score Range**: 0-100 for each dimension

