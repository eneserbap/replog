import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { programService } from '../../application/workoutService';
import { db } from '../../infrastructure/db';
import { Plus, Play, Settings, History } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();
  const programs = useLiveQuery(() => programService.getPrograms());
  const sessions = useLiveQuery(() => db.sessions.orderBy('timestamp').reverse().limit(15).toArray() || db.sessions.orderBy('date').reverse().limit(15).toArray());
  const allSets = useLiveQuery(() => db.sets.toArray());
  
  const stats = {
    totalSets: allSets?.length || 0,
    maxWeight: (allSets && allSets.length > 0) ? Math.max(...allSets.map(s => s.weight)) : 0,
    totalVolume: allSets?.reduce((acc, s) => acc + (s.weight * s.reps), 0) || 0
  };

  const [isCreating, setIsCreating] = useState(false);
  const [newProgramName, setNewProgramName] = useState('');

  const handleCreateProgram = async () => {
    if (!newProgramName) return;
    const program = await programService.createProgram(newProgramName);
    setIsCreating(false);
    setNewProgramName('');
    navigate(`/setup/${program.id}`);
  };

  return (
    <div className="max-w-lg mx-auto p-6 min-h-screen bg-black text-gray-200">
      <header className="mb-8 flex flex-col items-center">
        <h1 className="replog-title">REPLOG</h1>
        <p className="text-gray-500 text-[10px] font-bold tracking-[0.3em] mt-1 uppercase">Ağırlık Takip Programı</p>
      </header>

      <div className="mb-8 grid grid-cols-3 gap-2">
        <div className="stat-card">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Setler</span>
          <span className="text-3xl font-black text-white">{stats.totalSets}</span>
        </div>
        <div className="stat-card border-orange-600/30">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Max KG</span>
          <span className="text-3xl font-black text-orange-500">{stats.maxWeight}</span>
        </div>
        <div className="stat-card">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Hacim</span>
          <span className="text-xl font-black text-white">
            {(stats.totalVolume / 1000).toFixed(1)}<span className="text-xs text-gray-600 ml-1">t</span>
          </span>
        </div>
      </div>

      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-black uppercase tracking-widest text-orange-500">Programlarım</h2>
          {!isCreating && (
            <button 
              onClick={() => setIsCreating(true)}
              className="text-xs bg-neutral-900 border border-neutral-800 px-3 py-1 hover:border-orange-500 transition-colors"
            >
              YENİ +
            </button>
          )}
        </div>

        {isCreating && (
          <div className="mb-4 space-y-2">
            <input 
              className="input-brutalist w-full"
              placeholder="PROGRAM ADI (Örn: PPL)"
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateProgram()}
              autoFocus
            />
            <div className="flex gap-2">
              <button 
                onClick={handleCreateProgram}
                className="flex-1 bg-orange-600 text-black font-black py-2 skew-btn"
              >
                <span>OLUŞTUR</span>
              </button>
              <button 
                onClick={() => setIsCreating(false)}
                className="px-4 bg-neutral-900 text-gray-500 font-bold"
              >
                İPTAL
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-3">
          {(programs?.length === 0 && !isCreating) && (
            <div className="p-8 border border-dashed border-neutral-800 text-center opacity-50">
              <p className="text-xs font-bold uppercase">Henüz program yok</p>
            </div>
          )}
          {programs?.map((p: any) => (
            <div key={p.id} className="group bg-neutral-900 border border-neutral-800 p-4 transition-all hover:border-orange-600 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg uppercase italic">{p.name}</h3>
                <p className="text-[10px] text-gray-500 uppercase font-bold">Oluşturuldu: {new Date(p.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                <Link 
                  to={`/setup/${p.id}`}
                  className="p-2 text-gray-500 hover:text-white"
                >
                  <Settings size={18} />
                </Link>
                <Link 
                  to={`/start/${p.id}`}
                  className="bg-orange-600 text-black p-2 skew-btn"
                >
                  <Play size={18} fill="black" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-black uppercase tracking-widest text-neutral-600 mb-4 flex items-center gap-2">
          <History size={14} /> Geçmiş Antrenmanlar
        </h2>
        <div className="space-y-2">
          {sessions?.length === 0 && (
            <p className="text-[10px] text-gray-600 italic">Henüz antrenman kaydı yok.</p>
          )}
          {sessions?.map((s: any) => (
            <div key={s.id} className="bg-neutral-900/50 border border-neutral-900 p-3 text-xs flex justify-between items-center transition-colors hover:border-neutral-700">
              <span className="font-mono text-orange-500/70">{s.date}</span>
              <Link 
                to={`/session/${s.id}`}
                className="text-neutral-700 hover:text-orange-500 transition-colors uppercase font-black"
              >
                DETAY
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
