// src/components/features/tactic-board/TacticBoard.tsx
"use client"; 
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { PlayerToken } from './PlayerToken';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { Tool, ArrowColor, ArrowStyle, ArrowType } from './CreateTacticModal';
import { v4 as uuidv4 } from 'uuid';
import { PlayerTokenProps } from './PlayerToken'; 

// --- CÁC IMPORT MỚI ĐỂ THÊM TÍNH NĂNG "COPY SNAPSHOT" ---
import { Button } from '@/components/ui/Button';
import { Copy } from 'lucide-react';
import { useCommentClipboard } from '@/lib/hooks/useCommentClipboard';
import { toPng } from 'html-to-image';
// --------------------------------------------------------

// (Hằng số màu)
const ARROW_COLORS: ArrowColor[] = ['#6C5CE7', '#FF7F50', '#00CED1'];

// (Export 'Player' interface)
export interface Player {
  id: string;
  position: PlayerTokenProps['position'];
  label: string;
  pos: { x: number; y: number };
}
// (Export 'Arrow' interface)
export interface Arrow {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: ArrowColor; 
  style: ArrowStyle;
  type: ArrowType;
}

// (Component FootballPitchBackground giữ nguyên)
const FootballPitchBackground = () => (
    // ... (code SVG giữ nguyên)
  <svg 
    className="absolute top-0 left-0 w-full h-full" 
    viewBox="0 0 600 400" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect x="0" y="0" width="600" height="400" fill="#1C3D2E" /> 
    <rect x="1.5" y="1.5" width="597" height="397" rx="4" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" />
    <line x1="300" y1="2" x2="300" y2="398" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" />
    <circle cx="300" cy="200" r="50" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" />
    <circle cx="300" cy="200" r="2" fill="#A7CCB7" fillOpacity="0.6" />
    <rect x="1.5" y="80" width="60" height="240" rx="2" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" />
    <rect x="1.5" y="140" width="20" height="120" rx="1" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" />
    <circle cx="45" cy="200" r="2" fill="#A7CCB7" fillOpacity="0.6" />
    <rect x="538.5" y="80" width="60" height="240" rx="2" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" />
    <rect x="578.5" y="140" width="20" height="120" rx="1" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" />
    <circle cx="555" cy="200" r="2" fill="#A7CCB7" fillOpacity="0.6" />
    <path d="M60 140 C80 160, 80 240, 60 260" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" fill="none"/>
    <path d="M540 140 C520 160, 520 240, 540 260" stroke="#A7CCB7" strokeOpacity="0.4" strokeWidth="3" fill="none"/>
  </svg>
);

// (Component DraggablePlayerToken - Giữ nguyên)
function DraggablePlayerToken({ 
  player, 
  activeTool, 
  selectedPlayerId, 
  setSelectedPlayerId 
}: { 
  player: Player, 
  activeTool: Tool, 
  selectedPlayerId: string | null, 
  setSelectedPlayerId: React.Dispatch<React.SetStateAction<string | null>> 
}) {
    // ... (logic giữ nguyên)
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.id,
    data: { isPaletteToken: false },
    disabled: activeTool !== 'move',
  });
  
  const isSelected = selectedPlayerId === player.id; 
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 20 } : undefined;
  
  const handleClick = (e: React.MouseEvent) => {
    if (activeTool === 'select') {
      setSelectedPlayerId?.(player.id); 
      e.stopPropagation();
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={{ 
        position: 'absolute', 
        left: player.pos.x, 
        top: player.pos.y, 
        ...style,
        cursor: activeTool === 'move' ? 'grab' : (activeTool === 'select' ? 'pointer' : 'default'),
        zIndex: 20
      }} 
      {...listeners} 
      {...attributes}
      onClick={handleClick}
    >
      <PlayerToken 
        position={player.position} 
        label={player.label}
        className={cn(isSelected && "shadow-lg shadow-primary ring-2 ring-primary")} 
      />
    </div>
  );
}

