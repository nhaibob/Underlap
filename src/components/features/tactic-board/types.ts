import { PlayerTokenProps } from './PlayerToken';
import { ArrowColor, ArrowStyle, ArrowType } from '@/lib/hooks/useTacticLogic';

export type Team = 'home' | 'away';

export interface Player {
  id: string;
  position: PlayerTokenProps['position'];
  label: string;
  pos: { x: number; y: number };
  team?: Team; // defaults to 'home'
}

export interface Ball {
  id: string;
  pos: { x: number; y: number };
}

export interface Arrow {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  color: ArrowColor; 
  style: ArrowStyle;
  type: ArrowType;
  controlPoint?: { x: number; y: number }; 
}

export interface Area {
  id: string;
  x: number; 
  y: number; 
  w: number; 
  h: number; 
  color: string;
}

export const AREA_COLORS: ArrowColor[] = ['#6C5CE7', '#FF7F50', '#00CED1', '#FF6B81', '#FDCB6E', '#54A0FF'];
