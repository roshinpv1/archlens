import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { ArchitectureAnalysis } from '@/types/architecture';

// Register fonts if needed (optional)
// Font.register({
//   family: 'Roboto',
//   src: 'https://cdnjs.cloudflare.com/ajax/libs/roboto/4.0.0/Roboto-Regular.ttf'
// });

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottom: '2 solid #2563eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '1 solid #e2e8f0',
  },
  scoreCard: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
    border: '1 solid #e2e8f0',
  },
  scoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 11,
    color: '#475569',
    fontWeight: 'bold',
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  scoreBar: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    marginTop: 4,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  itemCard: {
    backgroundColor: '#ffffff',
    padding: 10,
    marginBottom: 8,
    border: '1 solid #e2e8f0',
    borderRadius: 4,
  },
  itemTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 9,
    color: '#64748b',
    lineHeight: 1.4,
    marginBottom: 6,
  },
  badge: {
    display: 'inline-block',
    padding: '2 6',
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    marginRight: 4,
  },
  badgeHigh: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  badgeMedium: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  badgeLow: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  metadataRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  metadataLabel: {
    fontSize: 9,
    color: '#64748b',
    width: 100,
  },
  metadataValue: {
    fontSize: 9,
    color: '#1e293b',
    flex: 1,
  },
  table: {
    width: '100%',
    marginTop: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #e2e8f0',
    paddingVertical: 6,
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    fontWeight: 'bold',
    fontSize: 9,
    color: '#475569',
  },
  tableCell: {
    fontSize: 8,
    color: '#1e293b',
    paddingHorizontal: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    borderTop: '1 solid #e2e8f0',
    paddingTop: 10,
  },
  imageContainer: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 4,
    border: '1 solid #e2e8f0',
    minHeight: 400,
  },
  image: {
    maxWidth: '90%',
    maxHeight: 500,
    objectFit: 'contain',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  gridItem: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 8,
  },
});

interface PDFReportProps {
  analysis: ArchitectureAnalysis;
}

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10b981'; // green
  if (score >= 60) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

const getSeverityColor = (severity: string): string => {
  const s = severity.toLowerCase();
  if (s === 'high' || s === 'critical') return '#ef4444';
  if (s === 'medium') return '#f59e0b';
  return '#10b981';
};

export const PDFReport: React.FC<PDFReportProps> = ({ analysis }) => {
  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Architecture Analysis Report</Text>
          <Text style={styles.subtitle}>CloudArc - Cloud Architecture Review System</Text>
          <Text style={styles.subtitle}>Generated: {formatDate(analysis.timestamp)}</Text>
        </View>

        {/* Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis Information</Text>
          <View style={styles.itemCard}>
            <View style={styles.metadataRow}>
              <Text style={styles.metadataLabel}>File Name:</Text>
              <Text style={styles.metadataValue}>{analysis.fileName}</Text>
            </View>
            {analysis.appId && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Application ID:</Text>
                <Text style={styles.metadataValue}>{analysis.appId}</Text>
              </View>
            )}
            {analysis.componentName && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Component:</Text>
                <Text style={styles.metadataValue}>{analysis.componentName}</Text>
              </View>
            )}
            {analysis.environment && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Environment:</Text>
                <Text style={styles.metadataValue}>{analysis.environment}</Text>
              </View>
            )}
            {analysis.version && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Version:</Text>
                <Text style={styles.metadataValue}>{analysis.version}</Text>
              </View>
            )}
            {analysis.metadata?.primaryCloudProvider && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Cloud Provider:</Text>
                <Text style={styles.metadataValue}>{analysis.metadata.primaryCloudProvider}</Text>
              </View>
            )}
            {analysis.metadata?.architectureType && (
              <View style={styles.metadataRow}>
                <Text style={styles.metadataLabel}>Architecture Type:</Text>
                <Text style={styles.metadataValue}>{analysis.metadata.architectureType}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Summary */}
        {analysis.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Executive Summary</Text>
            <Text style={styles.itemDescription}>{analysis.summary}</Text>
          </View>
        )}

        {/* Scores */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis Scores</Text>
          <View style={styles.grid}>
            <View style={[styles.gridItem, styles.scoreCard]}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Security</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(analysis.securityScore) }]}>
                  {analysis.securityScore}/100
                </Text>
              </View>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { 
                  width: `${analysis.securityScore}%`, 
                  backgroundColor: getScoreColor(analysis.securityScore) 
                }]} />
              </View>
            </View>
            <View style={[styles.gridItem, styles.scoreCard]}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Resiliency</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(analysis.resiliencyScore) }]}>
                  {analysis.resiliencyScore}/100
                </Text>
              </View>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { 
                  width: `${analysis.resiliencyScore}%`, 
                  backgroundColor: getScoreColor(analysis.resiliencyScore) 
                }]} />
              </View>
            </View>
            <View style={[styles.gridItem, styles.scoreCard]}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Cost Efficiency</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(analysis.costEfficiencyScore) }]}>
                  {analysis.costEfficiencyScore}/100
                </Text>
              </View>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { 
                  width: `${analysis.costEfficiencyScore}%`, 
                  backgroundColor: getScoreColor(analysis.costEfficiencyScore) 
                }]} />
              </View>
            </View>
            <View style={[styles.gridItem, styles.scoreCard]}>
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Compliance</Text>
                <Text style={[styles.scoreValue, { color: getScoreColor(analysis.complianceScore) }]}>
                  {analysis.complianceScore}/100
                </Text>
              </View>
              <View style={styles.scoreBar}>
                <View style={[styles.scoreBarFill, { 
                  width: `${analysis.complianceScore}%`, 
                  backgroundColor: getScoreColor(analysis.complianceScore) 
                }]} />
              </View>
            </View>
          </View>
          {analysis.estimatedSavingsUSD > 0 && (
            <View style={styles.itemCard}>
              <Text style={styles.itemTitle}>Estimated Cost Savings</Text>
              <Text style={[styles.scoreValue, { color: '#10b981', fontSize: 16 }]}>
                ${analysis.estimatedSavingsUSD.toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        {/* Footer */}
        <Text style={styles.footer} fixed>
          CloudArc Architecture Analysis Report | Analysis ID: {analysis.id} | Page {'{pageNumber}'} of {'{totalPages}'}
        </Text>
      </Page>

      {/* Architecture Diagram Page */}
      {analysis.originalFile && analysis.originalFile.data && analysis.fileType === 'image' && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Architecture Diagram</Text>
          <View style={styles.imageContainer}>
            <Image
              src={`data:${analysis.originalFile.mimeType || 'image/png'};base64,${analysis.originalFile.data}`}
              style={styles.image}
            />
          </View>
          <Text style={[styles.itemDescription, { fontSize: 9, textAlign: 'center', marginTop: 8, fontStyle: 'italic', color: '#64748b' }]}>
            {analysis.fileName || 'Architecture Diagram'}
          </Text>
          {analysis.architectureDescription && (
            <View style={[styles.section, { marginTop: 20 }]}>
              <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Architecture Description</Text>
              <Text style={styles.itemDescription}>{analysis.architectureDescription}</Text>
            </View>
          )}
          <Text style={styles.footer} fixed>
            CloudArc Architecture Analysis Report | Analysis ID: {analysis.id} | Page {'{pageNumber}'} of {'{totalPages}'}
          </Text>
        </Page>
      )}

      {/* Security Analysis Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Security Analysis</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Security Score: {analysis.securityScore}/100</Text>
        </View>

        {analysis.risks && analysis.risks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Security Risks & Vulnerabilities</Text>
            {analysis.risks
              .filter(risk => 
                risk.category === 'security' || 
                (risk.title && risk.title.toLowerCase().includes('security'))
              )
              .map((risk, idx) => (
                <View key={risk.id || `risk-${idx}`} style={styles.itemCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.itemTitle}>{risk.title || 'Security Risk'}</Text>
                    <View style={[styles.badge, { backgroundColor: getSeverityColor(risk.severity || risk.level || 'medium') + '40', color: getSeverityColor(risk.severity || risk.level || 'medium') }]}>
                      {(risk.severity || risk.level || 'medium').toUpperCase()}
                    </View>
                  </View>
                  <Text style={styles.itemDescription}>{risk.description || 'No description available'}</Text>
                  {risk.impact && (
                    <Text style={[styles.itemDescription, { marginTop: 4 }]}>
                      <Text style={{ fontWeight: 'bold' }}>Impact: </Text>
                      {risk.impact}
                    </Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Security Recommendations</Text>
            {analysis.recommendations
              .filter(rec => rec.category === 'security')
              .slice(0, 10)
              .map((rec, idx) => (
                <View key={rec.id || `rec-${idx}`} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{rec.issue || 'Security Issue'}</Text>
                  <Text style={styles.itemDescription}>{rec.fix || 'No fix provided'}</Text>
                  <View style={{ flexDirection: 'row', marginTop: 4 }}>
                    <Text style={[styles.badge, styles.badgeHigh]}>Priority: {rec.priority || 1}</Text>
                    <Text style={[styles.badge, { backgroundColor: '#e2e8f0', color: '#475569', marginLeft: 4 }]}>
                      {rec.effort || 'medium'} effort
                    </Text>
                  </View>
                </View>
              ))}
          </View>
        )}

        {analysis.complianceGaps && analysis.complianceGaps.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Compliance Gaps</Text>
            {analysis.complianceGaps.slice(0, 5).map((gap, idx) => (
              <View key={gap.id || `gap-${idx}`} style={styles.itemCard}>
                <Text style={styles.itemTitle}>{gap.requirement || 'Compliance Requirement'}</Text>
                <Text style={[styles.itemDescription, { fontSize: 8 }]}>Framework: {gap.framework || 'N/A'}</Text>
                <Text style={styles.itemDescription}>{gap.description || 'No description available'}</Text>
                <Text style={[styles.itemDescription, { marginTop: 4, fontWeight: 'bold' }]}>
                  Remediation: {gap.remediation || 'No remediation provided'}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer} fixed>
          CloudArc Architecture Analysis Report | Analysis ID: {analysis.id} | Page {'{pageNumber}'} of {'{totalPages}'}
        </Text>
      </Page>

      {/* Resiliency Analysis Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Resiliency Analysis</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Resiliency Score: {analysis.resiliencyScore}/100</Text>
        </View>

        {analysis.risks && analysis.risks.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Resiliency Risks & Single Points of Failure</Text>
            {analysis.risks
              .filter(risk => 
                risk.category === 'reliability' || 
                (risk.title && (risk.title.toLowerCase().includes('availability') || risk.title.toLowerCase().includes('resiliency')))
              )
              .map((risk, idx) => (
                <View key={risk.id || `risk-${idx}`} style={styles.itemCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={styles.itemTitle}>{risk.title || 'Resiliency Risk'}</Text>
                    <View style={[styles.badge, { backgroundColor: getSeverityColor(risk.severity || risk.level || 'medium') + '40', color: getSeverityColor(risk.severity || risk.level || 'medium') }]}>
                      {(risk.severity || risk.level || 'medium').toUpperCase()}
                    </View>
                  </View>
                  <Text style={styles.itemDescription}>{risk.description || 'No description available'}</Text>
                </View>
              ))}
          </View>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Resiliency Recommendations</Text>
            {analysis.recommendations
              .filter(rec => rec.category === 'reliability')
              .slice(0, 10)
              .map((rec, idx) => (
                <View key={rec.id || `rec-${idx}`} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{rec.issue || 'Resiliency Issue'}</Text>
                  <Text style={styles.itemDescription}>{rec.fix || 'No fix provided'}</Text>
                </View>
              ))}
          </View>
        )}

        <Text style={styles.footer} fixed>
          CloudArc Architecture Analysis Report | Analysis ID: {analysis.id} | Page {'{pageNumber}'} of {'{totalPages}'}
        </Text>
      </Page>

      {/* Cost Efficiency Analysis Page */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Cost Efficiency Analysis</Text>
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Cost Efficiency Score: {analysis.costEfficiencyScore}/100</Text>
          {analysis.estimatedSavingsUSD > 0 && (
            <Text style={[styles.scoreValue, { color: '#10b981', marginTop: 4 }]}>
              Potential Savings: ${analysis.estimatedSavingsUSD.toLocaleString()}
            </Text>
          )}
        </View>

        {analysis.costIssues && analysis.costIssues.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Cost Optimization Opportunities</Text>
            {analysis.costIssues.map((issue, idx) => (
              <View key={issue.id || `cost-${idx}`} style={styles.itemCard}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={styles.itemTitle}>{issue.title || 'Cost Issue'}</Text>
                  {(issue.estimatedSavingsUSD || issue.estimatedSavings) && (
                    <Text style={[styles.scoreValue, { color: '#10b981' }]}>
                      ${((issue.estimatedSavingsUSD || issue.estimatedSavings || 0)).toLocaleString()}
                    </Text>
                  )}
                </View>
                <Text style={styles.itemDescription}>{issue.description || 'No description available'}</Text>
                {issue.recommendation && (
                  <Text style={[styles.itemDescription, { marginTop: 4, fontWeight: 'bold' }]}>
                    Recommendation: {issue.recommendation}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { fontSize: 14 }]}>Cost Optimization Recommendations</Text>
            {analysis.recommendations
              .filter(rec => rec.category === 'cost')
              .slice(0, 10)
              .map((rec, idx) => (
                <View key={rec.id || `rec-${idx}`} style={styles.itemCard}>
                  <Text style={styles.itemTitle}>{rec.issue || 'Cost Issue'}</Text>
                  <Text style={styles.itemDescription}>{rec.fix || 'No fix provided'}</Text>
                </View>
              ))}
          </View>
        )}

        <Text style={styles.footer} fixed>
          CloudArc Architecture Analysis Report | Analysis ID: {analysis.id} | Page {'{pageNumber}'} of {'{totalPages}'}
        </Text>
      </Page>

      {/* Risks & Issues Page */}
      {analysis.risks && analysis.risks.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Risks & Issues</Text>
          {analysis.risks.map((risk, idx) => (
            <View key={risk.id || `risk-${idx}`} style={styles.itemCard}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={styles.itemTitle}>{risk.title || 'Risk'}</Text>
                <View style={[styles.badge, { backgroundColor: getSeverityColor(risk.severity || risk.level || 'medium') + '40', color: getSeverityColor(risk.severity || risk.level || 'medium') }]}>
                  {(risk.severity || risk.level || 'medium').toUpperCase()}
                </View>
              </View>
              <Text style={styles.itemDescription}>{risk.description || 'No description available'}</Text>
              {risk.impact && (
                <Text style={[styles.itemDescription, { marginTop: 4 }]}>
                  <Text style={{ fontWeight: 'bold' }}>Impact: </Text>
                  {risk.impact}
                </Text>
              )}
              {risk.category && (
                <Text style={[styles.itemDescription, { fontSize: 8, marginTop: 2 }]}>
                  Category: {risk.category}
                </Text>
              )}
            </View>
          ))}
          <Text style={styles.footer} fixed>
            CloudArc Architecture Analysis Report | Analysis ID: {analysis.id} | Page {'{pageNumber}'} of {'{totalPages}'}
          </Text>
        </Page>
      )}

      {/* Recommendations Page */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '5%' }]}>#</Text>
              <Text style={[styles.tableCell, { width: '35%' }]}>Issue</Text>
              <Text style={[styles.tableCell, { width: '35%' }]}>Fix</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>Priority</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>Category</Text>
            </View>
            {analysis.recommendations.map((rec, idx) => (
              <View key={rec.id || `rec-${idx}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '5%' }]}>{rec.priority || idx + 1}</Text>
                <Text style={[styles.tableCell, { width: '35%' }]}>{rec.issue || 'Issue'}</Text>
                <Text style={[styles.tableCell, { width: '35%' }]}>{rec.fix || 'No fix'}</Text>
                <Text style={[styles.tableCell, { width: '10%' }]}>{rec.impact || 'medium'}</Text>
                <Text style={[styles.tableCell, { width: '15%' }]}>{rec.category || 'general'}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.footer} fixed>
            CloudArc Architecture Analysis Report | Analysis ID: {analysis.id} | Page {'{pageNumber}'} of {'{totalPages}'}
          </Text>
        </Page>
      )}

      {/* Components Page */}
      {analysis.components && analysis.components.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Architecture Components</Text>
          <Text style={[styles.itemDescription, { marginBottom: 12 }]}>
            Total Components: {analysis.components.length}
          </Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={[styles.tableCell, { width: '25%' }]}>Name</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>Type</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>Cloud Provider</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>Service</Text>
              <Text style={[styles.tableCell, { width: '20%' }]}>Region</Text>
            </View>
            {analysis.components.slice(0, 30).map((comp: any, idx: number) => (
              <View key={comp.id || `comp-${idx}`} style={styles.tableRow}>
                <Text style={[styles.tableCell, { width: '25%' }]}>{comp.name || 'Unknown'}</Text>
                <Text style={[styles.tableCell, { width: '15%' }]}>{comp.type || 'N/A'}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{comp.cloudProvider || 'N/A'}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{comp.cloudService || 'N/A'}</Text>
                <Text style={[styles.tableCell, { width: '20%' }]}>{comp.cloudRegion || 'N/A'}</Text>
              </View>
            ))}
          </View>
          {analysis.components.length > 30 && (
            <Text style={[styles.itemDescription, { marginTop: 8, fontStyle: 'italic' }]}>
              ... and {analysis.components.length - 30} more components
            </Text>
          )}
          <Text style={styles.footer} fixed>
            CloudArc Architecture Analysis Report | Analysis ID: {analysis.id} | Page {'{pageNumber}'} of {'{totalPages}'}
          </Text>
        </Page>
      )}
    </Document>
  );
};

