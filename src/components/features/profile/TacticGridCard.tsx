import React from 'react';
import { Eye, Heart } from 'lucide-react';

interface TacticGridCardProps {
  id: string;
  title: string;
  formation: string;
  views: number;
  likes: number;
  onClick?: () => void;
}

export const TacticGridCard = ({ 
  title, 
  formation, 
  views, 
  likes,
  onClick
}: TacticGridCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="group relative aspect-[4/3] rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-950 border border-white/10 overflow-hidden cursor-pointer hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/10"
    >
      {/* Field pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-4 border border-white/50 rounded" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 border border-white/50 rounded-full" />
      </div>
      
      {/* Overlay info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
        <h3 className="font-medium text-white text-sm line-clamp-1">{title}</h3>
        <div className="flex items-center gap-3 text-xs text-white/70 mt-1">
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {views}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            {likes}
          </span>
        </div>
      </div>
      
      {/* Formation badge */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-[10px] font-bold text-white">
        {formation}
      </div>
    </div>
  );
};
