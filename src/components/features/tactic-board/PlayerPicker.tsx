import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tool } from '@/lib/hooks/useTacticLogic';
import { PlayerTokenProps } from './PlayerToken';
import { Team } from './types';

const POSITION_GROUPS = [
  { label: 'Thủ môn', positions: ['GK'] },
  { label: 'Hậu vệ', positions: ['CB', 'LB', 'RB', 'LWB', 'RWB'] },
  { label: 'Tiền vệ', positions: ['DM', 'CM', 'AM'] },
  { label: 'Tiền đạo', positions: ['LW', 'RW', 'CF', 'ST'] },
];

interface PlayerPickerProps {
  positionToPlace: PlayerTokenProps['position'] | null;
  setPositionToPlace: (pos: PlayerTokenProps['position'] | null) => void;
  setActiveTool: (tool: Tool) => void;
  selectedTeam: Team;
  setSelectedTeam: (team: Team) => void;
}

export const PlayerPicker = ({ 
  positionToPlace, 
  setPositionToPlace,
  setActiveTool,
  selectedTeam,
  setSelectedTeam
}: PlayerPickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (pos: string) => {
    setPositionToPlace(pos as PlayerTokenProps['position']);
    setActiveTool('select');
    setIsOpen(false);
  };

  const handleClose = () => {
    setPositionToPlace(null);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-9 px-3 rounded-lg gap-1.5 transition-all flex items-center border border-transparent",
          positionToPlace 
            ? "bg-primary text-primary-foreground shadow-md" 
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <UserPlus className="w-4 h-4" />
        <span className="text-xs font-bold hidden sm:inline">
          {positionToPlace || 'Thêm'}
        </span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </motion.button>

      {/* Popover */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px]" 
              onClick={() => setIsOpen(false)} 
            />
            
            {/* Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: "spring", duration: 0.3 }}
              className="absolute top-full right-0 mt-2 z-[70] w-[300px] sm:w-[340px] bg-gray-950/95 backdrop-blur-xl border-2 border-violet-500/30 rounded-2xl shadow-2xl p-4 origin-top-right"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  THÊM CẦU THỦ
                </h4>
                {positionToPlace && (
                  <button 
                    onClick={handleClose}
                    className="text-sm font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 hover:bg-red-500/10 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Hủy
                  </button>
                )}
              </div>
              
              {/* Team Tabs */}
              <div className="flex gap-2 mb-4 p-1 bg-gray-900/50 rounded-lg">
                <button
                  onClick={() => setSelectedTeam('home')}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                    selectedTeam === 'home'
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  🏠 Đội nhà
                </button>
                <button
                  onClick={() => setSelectedTeam('away')}
                  className={cn(
                    "flex-1 py-2 rounded-md text-sm font-bold transition-all",
                    selectedTeam === 'away'
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  )}
                >
                  ✈️ Đội khách
                </button>
              </div>
              
              <div className="space-y-3">
                {POSITION_GROUPS.map((group) => (
                  <div key={group.label}>
                    <p className="text-xs font-bold text-gray-400 mb-2">{group.label}</p>
                    <div className="grid grid-cols-4 gap-2">
                      {group.positions.map((pos) => (
                        <motion.button
                          key={pos}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleSelect(pos)}
                          className={cn(
                            "h-11 flex items-center justify-center rounded-lg text-sm font-bold border-2 transition-all",
                            positionToPlace === pos 
                              ? selectedTeam === 'home'
                                ? "bg-blue-500 text-white border-blue-400 shadow-lg shadow-blue-500/30"
                                : "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-500/30"
                              : "bg-gray-800/50 border-gray-700 text-gray-200 hover:bg-gray-700/70 hover:border-gray-600"
                          )}
                        >
                          {pos}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="text-xs text-gray-400 mt-4 pt-3 border-t border-gray-800 flex gap-2">
                 <span className="shrink-0">💡</span>
                 <span>Chọn đội, vị trí rồi click vào sân để đặt</span>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
