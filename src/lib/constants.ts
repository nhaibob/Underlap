// src/lib/constants.ts

// Định nghĩa kiểu ArrowColor (Dùng cho Type safety)
export type ArrowColor = '#6C5CE7' | '#FF7F50' | '#00CED1' | '#FF6B81' | '#54A0FF';

// Định nghĩa các Vị trí Cầu thủ chi tiết
export const POSITION_OPTIONS = [
  { value: 'GK', label: 'GK', category: 'GK' },
  { value: 'RB', label: 'RB', category: 'DEF' },
  { value: 'LB', label: 'LB', category: 'DEF' },
  { value: 'CB', label: 'CB', category: 'DEF' },
  { value: 'LWB', label: 'LWB', category: 'DEF' },
  { value: 'RWB', label: 'RWB', category: 'DEF' },
  { value: 'DM', label: 'DM', category: 'MID' },
  { value: 'CM', label: 'CM', category: 'MID' },
  { value: 'AM', label: 'AM', category: 'MID' },
  { value: 'RW', label: 'RW', category: 'FWD' },
  { value: 'LW', label: 'LW', category: 'FWD' },
  { value: 'CF', label: 'CF', category: 'FWD' },
  { value: 'ST', label: 'ST', category: 'FWD' },
];

// Định nghĩa màu sắc cho các đường nét (Mũi tên)
export const ARROW_COLORS = {
  PRIMARY: '#6C5CE7', // Tím (Accent chính)
  SECONDARY: '#FF7F50', // Cam (Accent phụ)
  TERTIARY: '#00CED1', // Xanh ngọc
  ATTACK: '#FF6B81', // Đỏ (Tấn công/Nguy hiểm)
  DEFEND: '#54A0FF', // Xanh dương (Phòng ngự/Ổn định)
};

// === SỬA LỖI #2: CHIA TÁCH VÀ DÙNG CLASS TAILWIND AN TOÀN ===
export const POSITION_CATEGORY_COLORS: Record<string, { fill: string, stroke: string }> = {
  GK: { fill: 'fill-red-500/20', stroke: 'stroke-red-500' },
  DEF: { fill: 'fill-blue-500/20', stroke: 'stroke-blue-500' },
  MID: { fill: 'fill-yellow-400/20', stroke: 'stroke-yellow-400' },
  FWD: { fill: 'fill-rose-500/20', stroke: 'stroke-rose-500' },
};
// ... (các phần khác giữ nguyên)

// PHẦN EXPORT CÁC HẰNG SỐ CẦN THIẾT CHO TYPESCRIPT
export const TOOL_OPTIONS = [
  { id: 'select', label: 'Chọn', icon: 'Cursor' },
  { id: 'move', label: 'Di chuyển', icon: 'Move' },
  { id: 'draw', label: 'Vẽ', icon: 'Pencil' },
  { id: 'erase', label: 'Tẩy', icon: 'Eraser' },
];

export const ALL_POSITIONS = POSITION_OPTIONS.map(p => p.value) as (typeof POSITION_OPTIONS[number]['value'])[];
export const ALL_ARROW_COLOR_VALUES = Object.values(ARROW_COLORS).slice(0, 3) as ArrowColor[];