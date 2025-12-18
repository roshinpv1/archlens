export interface ArchitectureReviewOption {
  id: string;
  name: string;
  description: string;
  category: 'functional' | 'structural' | 'operational' | 'quality';
}

export const ARCHITECTURE_REVIEW_OPTIONS: ArchitectureReviewOption[] = [
  {
    id: 'functional-coverage',
    name: 'Functional Coverage',
    description: 'All business capabilities are represented, end-to-end flows are visible, clear responsibility per component',
    category: 'functional'
  },
  {
    id: 'modularity-structure',
    name: 'Modularity & Structure',
    description: 'Clear separation of concerns, loosely coupled components, no single "god" component',
    category: 'structural'
  },
  {
    id: 'scalability',
    name: 'Scalability',
    description: 'Supports horizontal scaling, stateless services where possible, asynchronous processing included',
    category: 'operational'
  },
  {
    id: 'performance',
    name: 'Performance',
    description: 'Critical paths are minimized, caching layers identified, limited synchronous dependencies',
    category: 'operational'
  },
  {
    id: 'reliability-availability',
    name: 'Reliability & Availability',
    description: 'No single point of failure, redundancy and failover shown, graceful degradation possible',
    category: 'operational'
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Authentication & authorization defined, data encrypted in transit and at rest, network boundaries clearly shown',
    category: 'operational'
  },
  {
    id: 'data-architecture',
    name: 'Data Architecture',
    description: 'Clear data ownership, appropriate consistency model, well-defined data flows',
    category: 'structural'
  },
  {
    id: 'maintainability-extensibility',
    name: 'Maintainability & Extensibility',
    description: 'Easy to add or change components, low impact of changes (small blast radius), clear extension points',
    category: 'quality'
  },
  {
    id: 'diagram-quality',
    name: 'Diagram Quality',
    description: 'Clear, readable, and consistent, appropriate level of abstraction, matches the target audience',
    category: 'quality'
  }
];

