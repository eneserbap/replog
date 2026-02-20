import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { programService } from '../../application/workoutService';
import { db } from '../../infrastructure/db';
import { ChevronLeft, Play, MessageSquare, X, TrendingUp } from 'lucide-react';

const ExerciseStats = ({ name, onStatsLoaded }: { name: string, onStatsLoaded?: (stats: any) => void }) => {
  const stats = useLiveQuery(() => programService.getPreviousExerciseStats(name), [name]) as any;
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (stats && onStatsLoaded) {
      onStatsLoaded(stats);
    }
  }, [stats]);

  if (!stats) return null;

  return (
    <div className="flex items-center gap-2 mt-1 mb-2">
      <button 
        onClick={() => setShowHistory(true)}
        className="flex items-center gap-2 flex-1"
      >
        <div className="text-[10px] font-bold text-orange-500/80 uppercase flex items-center gap-1 bg-orange-500/10 px-2 py-0.5 border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
            <span>GEÇEN:</span>
            <span className="text-white">{stats.lastWeight}KG / {stats.lastReps}T</span>
        </div>
        <div className="text-[10px] font-bold text-neutral-500 uppercase flex items-center gap-1 bg-neutral-900 px-2 py-0.5 border border-neutral-800 hover:bg-neutral-800 transition-colors">
            <span>MAX:</span>
            <span className="text-white">{stats.maxWeight}KG</span>
        </div>
      </button>

      {stats.lastNote && (
        <button 
          onClick={() => setShowHistory(true)}
          className="text-orange-500 hover:text-white transition-colors animate-pulse"
        >
          <MessageSquare size={14} />
        </button>
      )}

      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 border-2 border-orange-600 p-6 w-full max-w-sm relative">
            <button 
                onClick={() => setShowHistory(false)}
                className="absolute -top-3 -right-3 bg-orange-600 text-black p-1 hover:scale-110 transition-transform"
            >
                <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-6 border-b-2 border-orange-600 pb-2 italic">
                <TrendingUp size={20} className="text-orange-500" />
                <h4 className="text-lg font-black uppercase text-white truncate">{name}</h4>
            </div>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {stats.history.map((h: any, i: number) => (
                    <div key={i} className="bg-black/40 border-l-2 border-neutral-800 p-3 hover:border-orange-500 transition-colors">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-black text-neutral-500 font-mono">{h.date}</span>
                            <span className="text-sm font-black text-orange-500 italic">{h.weight}KG × {h.reps}</span>
                        </div>
                        {h.note && (
                            <p className="text-xs font-bold text-gray-400 border-t border-neutral-900 pt-1 mt-1 italic leading-relaxed">
                                "{h.note}"
                            </p>
                        )}
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExerciseCard = ({ ex, session, activeSessionId, handleUpdateLog, handleUpdateNote }: any) => {
    const [prevStats, setPrevStats] = useState<any>(null);
    const exerciseNote = session?.notes?.find((n: any) => n.exerciseId === ex.id)?.content || '';

    return (
        <div className="bg-neutral-900 border border-neutral-800 p-4 relative overflow-hidden flex flex-col gap-3">
            <div className="absolute top-0 right-0 w-16 h-16 bg-orange-600/5 blur-2xl"></div>
            <div>
                <h3 className="font-black italic uppercase text-lg text-white border-b border-neutral-800 pb-2 mb-1">{ex.name}</h3>
                <ExerciseStats name={ex.name} onStatsLoaded={setPrevStats} />
            </div>
            <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-[8px] font-black text-gray-600 uppercase tracking-widest px-2">
                    <span>SET</span>
                    <span>HEDEF</span>
                    <span>AĞIRLIK</span>
                    <span>TEKRAR</span>
                </div>
                {ex.plannedSets.map((ps: any, idx: number) => {
                    const loggedSet = session?.sets.find((s: any) => s.exerciseId === ex.id && s.setIndex === idx);
                    const lastExecutionSet = prevStats?.lastSets?.find((s: any) => s.setIndex === idx) || prevStats?.lastSets?.[prevStats.lastSets.length - 1];
                    const weightPlaceholder = lastExecutionSet ? lastExecutionSet.weight.toString() : ps.weight.toString();
                    const repsPlaceholder = lastExecutionSet ? lastExecutionSet.reps.toString() : ps.reps.toString();

                    return (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                            <span className="font-black italic text-neutral-700">#{idx + 1}</span>
                            <div className="text-[10px] font-bold text-neutral-500 bg-neutral-950 p-2 text-center border border-neutral-900">
                                {ps.weight}K / {ps.reps}T
                            </div>
                            <input 
                                id={`weight-${ex.id}-${idx}`}
                                type="number" 
                                placeholder={weightPlaceholder}
                                className="bg-neutral-950 border border-neutral-800 p-2 text-center text-xs font-black focus:border-orange-500 outline-none"
                                defaultValue={loggedSet?.weight || ''}
                                onBlur={(e) => {
                                    const repsVal = (document.getElementById(`reps-${ex.id}-${idx}`) as HTMLInputElement)?.value;
                                    handleUpdateLog(ex.id, idx, e.target.value, repsVal, ps.reps);
                                }}
                            />
                            <input 
                                id={`reps-${ex.id}-${idx}`}
                                type="number" 
                                placeholder={repsPlaceholder}
                                className="bg-neutral-950 border border-neutral-800 p-2 text-center text-xs font-black focus:border-orange-500 outline-none"
                                defaultValue={loggedSet?.reps || ''}
                                onBlur={(e) => {
                                    const weightVal = (document.getElementById(`weight-${ex.id}-${idx}`) as HTMLInputElement)?.value;
                                    handleUpdateLog(ex.id, idx, weightVal, e.target.value, ps.reps);
                                }}
                            />
                        </div>
                    );
                })}
            </div>
            <textarea 
                placeholder="Bu hareket için genel not..."
                className="w-full bg-black/50 border border-neutral-800 text-[11px] font-bold text-neutral-400 p-3 outline-none focus:border-orange-900/50 italic min-h-[60px] resize-none"
                defaultValue={exerciseNote}
                onBlur={(e) => handleUpdateNote(ex.id, e.target.value)}
            />
        </div>
    );
};

export const WorkoutPage = () => {
  const { id } = useParams<{ id: string }>(); 
  const [searchParams] = useSearchParams();
  const dayId = searchParams.get('dayId');
  const navigate = useNavigate();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const program = useLiveQuery(() => id ? db.programs.get(id) : undefined, [id]) as any;
  const days = useLiveQuery(() => id ? db.days.where('programId').equals(id).sortBy('order') : [], [id]);
  const selectedDay = useLiveQuery(() => dayId ? db.days.get(dayId) : undefined, [dayId]) as any;
  const exercises = useLiveQuery(() => dayId ? db.exercises.where('dayId').equals(dayId).sortBy('order') : [], [dayId]);
  const session = useLiveQuery(() => activeSessionId ? programService.getSession(activeSessionId) : undefined, [activeSessionId]) as any;
  
  const handleStart = async (selectedDayId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const newSession = await programService.startSession(selectedDayId, today);
    setActiveSessionId(newSession.id);
  };

  const handleUpdateLog = async (exerciseId: string, setIndex: number, weight: string, reps: string, plannedReps: number) => {
    if (!activeSessionId) return;
    const finalReps = reps === '' ? plannedReps : Number(reps);
    const finalWeight = weight === '' ? 0 : Number(weight);
    await programService.logSet(activeSessionId, exerciseId, setIndex, finalWeight, finalReps);
  };

  const handleUpdateNote = async (exerciseId: string, content: string) => {
    if (!activeSessionId) return;
    await programService.logExerciseNote(activeSessionId, exerciseId, content);
  };

  if (!program) return null;

  if (!dayId) {
    return (
      <div className="max-w-lg mx-auto p-6 min-h-screen bg-black text-gray-200">
        <header className="mb-8 flex items-center gap-4">
          <Link to="/" className="p-2 bg-neutral-900 border border-neutral-800 text-orange-500 hover:border-orange-500">
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-black italic uppercase">{program.name}</h1>
        </header>
        <div className="grid gap-3">
          {days?.map(d => (
            <Link key={d.id} to={`/start/${id}?dayId=${d.id}`} className="bg-neutral-900 border border-neutral-800 p-6 font-black uppercase italic text-left hover:border-orange-500 transition-all flex justify-between items-center group">
              <span>{d.name}</span>
              <Play size={20} className="text-neutral-800 group-hover:text-orange-500" />
            </Link>
          ))}
        </div>
      </div>
    );
  }

  if (!activeSessionId) {
    return (
      <div className="max-w-lg mx-auto p-6 min-h-screen bg-black text-gray-200 flex flex-col items-center justify-center">
        <h2 className="text-4xl font-black italic text-orange-600 mb-2 uppercase">{selectedDay?.name}</h2>
        <button onClick={() => dayId && handleStart(dayId)} className="w-48 bg-orange-600 text-black font-black py-4 skew-btn flex items-center justify-center gap-2">
          <Play size={24} fill="black" /> <span>BAŞLAT</span>
        </button>
        <Link to="/" className="mt-4 text-gray-600 font-bold uppercase text-[10px]">VAZGEÇ</Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 min-h-screen bg-black text-gray-200">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black uppercase italic text-orange-500">{selectedDay?.name}</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{new Date().toLocaleDateString()}</p>
        </div>
        <Link to="/" className="bg-green-600 text-black font-black px-4 py-2 skew-btn text-xs">
          <span>BİTİR</span>
        </Link>
      </header>
      <div className="space-y-6 mb-20">
        {exercises?.map((ex: any) => (
            <ExerciseCard key={ex.id} ex={ex} session={session} activeSessionId={activeSessionId} handleUpdateLog={handleUpdateLog} handleUpdateNote={handleUpdateNote} />
        ))}
      </div>
    </div>
  );
};
