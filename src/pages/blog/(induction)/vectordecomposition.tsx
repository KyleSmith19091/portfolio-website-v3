import React, { useState } from 'react';

const VectorProjection = () => {
  const [vectorAngle, setVectorAngle] = useState(60);
  const [subspace1Angle, setSubspace1Angle] = useState(30);
  const [subspace2Angle, setSubspace2Angle] = useState(120);
  const [showProjection1, setShowProjection1] = useState(true);
  const [showProjection2, setShowProjection2] = useState(true);
  
  const width = 600;
  const height = 600;
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = 80;
  
  // Convert angle to radians
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  // Main vector
  const vectorLength = 3;
  const vx = vectorLength * Math.cos(toRad(vectorAngle));
  const vy = -vectorLength * Math.sin(toRad(vectorAngle));
  
  // Subspace 1 direction
  const s1x = Math.cos(toRad(subspace1Angle));
  const s1y = -Math.sin(toRad(subspace1Angle));
  
  // Subspace 2 direction
  const s2x = Math.cos(toRad(subspace2Angle));
  const s2y = -Math.sin(toRad(subspace2Angle));
  
  // Project vector onto subspace 1
  const proj1Scalar = (vx * s1x + vy * s1y);
  const proj1x = proj1Scalar * s1x;
  const proj1y = proj1Scalar * s1y;
  
  // Project vector onto subspace 2
  const proj2Scalar = (vx * s2x + vy * s2y);
  const proj2x = proj2Scalar * s2x;
  const proj2y = proj2Scalar * s2y;
  
  // Convert to screen coordinates
  const toScreen = (x: number, y: number) => ({
    x: centerX + x * scale,
    y: centerY + y * scale
  });
  
  const vEnd = toScreen(vx, vy);
  const p1End = toScreen(proj1x, proj1y);
  const p2End = toScreen(proj2x, proj2y);
  
  // Draw subspace lines (extended)
  const subspaceLength = 6;
  const s1Start = toScreen(-subspaceLength * s1x, -subspaceLength * s1y);
  const s1End = toScreen(subspaceLength * s1x, subspaceLength * s1y);
  const s2Start = toScreen(-subspaceLength * s2x, -subspaceLength * s2y);
  const s2End = toScreen(subspaceLength * s2x, subspaceLength * s2y);
  
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div>
        <div>
          <h3>Vector Projection onto Two Subspaces</h3>
        </div>
        <div>
          <svg width={width} height={height} className="border border-gray-300 bg-white">
            {/* Grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
              </pattern>
              <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#000" />
              </marker>
              <marker id="arrowhead-blue" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
              </marker>
              <marker id="arrowhead-red" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                <polygon points="0 0, 10 3, 0 6" fill="#ef4444" />
              </marker>
            </defs>
            <rect width={width} height={height} fill="url(#grid)" />
            
            {/* Axes */}
            <line x1="0" y1={centerY} x2={width} y2={centerY} stroke="#999" strokeWidth="1" />
            <line x1={centerX} y1="0" x2={centerX} y2={height} stroke="#999" strokeWidth="1" />
            
            {/* Subspace 1 (blue line) */}
            <line 
              x1={s1Start.x} y1={s1Start.y} 
              x2={s1End.x} y2={s1End.y} 
              stroke="#3b82f6" 
              strokeWidth="3" 
              strokeDasharray="8,4"
              opacity="0.6"
            />
            <text 
              x={s1End.x - 80} 
              y={s1End.y - 10} 
              fontSize="14" 
              fill="#3b82f6" 
              fontWeight="bold"
            >
              Subspace 1
            </text>
            
            {/* Subspace 2 (red line) */}
            <line 
              x1={s2Start.x} y1={s2Start.y} 
              x2={s2End.x} y2={s2End.y} 
              stroke="#ef4444" 
              strokeWidth="3" 
              strokeDasharray="8,4"
              opacity="0.6"
            />
            <text 
              x={s2End.x + 10} 
              y={s2End.y + 20} 
              fontSize="14" 
              fill="#ef4444" 
              fontWeight="bold"
            >
              Subspace 2
            </text>
            
            {/* Projection 1 - perpendicular drop line */}
            {showProjection1 && (
              <>
                <line 
                  x1={vEnd.x} y1={vEnd.y} 
                  x2={p1End.x} y2={p1End.y} 
                  stroke="#3b82f6" 
                  strokeWidth="2" 
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
                {/* Right angle indicator for projection 1 */}
                <path
                  d={`M ${p1End.x + 10 * (vEnd.x - p1End.x) / Math.hypot(vEnd.x - p1End.x, vEnd.y - p1End.y)} ${p1End.y + 10 * (vEnd.y - p1End.y) / Math.hypot(vEnd.x - p1End.x, vEnd.y - p1End.y)} 
                      L ${p1End.x + 10 * (vEnd.x - p1End.x) / Math.hypot(vEnd.x - p1End.x, vEnd.y - p1End.y) + 10 * s1x} ${p1End.y + 10 * (vEnd.y - p1End.y) / Math.hypot(vEnd.x - p1End.x, vEnd.y - p1End.y) + 10 * s1y}
                      L ${p1End.x + 10 * s1x} ${p1End.y + 10 * s1y}`}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
                {/* Projection 1 vector */}
                <line 
                  x1={centerX} y1={centerY} 
                  x2={p1End.x} y2={p1End.y} 
                  stroke="#3b82f6" 
                  strokeWidth="4"
                  markerEnd="url(#arrowhead-blue)"
                />
                <circle cx={p1End.x} cy={p1End.y} r="5" fill="#3b82f6" />
                <text x={p1End.x + 15} y={p1End.y + 25} fontSize="15" fill="#3b82f6" fontWeight="bold">position</text>
              </>
            )}
            
            {/* Projection 2 - perpendicular drop line */}
            {showProjection2 && (
              <>
                <line 
                  x1={vEnd.x} y1={vEnd.y} 
                  x2={p2End.x} y2={p2End.y} 
                  stroke="#ef4444" 
                  strokeWidth="2" 
                  strokeDasharray="4,4"
                  opacity="0.7"
                />
                {/* Right angle indicator for projection 2 */}
                <path
                  d={`M ${p2End.x + 10 * (vEnd.x - p2End.x) / Math.hypot(vEnd.x - p2End.x, vEnd.y - p2End.y)} ${p2End.y + 10 * (vEnd.y - p2End.y) / Math.hypot(vEnd.x - p2End.x, vEnd.y - p2End.y)} 
                      L ${p2End.x + 10 * (vEnd.x - p2End.x) / Math.hypot(vEnd.x - p2End.x, vEnd.y - p2End.y) + 10 * s2x} ${p2End.y + 10 * (vEnd.y - p2End.y) / Math.hypot(vEnd.x - p2End.x, vEnd.y - p2End.y) + 10 * s2y}
                      L ${p2End.x + 10 * s2x} ${p2End.y + 10 * s2y}`}
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                {/* Projection 2 vector */}
                <line 
                  x1={centerX} y1={centerY} 
                  x2={p2End.x} y2={p2End.y} 
                  stroke="#ef4444" 
                  strokeWidth="4"
                  markerEnd="url(#arrowhead-red)"
                />
                <circle cx={p2End.x} cy={p2End.y} r="5" fill="#ef4444" />
                <text x={p2End.x - 70} y={p2End.y + 25} fontSize="15" fill="#ef4444" fontWeight="bold">token</text>
              </>
            )}
            
            {/* Original vector - drawn last so it's on top */}
            <line 
              x1={centerX} y1={centerY} 
              x2={vEnd.x} y2={vEnd.y} 
              stroke="#000" 
              strokeWidth="4"
              markerEnd="url(#arrowhead)"
            />
            <circle cx={vEnd.x} cy={vEnd.y} r="6" fill="#000" />
            <text x={vEnd.x + 15} y={vEnd.y - 10} fontSize="18" fontWeight="bold">v</text>
          </svg>
          
          <div className="mt-4 flex gap-4">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={showProjection1}
                onChange={(e) => setShowProjection1(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-blue-600 font-medium">Show Projection 1</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={showProjection2}
                onChange={(e) => setShowProjection2(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-red-600 font-medium">Show Projection 2</span>
            </label>
          </div>
          
          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Vector Angle: {vectorAngle}°
              </label>
              <input 
                type="range" 
                min="0" 
                max="360" 
                value={vectorAngle}
                onChange={(e) => setVectorAngle(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 border-l-4 rounded">
            <h3 className="font-bold text-lg mb-2">How Projection Works (visually):</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li><strong>Drop a perpendicular</strong>: From the tip of vector <strong>v</strong> (black), imagine dropping a perpendicular line onto each subspace (shown as dotted lines)</li>
              <li><strong>Where it lands</strong>: The point where this perpendicular meets the subspace is the projection</li>
              <li><strong>Right angle</strong>: Notice the small squares showing that the dotted lines are perpendicular (90°) to the subspaces</li>
              <li><strong>Projection vector</strong>: The colored arrows from the origin to these landing points are the projection vectors</li>
            </ol>
            <p className="mt-3 text-sm font-medium">
              💡 <strong>Key insight</strong>: The projection is the "shadow" of vector v onto each subspace, showing how much of v points in that direction!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorProjection;