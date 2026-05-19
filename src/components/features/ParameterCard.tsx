'use client';

import { useState } from 'react';
import { WaterQualityResult } from '@/lib/types';
import { isParameterCompliant, formatResultValue } from '@/lib/hubeau';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Droplets, Info, Calendar, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { glossary } from '@/lib/glossary';
import { TrendsChart } from './TrendsChart';
import { cn } from '@/lib/utils';

interface ParameterCardProps {
  paramName: string;
  measurements: WaterQualityResult[];
}

export function ParameterCard({ paramName, measurements }: ParameterCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const latest = measurements[0];
  const isCompliant = isParameterCompliant(latest);
  const hasReference = latest.reference_qualite_parametre || latest.limite_qualite_parametre;
  const glossaryTerm = glossary[paramName];
  const hasHistory = measurements.length > 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-full flex flex-col p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
            <Droplets size={20} />
          </div>
          <div className="flex gap-2">
            {hasHistory && (
              <button 
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
              >
                <TrendingUp size={16} className={isExpanded ? 'text-primary' : ''} />
              </button>
            )}
            {hasReference && (
              <Badge variant={isCompliant ? 'success' : 'destructive'}>
                {isCompliant ? 'Conforme' : 'Non Conforme'}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1 group">
          <h4 className="text-sm font-medium text-muted-foreground line-clamp-1" title={paramName}>
            {paramName}
          </h4>
          {glossaryTerm && (
            <div className="relative group/tooltip">
              <Info size={14} className="text-muted-foreground/50 cursor-help hover:text-primary transition-colors" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-900 text-[10px] text-white rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-50 shadow-xl border border-white/10">
                {glossaryTerm}
              </div>
            </div>
          )}
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "text-2xl font-bold tracking-tight",
              hasReference ? (isCompliant ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400") : "text-foreground"
            )}>
              {formatResultValue(latest.resultat_alphanumerique || latest.resultat_numerique)}
            </span>
            <span className="text-xs text-muted-foreground font-normal">
              {latest.libelle_unite}
            </span>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <TrendsChart 
                  data={measurements} 
                  limit={latest.limite_qualite_parametre}
                  reference={latest.reference_qualite_parametre}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
            <div className="flex items-center gap-1">
              <Calendar size={10} />
              {new Date(latest.date_prelevement).toLocaleDateString()}
            </div>
            {hasReference && (
              <div className="flex items-center gap-1">
                Ref: {latest.reference_qualite_parametre || latest.limite_qualite_parametre}
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}


