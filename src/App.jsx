import { useState, useEffect } from 'react'

export default function App() {
  const [workouts, setWorkouts] = useState(() => {
    const saved = localStorage.getItem('replog-data')
    return saved ? JSON.parse(saved) : []
  })

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [exercise, setExercise] = useState('')
  const [weight, setWeight] = useState('')
  const [reps, setReps] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    localStorage.setItem('replog-data', JSON.stringify(workouts))
  }, [workouts])

  const handleAdd = (e) => {
    e.preventDefault()
    if (!exercise || !weight || !reps) return

    const newWorkout = {
      id: Date.now(),
      date: selectedDate,
      exercise: exercise.toUpperCase(),
      weight: parseFloat(weight),
      reps: parseInt(reps),
      note: note
    }

    setWorkouts([newWorkout, ...workouts])
    setExercise('')
    setWeight('')
    setReps('')
    setNote('')
  }

  const handleDelete = (id) => {
    setWorkouts(workouts.filter(w => w.id !== id))
  }

  const currentDayWorkouts = workouts.filter(w => w.date === selectedDate)
  
  const totalVolume = currentDayWorkouts.reduce((acc, curr) => acc + (curr.weight * curr.reps), 0)
  
  const maxWeight = currentDayWorkouts.length > 0 
    ? Math.max(...currentDayWorkouts.map(w => w.weight)) 
    : 0

  const totalSets = currentDayWorkouts.length

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 font-sans flex flex-col items-center selection:bg-orange-600 selection:text-white">
      <div className="w-full max-w-lg flex-1">
        
        <header className="mb-8 flex flex-col items-center">
          <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 drop-shadow-[0_0_10px_rgba(234,88,12,0.5)]">
            REPLOG
          </h1>
          <p className="text-gray-500 text-xs font-bold tracking-[0.3em] mt-1 uppercase">Ağırlık Takip Programı</p>
        </header>

        <div className="mb-8 grid grid-cols-3 gap-2">
            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest z-10">Setler</span>
                <span className="text-3xl font-black text-white z-10">{totalSets}</span>
                <div className="absolute top-0 right-0 w-8 h-8 bg-orange-600/20 blur-xl"></div>
            </div>

            <div className="bg-neutral-900 border border-orange-600/30 p-3 rounded-lg flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_15px_rgba(234,88,12,0.15)]">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest z-10">Max KG</span>
                <span className="text-3xl font-black text-orange-500 z-10">{maxWeight}</span>
                <div className="absolute inset-0 bg-gradient-to-t from-orange-900/20 to-transparent"></div>
            </div>

            <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest z-10">Hacim</span>
                <span className="text-xl font-black text-white z-10">
                    {(totalVolume / 1000).toFixed(1)}<span className="text-xs text-gray-600 ml-1">t</span>
                </span>
            </div>
        </div>

        {/* --- TARİH SEÇİCİ --- */}
        {/* [color-scheme:dark] ekledik. Bu sayede takvim siyah açılır. */}
        <div className="bg-neutral-900/50 p-2 mb-6 rounded border border-neutral-800 flex items-center justify-between group hover:border-orange-500/50 transition-colors">
            <span className="text-xs font-bold text-gray-500 uppercase pl-2 group-hover:text-orange-500 transition-colors">Antrenman Günü:</span>
            <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-mono font-bold text-right focus:outline-none cursor-pointer [color-scheme:dark] hover:text-orange-500 transition-colors"
            />
        </div>

        <form onSubmit={handleAdd} className="mb-8 flex flex-col gap-3">
          
          <input 
            type="text" 
            placeholder="HAREKET GİR" 
            className="w-full bg-neutral-900 text-white rounded-none border-l-4 border-orange-600 p-4 focus:outline-none focus:bg-neutral-800 transition-all font-bold placeholder-neutral-600 uppercase tracking-wide"
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
          />

          <div className="flex gap-2">
            <div className="relative flex-1 group">
              <input 
                type="number" 
                placeholder="0" 
                className="w-full bg-neutral-900 text-white rounded-none border border-neutral-800 p-4 text-center focus:outline-none focus:border-orange-600 transition-all font-black text-xl"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
              <span className="absolute bottom-1 right-2 text-neutral-600 text-[10px] font-bold">KG</span>
            </div>

            <div className="relative flex-1">
              <input 
                type="number" 
                placeholder="0" 
                className="w-full bg-neutral-900 text-white rounded-none border border-neutral-800 p-4 text-center focus:outline-none focus:border-orange-600 transition-all font-black text-xl"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
              />
               <span className="absolute bottom-1 right-2 text-neutral-600 text-[10px] font-bold">REP</span>
            </div>
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Not ekle... (Örn: Setin nasıl geçti)" 
              className="flex-1 bg-neutral-900 text-gray-300 text-sm rounded-none border border-neutral-800 p-3 focus:outline-none focus:border-orange-600 transition-all"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            <button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-500 text-black font-black px-6 rounded-none transition-all active:scale-95 skew-x-[-10deg]"
            >
                EKLE
            </button>
          </div>

        </form>

        <div>          
          {currentDayWorkouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border border-neutral-800 border-dashed rounded opacity-50">
              <span className="text-4xl mb-3">💤</span>
              <p className="text-gray-500 font-bold tracking-wider text-xs">hiç hareket yok. offday?</p>
            </div>
          ) : (
            <div className="space-y-2">
              {currentDayWorkouts.map((item) => (
                <div key={item.id} className="group bg-neutral-900 hover:bg-neutral-800 p-4 border-l-4 border-neutral-700 hover:border-orange-500 transition-all flex justify-between items-center">
                  
                  <div className="flex items-center gap-4">
                    <div className="text-orange-500 font-black text-2xl min-w-[60px] text-center italic">
                       {item.weight}
                       <span className="text-[10px] text-gray-500 block font-normal not-italic -mt-1">KG</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg leading-none tracking-tight">{item.exercise}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-400 font-bold">{item.reps} TEKRAR</span>
                        {item.note && (
                            <span className="text-xs text-orange-400/80 italic border-l border-gray-700 pl-2">
                                "{item.note}"
                            </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-neutral-600 hover:text-red-500 p-2 transition-colors"
                  >
                    ✖
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="mt-12 text-center border-t border-neutral-900 pt-6 w-full max-w-lg">
        <p className="text-[9px] text-gray-600 uppercase tracking-widest flex items-center justify-center gap-2">
           <span>⚠️</span>
           <span>Veriler tarayıcı hafızasında (LocalStorage) tutulur. Geçmişi temizlersen veriler silinir.</span>
        </p>
      </footer>
    </div>
  )
}