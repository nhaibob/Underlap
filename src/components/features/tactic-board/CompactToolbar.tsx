"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointer2, PenTool, SquareDashed, Eraser, 
  Undo2, Redo2, Trash2, ChevronDown, Circle, Layers, Eye, EyeOff,
  Download, LayoutGrid
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool, ArrowColor, ArrowStyle, LayerVisibility } from '@/lib/hooks/useTacticLogic';
import { FORMATION_KEYS, FORMATIONS } from '@/lib/constants/formations';
import { PlayerTokenProps } from './PlayerToken';
import { Team } from './types';
import { ToolButton, Divider } from './ToolButton';
import { PlayerPicker } from './PlayerPicker';
import { DrawingOptions } from './DrawingOptions';

interface CompactToolbarProps {
  activeTool: Tool;
  setActiveTool: (tool: Tool) => void;
  arrowColor: ArrowColor;
  setArrowColor: (color: ArrowColor) => void;
  arrowStyle: ArrowStyle;
  setArrowStyle: (style: ArrowStyle) => void;
  positionToPlace: PlayerTokenProps['position'] | null;
  setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onClearAll: () => void;
  selectedTeam: Team;
  setSelectedTeam: (team: Team) => void;
  isPlacingBall: boolean;
  setIsPlacingBall: (placing: boolean) => void;
  layerVisibility: LayerVisibility;
  toggleLayerVisibility: (layer: keyof LayerVisibility) => void;
  loadFormation?: (formationKey: string, team?: Team) => void;
  onExport?: () => void;
}

export const CompactToolbar = ({
  activeTool, setActiveTool,
  arrowColor, setArrowColor,
  arrowStyle, setArrowStyle,
  positionToPlace, setPositionToPlace,
  undo, redo, canUndo, canRedo,
  onClearAll,
  selectedTeam, setSelectedTeam,
  isPlacingBall, setIsPlacingBall,
  layerVisibility, toggleLayerVisibility,
  loadFormation, onExport
}: CompactToolbarProps) => {
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const [showFormationMenu, setShowFormationMenu] = useState(false);
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-5 py-2.5 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl z-50">
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-0.5">
          <ToolButton icon={Undo2} onClick={undo} disabled={!canUndo} title="Hoàn tác (Ctrl+Z)" />
          <ToolButton icon={Redo2} onClick={redo} disabled={!canRedo} title="Làm lại (Ctrl+Y)" />
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolButton icon={MousePointer2} isActive={activeTool === 'select'} onClick={() => setActiveTool('select')} title="Chọn (V)" />
        </div>

        <Divider />

        <div className="flex items-center gap-0.5">
          <ToolButton icon={PenTool} isActive={activeTool === 'draw'} onClick={() => setActiveTool('draw')} title="Vẽ mũi tên (P)" />
          <ToolButton icon={SquareDashed} isActive={activeTool === 'area'} onClick={() => setActiveTool('area')} title="Vẽ vùng (A)" />
          <ToolButton icon={Eraser} isActive={activeTool === 'erase'} onClick={() => setActiveTool('erase')} title="Tẩy (E)" />
        </div>

        <DrawingOptions arrowColor={arrowColor} setArrowColor={setArrowColor} arrowStyle={arrowStyle} setArrowStyle={setArrowStyle} activeTool={activeTool} />
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={cn(
              "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
              showLayerMenu ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title="Layer (Hiển thị)"
          >
            <Layers className="w-4 h-4" />
          </motion.button>
          
          <AnimatePresence>
            {showLayerMenu && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60]" onClick={() => setShowLayerMenu(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  className="absolute top-full right-0 mt-2 z-[70] w-48 bg-gray-950/95 backdrop-blur-xl border border-gray-700 rounded-xl shadow-xl p-2 origin-top-right"
                >
                  <p className="text-xs font-bold text-gray-400 mb-2 px-2">Hiển thị layer</p>
                  
                  <button onClick={() => toggleLayerVisibility('home')} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <span className="text-sm text-white flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500" />Đội nhà</span>
                    {layerVisibility.home ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                  </button>
                  
                  <button onClick={() => toggleLayerVisibility('away')} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <span className="text-sm text-white flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-purple-600" />Đội khách</span>
                    {layerVisibility.away ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                  </button>
                  
                  <button onClick={() => toggleLayerVisibility('ball')} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
                    <span className="text-sm text-white flex items-center gap-2"><Circle className="w-3 h-3 fill-white" />Bóng</span>
                    {layerVisibility.ball ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-500" />}
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setIsPlacingBall(!isPlacingBall);
            if (!isPlacingBall) setActiveTool('select');
          }}
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center transition-colors",
            isPlacingBall ? "bg-amber-500 text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
          title="Đặt bóng"
        >
          <Circle className="w-4 h-4 fill-current" />
        </motion.button>
        
        <PlayerPicker positionToPlace={positionToPlace} setPositionToPlace={setPositionToPlace} setActiveTool={setActiveTool} selectedTeam={selectedTeam} setSelectedTeam={setSelectedTeam} />
        
        {loadFormation && (
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFormationMenu(!showFormationMenu)}
              className={cn(
                "h-9 px-2 rounded-lg flex items-center gap-1 transition-colors",
                showFormationMenu ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
              title="Đội hình mẫu"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-xs font-medium hidden sm:inline">Đội hình</span>
              <ChevronDown className="w-3 h-3" />
            </motion.button>
            
            <AnimatePresence>
              {showFormationMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFormationMenu(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 z-50 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-xl min-w-[280px]"
                  >
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <div className="text-xs text-blue-400 px-2 py-1 mb-1 font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500" />Đội nhà</div>
                        {FORMATION_KEYS.map((key) => (
                          <button key={`home-${key}`} onClick={() => { loadFormation(key, 'home'); setShowFormationMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors text-left"><span className="text-sm text-white">{FORMATIONS[key].name}</span></button>
                        ))}
                      </div>
                      <div className="w-px bg-white/10" />
                      <div className="flex-1">
                        <div className="text-xs text-orange-400 px-2 py-1 mb-1 font-medium flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" />Đội khách</div>
                        {FORMATION_KEYS.map((key) => (
                          <button key={`away-${key}`} onClick={() => { loadFormation(key, 'away'); setShowFormationMenu(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-orange-500/20 transition-colors text-left"><span className="text-sm text-white">{FORMATIONS[key].name}</span></button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}
        
        {onExport && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onExport} className="h-9 px-2 rounded-lg flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Xuất ảnh (PNG)">
            <Download className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">Xuất</span>
          </motion.button>
        )}
        
        <ToolButton icon={Trash2} onClick={onClearAll} title="Xóa tất cả" variant="danger" />
      </div>
    </div>
  );
};