// (Component DrawingLayer - Giữ nguyên)
const DrawingLayer = ({ 
    // ... (props và logic giữ nguyên)
  arrows, 
  setArrows, 
  activeTool,
  currentArrowColor,
  currentArrowStyle,
  currentArrowType, 
}: { 
  arrows: Arrow[], 
  setArrows: React.Dispatch<React.SetStateAction<Arrow[]>>, 
  activeTool: Tool,
  currentArrowColor: ArrowColor,
  currentArrowStyle: ArrowStyle,
  currentArrowType: ArrowType,
}) => {
  const [drawingArrow, setDrawingArrow] = useState<Arrow | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getPos = (e: React.MouseEvent | React.TouchEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Chuyển đổi tọa độ click/touch thành tọa độ tương đối bên trong SVG (với viewBox 600x400)
    const svgX = (clientX - rect.left) * (600 / rect.width);
    const svgY = (clientY - rect.top) * (400 / rect.height);
    
    return { x: svgX, y: svgY };
  };

  // HÀM CHUYỂN ĐỔI ĐƯỜNG THẲNG SANG ĐƯỜNG CONG BEZIER
  const getPathData = (from: { x: number; y: number }, to: { x: number; y: number }, type: ArrowType) => {
    if (type === 'straight') {
      return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    }
    
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2;
    const curveIntensity = 30;
    
    const angle = Math.atan2(to.y - from.y, to.x - from.x) + Math.PI / 2;
    
    const controlX = midX + Math.cos(angle) * curveIntensity;
    const controlY = midY + Math.sin(angle) * curveIntensity;

    return `M ${from.x} ${from.y} Q ${controlX} ${controlY}, ${to.x} ${to.y}`;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool !== 'draw') return;
    const pos = getPos(e);
    setDrawingArrow({
      id: 'live-preview',
      from: pos,
      to: pos,
      color: currentArrowColor,
      style: currentArrowStyle,
      type: currentArrowType,
    });
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (activeTool !== 'draw' || !drawingArrow) return;
    // Ngăn chặn hành vi cuộn trang trên di động khi đang vẽ
    e.preventDefault(); 
    const pos = getPos(e);
    setDrawingArrow(prev => ({ ...prev!, to: pos }));
  };

  const handleMouseUp = () => {
    if (activeTool !== 'draw' || !drawingArrow) return;
    const distance = Math.hypot(drawingArrow.to.x - drawingArrow.from.x, drawingArrow.to.y - drawingArrow.from.y);
    if (distance > 10) {
      setArrows(prev => [...prev, { ...drawingArrow, id: uuidv4() }]);
    }
    setDrawingArrow(null);
  };

  const handleArrowClick = (id: string) => {
    if (activeTool === 'erase') {
      setArrows(prev => prev.filter(a => a.id !== id));
    }
  };
  
  const getDashArray = (style: ArrowStyle): string | undefined => {
      return style === 'dashed' ? '8, 8' : undefined;
  };
  
  const getMarkerId = (color: ArrowColor): string => {
      // Đảm bảo các màu này khớp với ARROW_COLORS
      const colorMap: Record<ArrowColor, string> = {
          '#6C5CE7': 'primary',
          '#FF7F50': 'secondary',
          '#00CED1': 'tertiary',
          // Bạn có thể thêm 2 màu còn lại nếu cần
          '#FF6B81': 'attack', 
          '#54A0FF': 'defend',
      };
      // Tìm key khớp (hoặc dùng màu đầu tiên làm mặc định)
      const key = colorMap[color] || 'primary';
      return `arrowhead-${key}`;
  };

  return (
    <svg
      ref={svgRef}
      className="absolute top-0 left-0 w-full h-full z-10"
      viewBox="0 0 600 400" // THÊM MỚI: Đảm bảo SVG này khớp với viewBox của nền
      preserveAspectRatio="none" // THÊM MỚI: Đảm bảo tọa độ khớp
      style={{
        cursor: activeTool === 'draw' ? 'crosshair' : (activeTool === 'erase' ? 'cell' : 'default'),
        pointerEvents: activeTool === 'draw' || activeTool === 'erase' ? 'auto' : 'none' 
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <defs>
        {/* Định nghĩa nhiều marker cho các màu khác nhau */}
        {ARROW_COLORS.map(color => (
            <marker 
                key={color} 
                id={getMarkerId(color)} 
                viewBox="0 0 10 10" 
                refX="8" 
                refY="5" 
                markerWidth="6" 
                markerHeight="6" 
                orient="auto-start-reverse"
            >
                <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
            </marker>
        ))}
      </defs>

      {/* Render các mũi tên đã hoàn thành (Dùng <path>) */}
      {arrows.map(arrow => (
        <path
          key={arrow.id}
          d={getPathData(arrow.from, arrow.to, arrow.type)}
          stroke={arrow.color}
          strokeWidth="4"
          fill="none" 
          markerEnd={`url(#${getMarkerId(arrow.color)})`}
          strokeDasharray={getDashArray(arrow.style)}
          onClick={() => handleArrowClick(arrow.id)}
          className={cn(activeTool === 'erase' && "cursor-cell hover:stroke-red-500")}
        />
      ))}
      
      {/* Render mũi tên đang vẽ (live preview) */}
      {drawingArrow && (
        <path
          d={getPathData(drawingArrow.from, drawingArrow.to, drawingArrow.type)}
          stroke={drawingArrow.color}
          strokeWidth="4"
          fill="none"
          markerEnd={`url(#${getMarkerId(drawingArrow.color)})`}
          strokeDasharray={getDashArray(drawingArrow.style)}
          opacity={0.8} // Thêm độ mờ để dễ phân biệt
        />
      )}
    </svg>
  );
};
// ==========================================================


// (Props của TacticBoard giữ nguyên)
interface TacticBoardProps {
  variant?: 'full' | 'thumbnail';
  players?: Player[];
  setPlayers?: React.Dispatch<React.SetStateAction<Player[]>>;
  arrows?: Arrow[];
  setArrows?: React.Dispatch<React.SetStateAction<Arrow[]>>;
  activeTool?: Tool;
  boardRect?: DOMRect | null;
  selectedPlayerId?: string | null; 
  setSelectedPlayerId?: React.Dispatch<React.SetStateAction<string | null>>;
  onBoardClick?: (pos: { x: number, y: number }) => void;
  positionToPlace?: PlayerTokenProps['position'] | null;
  currentArrowColor?: ArrowColor; 
  currentArrowStyle?: ArrowStyle;
  currentArrowType?: ArrowType; 
}

// (COMPONENT TacticBoard - ĐÃ CẬP NHẬT)
export const TacticBoard = ({ 
  variant = 'full', 
  players,
  arrows,
  setArrows,
  activeTool,
  selectedPlayerId,
  setSelectedPlayerId,
  onBoardClick,
  positionToPlace,
  currentArrowColor,
  currentArrowStyle,
  currentArrowType, 
}: TacticBoardProps) => {

  const { setNodeRef } = useDroppable({
    id: 'tactic-board-droppable-area',
  });

  // Giữ ref gốc của bạn
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Ref này kết hợp cả ref của useDroppable và ref của bạn
  const setCombinedRef = (node: HTMLDivElement | null) => {
    setNodeRef(node);
    (boardRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  // --- LOGIC "COPY SNAPSHOT" (THÊM MỚI) ---
  const { setClipboardImage } = useCommentClipboard();
  // const { toast } = useToast(); // (Tùy chọn: nếu bạn dùng shadcn toast)

  /**
   * Chụp ảnh DOM node được gắn 'boardRef'
   * và trả về một chuỗi data:image/png;base64,...
   */
  const exportToImage = async (): Promise<string> => {
    if (!boardRef.current) {
      throw new Error("TacticBoard ref không tồn tại.");
    }
    
    // Sử dụng html-to-image để chuyển đổi DOM node thành PNG
    const dataUrl = await toPng(boardRef.current, { 
        cacheBust: true,
        // Lọc ra các phần tử không muốn chụp (chính nút "Copy Snapshot")
        filter: (node) => {
          // Đảm bảo node là một Element trước khi kiểm tra id
          if (node instanceof HTMLElement) {
            // ID này phải khớp với ID bạn đặt cho wrapper của nút
            return node.id !== 'snapshot-button-wrapper'; 
          }
          return true;
        }
    });
    return dataUrl;
  };

  // Hàm xử lý khi bấm nút "Copy Snapshot"
  const handleCopySnapshot = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài board
    try {
      const imageData = await exportToImage();
      setClipboardImage(imageData);
      alert("Đã sao chép Snapshot! Bạn có thể dán vào bình luận.");
      
    } catch (error) {
      console.error("Lỗi khi sao chép snapshot:", error);
      alert("Lỗi khi sao chép snapshot.");
    }
  };
  // --- KẾT THÚC LOGIC "COPY SNAPSHOT" ---
  
  
  // (Logic handleBoardClick giữ nguyên)
  const handleBoardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    
    // Ngăn chặn click vào PlayerToken
    const isPlayerTokenClick = (e.target as HTMLElement).closest('[data-dnd-kit-draggable]');
    // Ngăn chặn click vào nút snapshot
    const isSnapshotButtonClick = (e.target as HTMLElement).closest('#snapshot-button-wrapper');

    if (isPlayerTokenClick || isSnapshotButtonClick) {
        return; 
    }

    // 1. Logic BỎ HIGHLIGHT
    if (!positionToPlace && (activeTool === 'select' || activeTool === 'move')) { 
      setSelectedPlayerId?.(null); 
    }
    
    // 2. LOGIC GỌI CLICK TO PLACE (Chỉ gọi khi có vị trí đang chờ đặt)
    if (positionToPlace && boardRef.current) {
        
        const rect = boardRef.current.getBoundingClientRect();
        
        // Lấy tọa độ click tương đối so với board
        const relativeX = e.clientX - rect.left;
        const relativeY = e.clientY - rect.top;
        
        // Chuyển đổi sang tọa độ của token (player.pos)
        // Token có kích thước 40x40 (giả định), ta cần căn giữa
        const centeredX = relativeX - 20; 
        const centeredY = relativeY - 20;
        
        onBoardClick?.({ x: centeredX, y: centeredY });
    }
  };

  return (
    <div 
      ref={setCombinedRef} // Dùng ref kết hợp
      className={cn(
        "relative w-full aspect-[600/400] overflow-hidden", // Sử dụng tỷ lệ của SVG
        "bg-panel border border-white/10 rounded-lg", 
        variant === 'thumbnail' && "border-none"
      )}
      onClick={handleBoardClick} // Bắt sự kiện click
    >
      {/* --- NÚT COPY SNAPSHOT (THÊM MỚI) --- */}
      {/* Chúng ta đặt nó ở đây, bên trong div có ref, 
        nhưng hàm exportToImage sẽ lọc nó ra nhờ có id.
        Chỉ hiển thị ở 'full' variant.
      */}
      {variant === 'full' && (
        <div id="snapshot-button-wrapper" className="absolute top-2 right-2 z-30">
          <Button variant="outline" size="sm" onClick={handleCopySnapshot}>
            <Copy className="h-4 w-4 mr-2" />
            Copy Snapshot
          </Button>
        </div>
      )}
      {/* --- KẾT THÚC NÚT COPY --- */}

      <FootballPitchBackground />
      
      {variant === 'full' && players && arrows && activeTool && (
        <DrawingLayer 
          arrows={arrows!} 
          setArrows={setArrows!} 
          activeTool={activeTool} 
          currentArrowColor={currentArrowColor!}
          currentArrowStyle={currentArrowStyle!}
          currentArrowType={currentArrowType!}
        />
      )}
      
      {/* Lớp 3: Cầu thủ */}
      {variant === 'full' && players && (
        <div className="z-20"> {/* Wrapper để đảm bảo z-index */}
            {players.map((player) => (
            <DraggablePlayerToken 
                key={player.id} 
                player={player} 
                activeTool={activeTool!}
                selectedPlayerId={selectedPlayerId!}
                setSelectedPlayerId={setSelectedPlayerId!}
            />
            ))}
        </div>
      )}
      
      {variant === 'thumbnail' && (
        <div className="flex items-center justify-center h-full">
          <p className="text-text-secondary text-xs">
            Tactic Board Preview
          </p>
        </div>
      )}
    </div>
  );
};