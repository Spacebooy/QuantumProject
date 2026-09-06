import { useEffect, useRef } from 'react';

export default function MazeMap({ maze, current, visited, scanned, onBacktrack, disabled }) {
  const marker = useRef(null);
  useEffect(() => { marker.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' }); }, [current]);
  const junctions = Object.values(maze.nodes).filter(n => n.type === 'junction');
  const visible = new Set([...visited, current, ...(maze.nodes[current].exits || [])]);
  const visibleNodes = Object.values(maze.nodes).filter(n => visible.has(n.id));
  const minX = Math.min(...visibleNodes.map(n=>n.position[0])) - 1;
  const minY = Math.min(...visibleNodes.map(n=>n.position[1])) - 1;
  const position = node => [(node.position[0]-minX)*180, (node.position[1]-minY)*155];
  const mapWidth = Math.max(1000,(Math.max(...visibleNodes.map(n=>n.position[0]))-minX+1)*180);
  const mapHeight = Math.max(540,(Math.max(...visibleNodes.map(n=>n.position[1]))-minY+1)*155);
  const [cx, cy] = position(maze.nodes[current]);
  return <section className="maze-stage" aria-label="Explored maze">
    <div className="map-toolbar"><span>RESEARCH COMPLEX</span><span><i className="legend-dot" /> Explored <i className="legend-dot unknown" /> Unknown</span></div>
    <div className="maze-scroll" tabIndex={0} aria-label="Maze map, scroll to explore">
      <svg className="maze-art" viewBox={`0 0 ${mapWidth} ${mapHeight}`} style={{ width: mapWidth, height: mapHeight }} role="img" aria-label="A branching lab maze. Blue rooms have been visited. Question marks conceal unexplored rooms.">
        <defs><pattern id="maze-grid" width="24" height="24" patternUnits="userSpaceOnUse"><path d="M 24 0 L 0 0 0 24" fill="none" stroke="currentColor" strokeWidth=".5" /></pattern></defs>
        <rect width={mapWidth} height={mapHeight} fill="url(#maze-grid)" opacity=".18" />
        {Array.from({length: Math.ceil(mapWidth/180)},(_,x)=>Array.from({length:Math.ceil(mapHeight/155)},(_,y)=>{
          const occupied = visibleNodes.some(n=>position(n)[0] === x*180 && position(n)[1] === y*155);
          return occupied ? null : <g key={`${x}-${y}`} className="fog-room"><rect x={x*180-35} y={y*155-33} width="70" height="62" rx="10"/><text x={x*180} y={y*155+5}>?</text></g>;
        }))}
        {junctions.filter(n => visible.has(n.id)).flatMap(n => n.exits.filter(id => visible.has(id)).map(id => {
          const [x,y] = position(n), [ex,ey] = position(maze.nodes[id]);
          const d = `M ${x} ${y} L ${x} ${(y+ey)/2} L ${ex} ${(y+ey)/2} L ${ex} ${ey}`;
          return <g key={`${n.id}-${id}`}><path d={d} className="corridor-wall"/><path d={d} className={`corridor ${visited.includes(id) ? 'explored' : ''}`}/></g>;
        }))}
        {Object.values(maze.nodes).filter(n => visible.has(n.id)).map(node => {
          const [x,y] = position(node), revealed = visited.includes(node.id), active = node.id === current;
          const choice = (maze.nodes[current].exits || []).indexOf(node.id);
          const label = revealed ? node.type === 'bomb' ? 'HAZARD' : node.type === 'deadend' ? 'DEAD END' : node.type === 'exit' ? 'DESTINATION' : node.id === 'j0' ? 'START' : `JUNCTION ${node.depth + 1}` : 'UNKNOWN';
          return <g key={node.id} className={`map-room ${active ? 'current' : ''} ${revealed ? node.type : 'hidden-room'}`}>
            <rect x={x-31} y={y-26} width="70" height="62" rx="12" className="room-shadow"/>
            <rect x={x-35} y={y-33} width="70" height="62" rx="10" className="room-floor"/>
            <path d={`M ${x-30} ${y+18} v -44 h 60 v 44`} className="room-wall"/>
            <text x={x} y={y+4} className="room-symbol">{active ? '' : !revealed ? '?' : node.type === 'bomb' ? '✹' : node.type === 'deadend' ? '↩' : node.type === 'exit' ? '⚑' : '·'}</text>
            <text x={x} y={y+52} className="room-label">{label}</text>
            {choice >= 0 && <g><rect x={x-13} y={y-65} width="26" height="24" rx="5" className="choice-tag"/><text x={x} y={y-49} className="choice-letter">{String.fromCharCode(65+choice)}</text></g>}
          </g>;
        })}
        <g ref={marker} transform={`translate(${cx},${cy})`} className="player-marker"><circle r="26" className="player-halo"/><rect x="-13" y="-18" width="26" height="28" rx="9" className="robot-body"/><rect x="-9" y="-12" width="18" height="11" rx="4" fill="#142951"/><circle cx="-4" cy="-7" r="2" fill="#a8e9ff"/><circle cx="4" cy="-7" r="2" fill="#a8e9ff"/><path d="M -7 11 v 6 M 7 11 v 6" stroke="var(--accent-blue)" strokeWidth="5"/><text y="-40" className="you-label">YOU</text></g>
        <text x={Math.min(cx+250, mapWidth-240)} y={mapHeight-25} className="fog-label">UNEXPLORED / DESTINATION UNKNOWN</text>
      </svg>
    </div>
    <div className="map-footer"><span><b>{scanned} rooms explored.</b> Safe does not mean closer to the exit.</span><button className="btn btn-secondary" onClick={onBacktrack} disabled={disabled || !maze.nodes[current].parent}>← Backtrack</button></div>
  </section>;
}
