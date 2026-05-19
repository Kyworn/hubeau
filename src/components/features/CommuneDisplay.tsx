'use client';

import { useState } from 'react';
import { ProcessedCommune } from '@/lib/types';
import { ParameterCard } from './ParameterCard';
import { Button } from '@/components/ui/Button';
import { Download, FileJson, FileSpreadsheet, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { exportToCSV, exportToJSON, exportToPDF } from '@/lib/exports';
import { cn } from '@/lib/utils';

interface CommuneDisplayProps {
  commune: ProcessedCommune;
}

export function CommuneDisplay({ commune }: CommuneDisplayProps) {
  const [activeCategory, setActiveCategory] = useState(commune.categories[0]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass p-6 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <MapPin size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{commune.commune_name}</h2>
            <p className="text-sm text-muted-foreground font-medium">INSEE: {commune.insee}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => exportToCSV(commune)}>
            <FileSpreadsheet size={16} />
            CSV
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={() => exportToJSON(commune)}>
            <FileJson size={16} />
            JSON
          </Button>
          <Button size="sm" className="rounded-full gap-2" onClick={() => exportToPDF(commune)}>
            <Download size={16} />
            Rapport PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pb-2 overflow-x-auto">
        {commune.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
              activeCategory === cat
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-105"
                : "bg-white/50 dark:bg-slate-900/50 text-muted-foreground hover:bg-white dark:hover:bg-slate-800 border border-border"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {Object.entries(commune.categorizedData[activeCategory] || {}).map(([name, data]) => (
            <ParameterCard key={name} paramName={name} measurements={data} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}


