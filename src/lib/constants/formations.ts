import { PlayerTokenProps } from '@/components/features/tactic-board/PlayerToken';

export interface FormationPlayer {
  position: PlayerTokenProps['position'];
  x: number; // 0-600 coordinate
  y: number; // 0-400 coordinate
}

export interface Formation {
  name: string;
  players: FormationPlayer[];
}

// Field dimensions: 600x400
// Goal is on the left (x=0), attacking right
export const FORMATIONS: Record<string, Formation> = {
  '4-3-3': {
    name: '4-3-3',
    players: [
      { position: 'GK', x: 40, y: 200 },
      // Defense
      { position: 'LB', x: 120, y: 60 },
      { position: 'CB', x: 100, y: 140 },
      { position: 'CB', x: 100, y: 260 },
      { position: 'RB', x: 120, y: 340 },
      // Midfield
      { position: 'CM', x: 230, y: 120 },
      { position: 'CDM', x: 200, y: 200 },
      { position: 'CM', x: 230, y: 280 },
      // Attack
      { position: 'LW', x: 400, y: 80 },
      { position: 'ST', x: 450, y: 200 },
      { position: 'RW', x: 400, y: 320 },
    ]
  },
  '4-4-2': {
    name: '4-4-2',
    players: [
      { position: 'GK', x: 40, y: 200 },
      // Defense
      { position: 'LB', x: 120, y: 60 },
      { position: 'CB', x: 100, y: 150 },
      { position: 'CB', x: 100, y: 250 },
      { position: 'RB', x: 120, y: 340 },
      // Midfield
      { position: 'LM', x: 250, y: 60 },
      { position: 'CM', x: 220, y: 150 },
      { position: 'CM', x: 220, y: 250 },
      { position: 'RM', x: 250, y: 340 },
      // Attack
      { position: 'ST', x: 420, y: 150 },
      { position: 'ST', x: 420, y: 250 },
    ]
  },
  '3-5-2': {
    name: '3-5-2',
    players: [
      { position: 'GK', x: 40, y: 200 },
      // Defense (3 CBs)
      { position: 'CB', x: 100, y: 100 },
      { position: 'CB', x: 80, y: 200 },
      { position: 'CB', x: 100, y: 300 },
      // Midfield (5)
      { position: 'LWB', x: 200, y: 50 },
      { position: 'CM', x: 220, y: 140 },
      { position: 'CDM', x: 180, y: 200 },
      { position: 'CM', x: 220, y: 260 },
      { position: 'RWB', x: 200, y: 350 },
      // Attack
      { position: 'ST', x: 400, y: 150 },
      { position: 'ST', x: 400, y: 250 },
    ]
  },
  '4-2-3-1': {
    name: '4-2-3-1',
    players: [
      { position: 'GK', x: 40, y: 200 },
      // Defense
      { position: 'LB', x: 120, y: 60 },
      { position: 'CB', x: 100, y: 150 },
      { position: 'CB', x: 100, y: 250 },
      { position: 'RB', x: 120, y: 340 },
      // Double pivot
      { position: 'CDM', x: 190, y: 140 },
      { position: 'CDM', x: 190, y: 260 },
      // Attacking mid
      { position: 'LM', x: 300, y: 80 },
      { position: 'CAM', x: 320, y: 200 },
      { position: 'RM', x: 300, y: 320 },
      // Striker
      { position: 'ST', x: 450, y: 200 },
    ]
  },
  '5-3-2': {
    name: '5-3-2',
    players: [
      { position: 'GK', x: 40, y: 200 },
      // Defense (5)
      { position: 'LWB', x: 140, y: 40 },
      { position: 'CB', x: 100, y: 120 },
      { position: 'CB', x: 80, y: 200 },
      { position: 'CB', x: 100, y: 280 },
      { position: 'RWB', x: 140, y: 360 },
      // Midfield
      { position: 'CM', x: 230, y: 120 },
      { position: 'CM', x: 200, y: 200 },
      { position: 'CM', x: 230, y: 280 },
      // Attack
      { position: 'ST', x: 400, y: 150 },
      { position: 'ST', x: 400, y: 250 },
    ]
  }
};

export const FORMATION_KEYS = Object.keys(FORMATIONS) as (keyof typeof FORMATIONS)[];
