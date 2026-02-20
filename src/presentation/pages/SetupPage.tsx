import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { programService } from '../../application/workoutService';
import { db } from '../../infrastructure/db';
import { ChevronLeft, Plus, Trash2, Dumbbell } from 'lucide-react';

export const SetupPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const program = useLiveQuery(() => id ? db.programs.get(id) : undefined, [id]) as any;
  const days = useLiveQuery(() => id ? db.days.where('programId').equals(id).sortBy('order') : [], [id]);
  
  const [newDayName, setNewDayName] = useState('');
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  
  const exercises = useLiveQuery(
    () => selectedDayId ? db.exercises.where('dayId').equals(selectedDayId).sortBy('order') : [],
    [selectedDayId]
  );

  const handleAddDay = async () => {
    if (!newDayName || !id) return;
    const day = await programService.addDayToProgram(id, newDayName);
    setNewDayName('');
    setSelectedDayId(day.id);
  };

  const [exName, setExName] = useState('');
  const [exSets, setExSets] = useState('3');
  const [exReps, setExReps] = useState('10');
  const [exWeight, setExWeight] = useState('0');

  const handleAddExercise = async () => {
    if (!exName || !selectedDayId) return;
    const sets = Array.from({ length: parseInt(exSets) }).map(() => ({
      reps: parseInt(exReps),
      weight: parseFloat(exWeight)
    }));
    await programService.addExerciseToDay(selectedDayId, exName, sets);
    setExName('');
  };

  if (!program) return null;

  return (
    <div className="max-w-lg mx-auto p-6 min-h-screen bg-black text-gray-200">
      <header className="mb-6 flex items-center gap-4">
        <button onClick={() => navigate('/')} className="p-2 bg-neutral-900 border border-neutral-800 text-orange-500">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black uppercase italic">{program.name}</h1>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Program Düzenle</p>
        </div>
      </header>

      <section className="mb-8">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-600 mb-3">Antrenman GÜNLERİ</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {days?.map(day => (
            <button 
              key={day.id}
              onClick={() => setSelectedDayId(day.id)}
              className={`px-4 py-2 text-xs font-bold uppercase transition-all ${selectedDayId === day.id ? 'bg-orange-600 text-black' : 'bg-neutral-900 text-gray-500 border border-neutral-800'}`}
            >
              {day.name}
            </button>
          ))}
          <div className="flex gap-1">
            <input 
              className="bg-neutral-900 border border-neutral-800 text-xs p-2 w-24 outline-none focus:border-orange-500"
              placeholder="YENİ GÜN..."
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddDay()}
            />
            <button onClick={handleAddDay} className="bg-neutral-800 p-2 text-white hover:text-orange-500">
              <Plus size={16} />
            </button>
          </div>
        </div>
      </section>

      {selectedDayId && (
        <section className="animate-fade-in">
          <div className="flex items-center gap-2 mb-4 border-b border-neutral-900 pb-2">
            <span className="text-orange-500 font-black italic">#</span>
            <h3 className="text-sm font-black uppercase tracking-widest">Hareket Ekle</h3>
          </div>

          <div className="grid gap-3 mb-6 bg-neutral-900/30 p-4 border border-neutral-900">
            <input 
              className="input-brutalist w-full text-sm"
              placeholder="HAREKET ADI"
              value={exName}
              onChange={(e) => setExName(e.target.value)}
            />
            <div className="flex gap-2 text-[10px] font-black uppercase text-gray-500">
              <div className="flex-1">
                <span>SET</span>
                <input type="number" value={exSets} onChange={e => setExSets(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-white mt-1" />
              </div>
              <div className="flex-1">
                <span>REP</span>
                <input type="number" value={exReps} onChange={e => setExReps(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-white mt-1" />
              </div>
              <div className="flex-1">
                <span>KG</span>
                <input type="number" value={exWeight} onChange={e => setExWeight(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 p-2 text-white mt-1" />
              </div>
            </div>
            <button 
              onClick={handleAddExercise}
              className="w-full bg-orange-600 text-black font-black py-3 skew-btn mt-2"
            >
              <span>LİSTEYE EKLE</span>
            </button>
          </div>

          <div className="space-y-2">
            {exercises?.map((ex: any) => (
              <div key={ex.id} className="bg-neutral-900 border-l-4 border-neutral-800 p-3 flex justify-between items-center group hover:border-orange-500">
                <div className="flex items-center gap-3">
                  <div className="bg-neutral-800 p-2 text-orange-500">
                    <Dumbbell size={16} />
                  </div>
                  <div>
                    <h4 className="font-bold uppercase text-sm">{ex.name}</h4>
                    <p className="text-[10px] text-gray-600">{ex.plannedSets.length} SET x {ex.plannedSets[0].reps} TEKRAR</p>
                  </div>
                </div>
                <button 
                  onClick={() => db.exercises.delete(ex.id)}
                  className="p-2 text-neutral-800 group-hover:text-red-900"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
