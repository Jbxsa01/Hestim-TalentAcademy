import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { motion } from 'motion/react';

interface TalentProps {
  talent: {
    id: string;
    title: string;
    description: string;
    category: string;
    imageUrl: string;
    rating: number;
    reviewCount: number;
    trainerId: string;
    trainerName?: string;
    skills?: string[];
  };
}

const TalentCard: React.FC<TalentProps> = ({ talent }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-border-subtle flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={talent.imageUrl || `https://picsum.photos/seed/${talent.id}/400/300`}
          alt={talent.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/10">
            {talent.category}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-black text-text-main group-hover:text-primary transition-colors line-clamp-1 leading-tight tracking-tight">{talent.title}</h3>
          <div className="flex items-center space-x-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 flex-shrink-0">
            <Star className="w-3 h-3 fill-warning text-warning" />
            <span className="text-[10px] font-black text-warning leading-none">{talent.rating?.toFixed(1) || '5.0'}</span>
          </div>
        </div>
        
        <p className="text-text-muted text-xs mb-4 line-clamp-2 leading-relaxed font-medium">
          {talent.description}
        </p>

        {talent.skills && talent.skills.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {talent.skills.map((skill, idx) => (
              <span key={idx} className="text-[10px] font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                [{skill}]
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-auto pt-4 border-t border-border-subtle flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center font-black text-[8px] text-accent flex-shrink-0 uppercase tracking-tighter">
              {talent.trainerName?.split(' ').map(n => n[0]).join('') || 'HT'}
            </div>
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider truncate">{talent.trainerName || 'Hestim Mentor'}</span>
          </div>
          <Link
            to={`/talent/${talent.id}`}
            className="text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:text-accent transition-all flex-shrink-0 italic"
          >
            Lancer →
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default TalentCard;
