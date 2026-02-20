import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { programService } from '../../application/workoutService';
import { db } from '../../infrastructure/db';
import { ChevronLeft, Calendar, Dumbbell, MessageSquare, Clock } from 'lucide-react';

export const SessionDetailPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const sessionData = useLiveQuery(async () => {
    if (!sessionId) return undefined;
    const session = await programService.getSession(sessionId);
    if (!session) return null;

    // Get all unique exercise IDs from the sets in this session
    const loggedExerciseIds = [...new Set(session.sets.map((s: any) => s.exerciseId))];
    
    // Fetch details for all exercises found in sets (even if they were deleted from the template)
    const exerciseDetails = await Promise.all(
      loggedExerciseIds.map(async (id) => {
        const detail = await db.exercises.get(id);
        return detail || { id, name: 'Bilinmeyen Hareket' };
      })
    );

    return { ...session, exerciseDetails };
  }, [sessionId]) as any;

  if (!sessionData) return (
    <div className="max-w-lg mx-auto p-6 min-h-screen bg-black text-gray-500 uppercase font-black italic flex items-center justify-center">
        Yükleniyor...
    </div>
  );

  const { day, sets, notes, date, timestamp, exerciseDetails } = sessionData;

  // Group sets by exercise using the actually logged IDs
  const exerciseGroups = exerciseDetails.map((ex: any) => {
    const exerciseSets = sets
        .filter((s: any) => s.exerciseId === ex.id)
        .sort((a: any, b: any) => a.setIndex - b.setIndex);
    const exerciseNote = notes.find((n: any) => n.exerciseId === ex.id);
    return { ...ex, loggedSets: exerciseSets, note: exerciseNote };
  }).filter((group: any) => group.loggedSets.length > 0 || group.note);

  const totalVolume = sets.reduce((acc: number, s: any) => acc + (Number(s.weight || 0) * Number(s.reps || 0)), 0);
  const totalSets = sets.length;

  return (
    <div className="max-w-lg mx-auto p-6 min-h-screen bg-black text-gray-200">
      <header className="mb-8 border-b-2 border-orange-600 pb-4">
        <div className="flex items-center gap-4 mb-4">
            <Link to="/" className="p-2 bg-neutral-900 border border-neutral-800 text-orange-500 hover:border-orange-500 transition-colors">
                <ChevronLeft size={20} />
            </Link>
            <h1 className="text-2xl font-black italic uppercase text-white truncate">{day?.name || 'Antrenman'}</h1>
        </div>
        
        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
            <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1 border border-neutral-800">
                <Calendar size={12} className="text-orange-500" />
                <span>{date}</span>
            </div>
            {timestamp && (
                <div className="flex items-center gap-1.5 bg-neutral-900 px-3 py-1 border border-neutral-800">
                    <Clock size={12} className="text-orange-500" />
                    <span>{new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            )}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 mb-8">
        <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col items-center skew-btn">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Toplam Set</span>
          <span className="text-3xl font-black text-white italic">{totalSets}</span>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 p-4 flex flex-col items-center skew-btn">
          <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Toplam Hacim</span>
          <span className="text-2xl font-black text-orange-500 italic">
            {(totalVolume / 1000).toFixed(1)}<span className="text-xs ml-1 font-bold">ton</span>
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {exerciseGroups.map((group: any) => (
          <div key={group.id} className="relative">
            <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-600 p-1.5 skew-btn">
                    <Dumbbell size={16} className="text-black" />
                </div>
                <h3 className="text-lg font-black uppercase italic text-white">{group.name}</h3>
            </div>

            <div className="bg-neutral-900/40 border-l-2 border-orange-600/30 p-4 space-y-4">
                <div className="grid grid-cols-3 gap-4 text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] border-b border-neutral-900 pb-2">
                    <span>SET #</span>
                    <span className="text-center">AĞIRLIK</span>
                    <span className="text-right">TEKRAR</span>
                </div>

                {group.loggedSets.map((s: any, idx: number) => (
                    <div key={s.id} className="grid grid-cols-3 gap-4 text-sm font-bold">
                        <span className="text-neutral-700 font-black italic">SET {idx + 1}</span>
                        <span className="text-center text-white">{s.weight} <span className="text-[10px] text-neutral-500 font-normal">KG</span></span>
                        <span className="text-right text-orange-500">{s.reps} <span className="text-[10px] text-neutral-500 font-normal">REP</span></span>
                    </div>
                ))}

                {group.note && (
                    <div className="mt-4 bg-black/50 border border-neutral-800 p-3 flex gap-3">
                        <MessageSquare size={14} className="text-orange-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-bold text-neutral-400 italic leading-relaxed">
                            "{group.note.content}"
                        </p>
                    </div>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
