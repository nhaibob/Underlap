// src/lib/constants.ts

// 1. Cập nhật Type ArrowColor thêm màu vàng (#FDCB6E)
export type ArrowColor = '#6C5CE7' | '#FF7F50' | '#00CED1' | '#FF6B81' | '#54A0FF' | '#FDCB6E';

// Định nghĩa các Vị trí Cầu thủ chi tiết
export const POSITION_OPTIONS = [
  { value: 'GK', label: 'GK', category: 'GK' },
  { value: 'RB', label: 'RB', category: 'DEF' },
  { value: 'LB', label: 'LB', category: 'DEF' },
  { value: 'CB', label: 'CB', category: 'DEF' },
  { value: 'LWB', label: 'LWB', category: 'DEF' },
  { value: 'RWB', label: 'RWB', category: 'DEF' },
  { value: 'CDM', label: 'CDM', category: 'MID' },
  { value: 'DM', label: 'DM', category: 'MID' },
  { value: 'CM', label: 'CM', category: 'MID' },
  { value: 'LM', label: 'LM', category: 'MID' },
  { value: 'RM', label: 'RM', category: 'MID' },
  { value: 'CAM', label: 'CAM', category: 'MID' },
  { value: 'AM', label: 'AM', category: 'MID' },
  { value: 'RW', label: 'RW', category: 'FWD' },
  { value: 'LW', label: 'LW', category: 'FWD' },
  { value: 'CF', label: 'CF', category: 'FWD' },
  { value: 'ST', label: 'ST', category: 'FWD' },
];

// 2. Thêm màu AREA vào danh sách
export const ARROW_COLORS = {
  PRIMARY: '#6C5CE7', // Tím
  SECONDARY: '#FF7F50', // Cam
  TERTIARY: '#00CED1', // Xanh ngọc
  ATTACK: '#FF6B81', // Đỏ
  DEFEND: '#54A0FF', // Xanh dương
  AREA: '#FDCB6E',   // Vàng (Dùng cho Highlight)
};

export const POSITION_CATEGORY_COLORS: Record<string, { fill: string, stroke: string }> = {
  GK: { fill: 'fill-red-500/20', stroke: 'stroke-red-500' },
  DEF: { fill: 'fill-blue-500/20', stroke: 'stroke-blue-500' },
  MID: { fill: 'fill-yellow-400/20', stroke: 'stroke-yellow-400' },
  FWD: { fill: 'fill-rose-500/20', stroke: 'stroke-rose-500' },
};

export const TOOL_OPTIONS = [
  { id: 'select', label: 'Chọn', icon: 'Cursor' },
  { id: 'move', label: 'Di chuyển', icon: 'Move' },
  { id: 'draw', label: 'Vẽ', icon: 'Pencil' },
  { id: 'area', label: 'Vùng', icon: 'Square' }, // Cập nhật thêm icon nếu cần
  { id: 'erase', label: 'Tẩy', icon: 'Eraser' },
];

export const ALL_POSITIONS = POSITION_OPTIONS.map(p => p.value) as (typeof POSITION_OPTIONS[number]['value'])[];

// 3. Bỏ .slice(0,3) để lấy tất cả các màu đã định nghĩa
export const ALL_ARROW_COLOR_VALUES = Object.values(ARROW_COLORS) as ArrowColor[];