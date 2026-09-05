import React, { useState, useRef, useEffect } from 'react';

export default function BlochSphere({ alpha = { real: 1, imag: 0 }, beta = { real: 0, imag: 0 } }) {
  // Camera rotation & zoom state
  const [rotation, setRotation] = useState({ rotX: 20, rotY: -35 });
  const [zoom, setZoom] = useState(1); // Zoom level scale factor (0.5x to 2.5x)

  const containerRef = useRef(null);
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  // 1. Calculate Bloch sphere vector coordinates from quantum state
  const aReal = alpha.real ?? 1;
  const aImag = alpha.imag ?? 0;
  const bReal = beta.real ?? 0;
  const bImag = beta.imag ?? 0;

  // Density matrix elements to find Bloch vector (x, y, z)
  const bx = 2 * (aReal * bReal + aImag * bImag);
  const by = 2 * (aReal * bImag - aImag * bReal);
  const bz = (aReal ** 2 + aImag ** 2) - (bReal ** 2 + bImag ** 2);

  // 2. Dynamic 3D Projection Math (centered at exact 200, 200 origin)
  const center = 200;
  const baseRadius = 120; // Slight padding cushion for labels when zoomed 100%
  const radius = baseRadius * zoom;

  const project3D = (x, y, z) => {
    const radX = (rotation.rotX * Math.PI) / 180;
    const radY = (rotation.rotY * Math.PI) / 180;

    // Rotate around Y-axis
    const x1 = x * Math.cos(radY) + z * Math.sin(radY);
    const y1 = y;
    const z1 = -x * Math.sin(radY) + z * Math.cos(radY);

    // Rotate around X-axis
    const x2 = x1;
    const y2 = y1 * Math.cos(radX) - z1 * Math.sin(radX);
    const z2 = y1 * Math.sin(radX) + z1 * Math.cos(radX);

    return {
      px: center + x2 * radius,
      py: center - y2 * radius,
      pz: z2, // Z-depth used for back-face dimming
    };
  };

  // Projected Points for Core Axes
  const origin = project3D(0, 0, 0);
  const topZ = project3D(0, 0, 1);    // |0⟩
  const botZ = project3D(0, 0, -1);   // |1⟩
  const posX = project3D(1, 0, 0);    // +X
  const negX = project3D(-1, 0, 0);   // -X
  const posY = project3D(0, 1, 0);    // +Y
  const negY = project3D(0, -1, 0);   // -Y

  // Projected Point for Current State Vector
  const stateVec = project3D(bx, by, bz);

  // 3. Mouse Wheel / Trackpad Scroll Zoom Listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e) => {
      e.preventDefault(); // Stop entire page from scrolling while zooming inside canvas
      const delta = -e.deltaY * 0.0015;
      setZoom((prev) => Math.min(Math.max(0.5, prev + delta), 2.2));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // 4. Mouse Drag Rotation Controls
  const handleMouseDown = (e) => {
    isDragging.current = true;
    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastMouse.current.x;
    const deltaY = e.clientY - lastMouse.current.y;

    setRotation((prev) => ({
      rotX: Math.max(-85, Math.min(85, prev.rotX + deltaY * 0.5)),
      rotY: prev.rotY + deltaX * 0.5,
    }));

    lastMouse.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  // Zoom Control Handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(2.2, prev + 0.2));
  const handleZoomOut = () => setZoom((prev) => Math.max(0.5, prev - 0.2));
  const handleResetView = () => {
    setRotation({ rotX: 20, rotY: -35 });
    setZoom(1);
  };

  // Generate Latitude Equator Ring Path
  const equatorPoints = [];
  for (let i = 0; i <= 360; i += 10) {
    const rad = (i * Math.PI) / 180;
    const pt = project3D(Math.cos(rad), Math.sin(rad), 0);
    equatorPoints.push(`${i === 0 ? 'M' : 'L'} ${pt.px} ${pt.py}`);
  }

  // Label configuration list (Billboarded)
  const labels = [
    { text: '|0⟩', ...topZ, color: '#38bdf8', weight: 'bold' },
    { text: '|1⟩', ...botZ, color: '#38bdf8', weight: 'bold' },
    { text: '+X', ...posX, color: '#94a3b8' },
    { text: '-X', ...negX, color: '#64748b' },
    { text: '+Y', ...posY, color: '#94a3b8' },
    { text: '-Y', ...negY, color: '#64748b' },
  ];

  return (
    <div
      ref={containerRef}
      className="bloch-sphere-interactive-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',           // Explicit flex layout
        alignItems: 'center',       // Center vertically
        justifyContent: 'center',   // Center horizontally
        cursor: isDragging.current ? 'grabbing' : 'grab',
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* ZOOM CONTROLS OVERLAY */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.85)',
          padding: '4px 8px',
          borderRadius: '8px',
          border: '1px solid #334155',
          backdropFilter: 'blur(4px)',
          zIndex: 10,
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="icon-btn-sm" onClick={handleZoomOut} title="Zoom Out (-)">
          -
        </button>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', minWidth: '38px', textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button className="icon-btn-sm" onClick={handleZoomIn} title="Zoom In (+)">
          +
        </button>
        <button
          className="icon-btn-sm"
          onClick={handleResetView}
          title="Reset Camera Angle & Zoom"
          style={{ fontSize: '0.75rem', marginLeft: '4px' }}
        >
          ↺ Reset
        </button>
      </div>

      {/* SVG GRAPHICS - Locked to centered Aspect Ratio */}
      <svg
        viewBox="0 0 400 400"
        preserveAspectRatio="xMidYMid meet"
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '480px',
          aspectRatio: '1 / 1',
        }}
      >
        <defs>
          <radialGradient id="sphereGrad" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#0f172a" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#1e293b" stopOpacity="0.9" />
          </radialGradient>

          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
          </marker>
        </defs>

        {/* Outer Sphere Boundary */}
        <circle cx={center} cy={center} r={radius} fill="url(#sphereGrad)" stroke="#334155" strokeWidth="1.5" />

        {/* Equator Guide Ring */}
        <path d={equatorPoints.join(' ')} fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />

        {/* Axis Wireframe Lines */}
        {/* Z-Axis (|0> to |1>) */}
        <line x1={topZ.px} y1={topZ.py} x2={botZ.px} y2={botZ.py} stroke="#3b82f6" strokeWidth="1.5" opacity="0.6" />
        {/* X-Axis */}
        <line x1={negX.px} y1={negX.py} x2={posX.px} y2={posX.py} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
        {/* Y-Axis */}
        <line x1={negY.px} y1={negY.py} x2={posY.px} y2={posY.py} stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />

        {/* State Vector Arrow |ψ⟩ */}
        <line
          x1={origin.px}
          y1={origin.py}
          x2={stateVec.px}
          y2={stateVec.py}
          stroke="#f43f5e"
          strokeWidth="3.5"
          markerEnd="url(#arrow)"
        />

        {/* State Vector Tip Point */}
        <circle cx={stateVec.px} cy={stateVec.py} r="4.5" fill="#f43f5e" />

        {/* BILLBOARDED AXIS LABELS */}
        {labels.map((lbl, idx) => {
          const opacity = lbl.pz < -0.2 ? 0.35 : 1;

          return (
            <text
              key={idx}
              x={lbl.px}
              y={lbl.py}
              fill={lbl.color}
              fontSize={Math.max(12, 14 * Math.min(1.3, zoom))}
              fontWeight={lbl.weight || 'normal'}
              fontFamily="monospace, sans-serif"
              textAnchor="middle"
              dominantBaseline="central"
              opacity={opacity}
              style={{ transition: 'opacity 0.15s ease' }}
            >
              {lbl.text}
            </text>
          );
        })}
      </svg>
    </div>
  );
}