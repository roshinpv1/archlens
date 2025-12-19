"use client";

import { useState, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  X,
  Database,
  Server,
  Network,
  Shield,
  Cloud,
  Activity,
  HardDrive,
  MessageSquare,
  Globe,
  Eye,
  EyeOff,
  GitBranch
} from 'lucide-react';
import { ComponentAnalysis } from '@/types/componentAnalysis';

interface Connection {
  source: string;
  target: string;
  type?: string;
  protocol?: string;
  description?: string;
}

interface InteractiveDiagramViewerProps {
  imageUrl: string;
  imageAlt?: string;
  components?: ComponentAnalysis[];
  connections?: Connection[];
  onComponentClick?: (component: ComponentAnalysis) => void;
  className?: string;
}

interface ComponentOverlay {
  component: ComponentAnalysis;
  x: number;
  y: number;
  width: number;
  height: number;
}

const getComponentIcon = (type: string | undefined) => {
  const iconClass = "w-4 h-4";
  if (!type) return <Cloud className={iconClass} />;
  
  switch (type.toLowerCase()) {
    case 'database':
      return <Database className={iconClass} />;
    case 'service':
    case 'api':
      return <Server className={iconClass} />;
    case 'network':
      return <Network className={iconClass} />;
    case 'security':
      return <Shield className={iconClass} />;
    case 'storage':
      return <HardDrive className={iconClass} />;
    case 'cache':
      return <Activity className={iconClass} />;
    case 'queue':
      return <MessageSquare className={iconClass} />;
    case 'gateway':
      return <Globe className={iconClass} />;
    default:
      return <Cloud className={iconClass} />;
  }
};

const getCriticalityColor = (criticality: string | undefined) => {
  if (!criticality) return 'bg-gray-500/20 border-gray-500 text-gray-600';
  
  switch (criticality.toLowerCase()) {
    case 'high':
      return 'bg-red-500/20 border-red-500 text-red-600';
    case 'medium':
      return 'bg-yellow-500/20 border-yellow-500 text-yellow-600';
    case 'low':
      return 'bg-green-500/20 border-green-500 text-green-600';
    default:
      return 'bg-gray-500/20 border-gray-500 text-gray-600';
  }
};

export function InteractiveDiagramViewer({
  imageUrl,
  imageAlt = 'Architecture diagram',
  components = [],
  connections = [],
  onComponentClick,
  className = ''
}: InteractiveDiagramViewerProps) {
  const [hoveredComponent, setHoveredComponent] = useState<ComponentAnalysis | null>(null);
  const [selectedComponent, setSelectedComponent] = useState<ComponentAnalysis | null>(null);
  const [componentOverlays, setComponentOverlays] = useState<ComponentOverlay[]>([]);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showAllHighlights, setShowAllHighlights] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculate component overlay positions when image loads
  useEffect(() => {
    const calculateOverlays = () => {
      if (!imageRef.current || components.length === 0) {
        setComponentOverlays([]);
        return;
      }

      const img = imageRef.current;
      if (img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // Generate overlay positions (grid-based approach)
        const overlays: ComponentOverlay[] = components.map((component, index) => {
          const cols = Math.ceil(Math.sqrt(components.length));
          const row = Math.floor(index / cols);
          const col = index % cols;
          
          const overlayWidth = imgWidth / (cols + 1);
          const overlayHeight = imgHeight / (Math.ceil(components.length / cols) + 1);
          
          return {
            component,
            x: (col + 0.5) * overlayWidth,
            y: (row + 0.5) * overlayHeight,
            width: overlayWidth * 0.8,
            height: overlayHeight * 0.8
          };
        });

        setComponentOverlays(overlays);
      }
    };

    calculateOverlays();
    
    const img = imageRef.current;
    if (img) {
      img.addEventListener('load', calculateOverlays);
      return () => img.removeEventListener('load', calculateOverlays);
    }
  }, [components, imageUrl]);

  const handleComponentClick = (component: ComponentAnalysis) => {
    setSelectedComponent(component);
    if (onComponentClick) {
      onComponentClick(component);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    // Recalculate overlays
    if (imageRef.current && components.length > 0) {
      const img = imageRef.current;
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const overlays: ComponentOverlay[] = components.map((component, index) => {
          const cols = Math.ceil(Math.sqrt(components.length));
          const row = Math.floor(index / cols);
          const col = index % cols;
          
          const overlayWidth = imgWidth / (cols + 1);
          const overlayHeight = imgHeight / (Math.ceil(components.length / cols) + 1);
          
          return {
            component,
            x: (col + 0.5) * overlayWidth,
            y: (row + 0.5) * overlayHeight,
            width: overlayWidth * 0.8,
            height: overlayHeight * 0.8
          };
        });

        setComponentOverlays(overlays);
      }
    }
  };

  const renderConnections = () => {
    if (!showConnections || !imageRef.current || connections.length === 0 || componentOverlays.length === 0) return null;

    const img = imageRef.current;
    const imgWidth = img.naturalWidth || 1;
    const imgHeight = img.naturalHeight || 1;

    if (imgWidth === 1 || imgHeight === 1) return null;

    // Create a map of component names to their overlay positions
    const componentMap = new Map<string, ComponentOverlay>();
    componentOverlays.forEach(overlay => {
      componentMap.set(overlay.component.name, overlay);
    });

    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <defs>
          <marker
            id="arrowhead-primary"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <polygon
              points="0 0, 10 3, 0 6"
              fill="rgba(179, 30, 48, 0.7)"
            />
          </marker>
        </defs>
        {connections.map((connection, index) => {
          const sourceOverlay = componentMap.get(connection.source);
          const targetOverlay = componentMap.get(connection.target);

          if (!sourceOverlay || !targetOverlay) return null;

          const sourceX = (sourceOverlay.x / imgWidth) * 100;
          const sourceY = (sourceOverlay.y / imgHeight) * 100;
          const targetX = (targetOverlay.x / imgWidth) * 100;
          const targetY = (targetOverlay.y / imgHeight) * 100;

          return (
            <line
              key={`connection-${index}`}
              x1={`${sourceX}%`}
              y1={`${sourceY}%`}
              x2={`${targetX}%`}
              y2={`${targetY}%`}
              stroke="rgba(179, 30, 48, 0.5)"
              strokeWidth="2"
              strokeDasharray="4,4"
              markerEnd="url(#arrowhead-primary)"
            />
          );
        })}
      </svg>
    );
  };

  const renderOverlays = () => {
    if (!imageRef.current || componentOverlays.length === 0 || !showAllHighlights) return null;

    const img = imageRef.current;
    const imgWidth = img.naturalWidth || 1;
    const imgHeight = img.naturalHeight || 1;

    if (imgWidth === 1 || imgHeight === 1) return null;

    return componentOverlays.map((overlay, index) => {
      const x = (overlay.x / imgWidth) * 100;
      const y = (overlay.y / imgHeight) * 100;
      const width = (overlay.width / imgWidth) * 100;
      const height = (overlay.height / imgHeight) * 100;
      const isHovered = hoveredComponent?.name === overlay.component.name;
      const isSelected = selectedComponent?.name === overlay.component.name;

      return (
        <div
          key={`${overlay.component.name}-${index}`}
          className={`absolute border-2 rounded-lg cursor-pointer transition-all ${
            isSelected
              ? 'border-primary bg-primary/30 shadow-lg ring-2 ring-primary/50'
              : isHovered
              ? 'border-primary/70 bg-primary/20 shadow-md ring-1 ring-primary/30'
              : 'border-primary/50 bg-primary/10 hover:border-primary/70 hover:bg-primary/15'
          }`}
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: `${Math.max(width, 5)}%`,
            height: `${Math.max(height, 5)}%`,
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'auto',
            zIndex: isSelected ? 20 : isHovered ? 10 : 5,
            minWidth: '60px',
            minHeight: '60px'
          }}
          onMouseEnter={() => setHoveredComponent(overlay.component)}
          onMouseLeave={() => setHoveredComponent(null)}
          onClick={(e) => {
            e.stopPropagation();
            handleComponentClick(overlay.component);
          }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap pointer-events-none z-30">
            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-surface border border-border shadow-sm ${
              isHovered || isSelected ? 'scale-110' : ''
            } transition-transform`}>
              {getComponentIcon(overlay.component.type || 'service')}
              <span className="max-w-[120px] truncate">{overlay.component.name}</span>
            </div>
          </div>
        </div>
      );
    });
  };

  const ComponentDetailsPanel = ({ component }: { component: ComponentAnalysis }) => (
    <div className="bg-surface border border-border rounded-lg p-4 shadow-lg max-w-md z-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getComponentIcon(component.type)}
          <h3 className="font-semibold text-foreground">{component.name}</h3>
        </div>
        <button
          onClick={() => setSelectedComponent(null)}
          className="p-1 hover:bg-muted rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-foreground-muted">Type:</span>
          <span className="ml-2 text-foreground">{component.type}</span>
        </div>
        {component.technology && (
          <div>
            <span className="text-foreground-muted">Technology:</span>
            <span className="ml-2 text-foreground">{component.technology}</span>
          </div>
        )}
        <div>
          <span className="text-foreground-muted">Criticality:</span>
          <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${getCriticalityColor(component.criticality)}`}>
            {component.criticality}
          </span>
        </div>
        {component.description && (
          <div>
            <span className="text-foreground-muted">Description:</span>
            <p className="mt-1 text-foreground">{component.description}</p>
          </div>
        )}
        {component.performanceCharacteristics && (
          <div>
            <span className="text-foreground-muted">Performance:</span>
            <div className="mt-1 space-y-1 text-xs">
              <div>Latency: {component.performanceCharacteristics.latency || 'N/A'}</div>
              <div>Throughput: {component.performanceCharacteristics.throughput || 'N/A'}</div>
              {component.performanceCharacteristics.availability !== undefined && (
                <div>Availability: {component.performanceCharacteristics.availability}%</div>
              )}
            </div>
          </div>
        )}
        {component.securityLevel && (
          <div>
            <span className="text-foreground-muted">Security Level:</span>
            <span className="ml-2 text-foreground capitalize">{component.securityLevel}</span>
          </div>
        )}
      </div>
    </div>
  );

  const HoverTooltip = ({ component }: { component: ComponentAnalysis }) => {
    if (!hoveredComponent || hoveredComponent.name !== component.name) return null;

    return (
      <div className="bg-surface border border-border rounded-lg p-3 shadow-xl pointer-events-none max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          {getComponentIcon(component.type)}
          <h4 className="font-semibold text-foreground">{component.name}</h4>
        </div>
        <div className="text-sm space-y-1">
          <div>
            <span className="text-foreground-muted">Type:</span>
            <span className="ml-2 text-foreground">{component.type}</span>
          </div>
          {component.technology && (
            <div>
              <span className="text-foreground-muted">Tech:</span>
              <span className="ml-2 text-foreground">{component.technology}</span>
            </div>
          )}
          <div>
            <span className="text-foreground-muted">Criticality:</span>
            <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${getCriticalityColor(component.criticality)}`}>
              {component.criticality}
            </span>
          </div>
          {component.description && (
            <p className="text-foreground-muted text-xs mt-2 line-clamp-2">{component.description}</p>
          )}
        </div>
        <div className="mt-2 text-xs text-primary">Click for details</div>
      </div>
    );
  };

  if (showFullscreen) {
    return (
      <div className="fixed inset-0 z-[100] bg-background">
        <div className="relative w-full h-full">
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={4}
            centerOnInit={true}
            wheel={{ step: 0.1 }}
            doubleClick={{ disabled: false, mode: 'zoomIn' }}
            limitToBounds={false}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-4 right-4 z-[101] flex flex-col gap-2">
                  <div className="bg-surface border border-border rounded-lg p-1 flex flex-col gap-1 shadow-lg">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomIn();
                      }}
                      className="p-2 hover:bg-muted rounded transition-colors text-foreground"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        zoomOut();
                      }}
                      className="p-2 hover:bg-muted rounded transition-colors text-foreground"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetTransform();
                      }}
                      className="p-2 hover:bg-muted rounded transition-colors text-foreground"
                      title="Reset View"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setShowFullscreen(false)}
                  className="absolute top-4 right-20 z-[101] p-2 bg-surface border border-border rounded-lg hover:bg-muted transition-colors shadow-lg text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>

                <TransformComponent
                  wrapperStyle={{ width: '100%', height: '100%' }}
                  contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <div className="relative inline-block">
                    <img
                      ref={imageRef}
                      src={imageUrl}
                      alt={imageAlt}
                      className="max-w-full max-h-full object-contain select-none"
                      onLoad={handleImageLoad}
                      draggable={false}
                      style={{ display: 'block', userSelect: 'none' }}
                    />
                    {imageLoaded && renderConnections()}
                    {imageLoaded && componentOverlays.length > 0 && (
                      <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
                        {renderOverlays()}
                      </div>
                    )}
                  </div>
                </TransformComponent>

                {hoveredComponent && (
                  <div className="absolute top-20 left-4 z-[101] pointer-events-none">
                    <HoverTooltip component={hoveredComponent} />
                  </div>
                )}

                {selectedComponent && (
                  <div className="absolute bottom-4 left-4 z-[101]">
                    <ComponentDetailsPanel component={selectedComponent} />
                  </div>
                )}
              </>
            )}
          </TransformWrapper>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full ${className}`} style={{ minHeight: '600px', height: '600px' }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={4}
        centerOnInit={true}
        wheel={{ step: 0.1 }}
        doubleClick={{ disabled: false, mode: 'zoomIn' }}
        limitToBounds={false}
      >
        {({ zoomIn, zoomOut, resetTransform }) => (
          <>
            {/* Controls - Outside TransformComponent so they're always clickable */}
            <div className="absolute top-4 right-4 z-50 flex flex-col gap-2">
              <div className="bg-surface border border-border rounded-lg p-1 flex flex-col gap-1 shadow-lg">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    zoomIn();
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors text-foreground"
                  title="Zoom In"
                  type="button"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    zoomOut();
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors text-foreground"
                  title="Zoom Out"
                  type="button"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    resetTransform();
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors text-foreground"
                  title="Reset View"
                  type="button"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowFullscreen(true);
                  }}
                  className="p-2 hover:bg-muted rounded transition-colors text-foreground"
                  title="Fullscreen"
                  type="button"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Highlight Toggle Controls */}
              {components.length > 0 && (
                <div className="bg-surface border border-border rounded-lg p-1 flex flex-col gap-1 shadow-lg">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowAllHighlights(!showAllHighlights);
                    }}
                    className={`p-2 rounded transition-colors ${
                      showAllHighlights 
                        ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                        : 'hover:bg-muted text-foreground'
                    }`}
                    title={showAllHighlights ? "Hide Component Highlights" : "Show Component Highlights"}
                    type="button"
                  >
                    {showAllHighlights ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  {connections.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowConnections(!showConnections);
                      }}
                      className={`p-2 rounded transition-colors ${
                        showConnections 
                          ? 'bg-primary/10 text-primary hover:bg-primary/20' 
                          : 'hover:bg-muted text-foreground'
                      }`}
                      title={showConnections ? "Hide Connections" : "Show Connections"}
                      type="button"
                    >
                      <GitBranch className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Component Count */}
            {components.length > 0 && (
              <div className="absolute top-4 left-4 z-50">
                <div className="bg-surface border border-border rounded-lg p-2 shadow-lg">
                  <div className="text-xs text-foreground-muted mb-1">Components</div>
                  <div className="text-sm font-semibold text-foreground">{components.length}</div>
                </div>
              </div>
            )}

            <TransformComponent
              wrapperStyle={{ width: '100%', height: '100%', position: 'relative' }}
              contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <div className="relative inline-block">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt={imageAlt}
                  className="max-w-full max-h-full object-contain select-none"
                  onLoad={handleImageLoad}
                  onError={() => {
                    console.error('Failed to load image:', imageUrl);
                    setImageLoaded(false);
                  }}
                  draggable={false}
                  style={{ display: 'block', userSelect: 'none', maxWidth: '100%', maxHeight: '100%' }}
                />
                
                {/* Connections */}
                {imageLoaded && renderConnections()}
                
                {/* Component Overlays */}
                {imageLoaded && componentOverlays.length > 0 && (
                  <div className="absolute inset-0" style={{ pointerEvents: 'auto' }}>
                    {renderOverlays()}
                  </div>
                )}
              </div>
            </TransformComponent>
            
            {/* Hover Tooltip */}
            {hoveredComponent && (
              <div className="absolute top-20 left-4 z-50 pointer-events-none">
                <HoverTooltip component={hoveredComponent} />
              </div>
            )}

            {/* Selected Component Details Panel */}
            {selectedComponent && (
              <div className="absolute bottom-4 left-4 z-50">
                <ComponentDetailsPanel component={selectedComponent} />
              </div>
            )}
          </>
        )}
      </TransformWrapper>
    </div>
  );
}
