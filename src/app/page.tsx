'use client';

import { useState } from 'react';
import { useWaterQuality } from '@/hooks/useWaterQuality';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CommuneDisplay } from '@/components/features/CommuneDisplay';
import { WaterMap } from '@/components/features/WaterMap';
import { Search, Droplets, ArrowRight, Code, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function Home() {
  const [pc1, setPc1] = useState('');
  const [pc2, setPc2] = useState('');
  const [searchPc1, setSearchPc1] = useState('');
  const [searchPc2, setSearchPc2] = useState('');
  const [showMap, setShowMap] = useState(false);

  const q1 = useWaterQuality(searchPc1);
  const q2 = useWaterQuality(searchPc2);

  const handleSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    setSearchPc1(pc1);
    setSearchPc2(pc2);
    if (pc1) setShowMap(false);
  };

  const onMapCitySelect = (code: string) => {
    setPc1(code);
    setSearchPc1(code);
    setShowMap(false);
  };

  const isLoading = q1.isLoading || q2.isLoading;

  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary">
              <Droplets className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight">Hub'Eau</span>
          </div>
          <a href="https://github.com/Kyworn/hubeau" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
            <Code size={20} />
          </a>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6"
          >
            La qualité de votre eau, <br />
            <span className="text-gradient">en toute transparence.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            Consultez les dernières analyses de qualité de l'eau potable de votre commune et comparez les résultats avec d'autres villes de France.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            <form 
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row items-center gap-4 glass p-4 rounded-2xl shadow-2xl mb-4"
            >
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  value={pc1}
                  onChange={(e) => setPc1(e.target.value)}
                  placeholder="Code postal 1 (ex: 33000)" 
                  className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0"
                />
              </div>
              <div className="hidden md:block h-8 w-px bg-border" />
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                  value={pc2}
                  onChange={(e) => setPc2(e.target.value)}
                  placeholder="Code postal 2 (facultatif)" 
                  className="pl-12 h-14 bg-transparent border-none focus-visible:ring-0"
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto h-14 px-8 rounded-xl">
                {isLoading ? 'Chargement...' : 'Rechercher'}
                <ArrowRight className="ml-2" size={18} />
              </Button>
            </form>
            
            <button 
              onClick={() => setShowMap(!showMap)}
              className="text-sm font-bold text-primary hover:underline"
            >
              {showMap ? "Masquer la carte" : "Sélectionner sur la carte"}
            </button>
          </motion.div>
        </section>

        <AnimatePresence>
          {showMap && (
            <motion.section
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-20 overflow-hidden"
            >
              <WaterMap onCitySelect={onMapCitySelect} />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <section className="space-y-16">
          <AnimatePresence mode="wait">
            {q1.data && (
              <motion.div 
                key="results-q1"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-12"
              >
                <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                {q1.data.map(commune => (
                  <CommuneDisplay key={commune.insee} commune={commune} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {q2.data && (
              <motion.div 
                key="results-q2"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-12 pt-16"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Comparaison</span>
                  <div className="h-px flex-1 bg-border" />
                </div>
                {q2.data.map(commune => (
                  <CommuneDisplay key={commune.insee} commune={commune} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {(q1.isError || q2.isError) && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center p-12 glass rounded-3xl border-destructive/20"
            >
              <p className="text-destructive font-semibold">Une erreur est survenue lors de la récupération des données.</p>
              <p className="text-sm text-muted-foreground mt-2">Vérifiez le code postal ou réessayez plus tard.</p>
            </motion.div>
          )}

          {!q1.data && !q2.data && !isLoading && !showMap && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 py-20"
            >
              {[
                { title: "Données Officielles", desc: "Accédez aux résultats du contrôle sanitaire réalisé par les ARS.", icon: Droplets },
                { title: "Visualisation", desc: "Comprenez les analyses grâce à des graphiques et indicateurs clairs.", icon: Search },
                { title: "Export Rapide", desc: "Téléchargez vos résultats en PDF, CSV ou JSON en un clic.", icon: Download },
              ].map((feature, i) => (
                <div key={i} className="text-center p-8 glass-card">
                  <div className="inline-flex p-3 rounded-2xl bg-primary/10 text-primary mb-6">
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </div>
              ))}
            </motion.div>
          )}
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-sm text-muted-foreground">
        <p>© 2026 Hub'Eau - Données sous Licence Ouverte Etalab 2.0</p>
      </footer>
    </div>
  );
}


