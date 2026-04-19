import { useEffect, useState, useMemo, useCallback } from 'react';
import { getAnimals } from '../api/animals';
import { proxyImage, placeholderImage, statusColor } from '../utils/helpers';
import type { AnimalCard } from '../types';

/* ──────── helpers ──────── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

/* ──────── types ──────── */
type Mode = 'behavior' | 'habitat' | 'conservation' | 'country';

interface QuizQuestion {
  animal: AnimalCard;
  options: string[];
  correct: string;
  prompt: string;
  imageUrl?: string;
  description?: string;
}

const STATUS_NAMES: Record<string, string> = {
  CR: 'Critically Endangered', EN: 'Endangered', VU: 'Vulnerable',
  NT: 'Near Threatened', LC: 'Least Concern', DD: 'Data Deficient',
  NE: 'Not Evaluated', EW: 'Extinct in Wild', EX: 'Extinct',
};

const MODE_META: Record<Mode, { title: string; desc: string; icon: JSX.Element }> = {
  behavior: {
    title: 'Guess the Behaviour',
    desc: 'Read how an animal behaves and guess which species it is',
    icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><circle cx="9" cy="10" r="1" fill="currentColor" /><circle cx="15" cy="10" r="1" fill="currentColor" /></svg>,
  },
  habitat: {
    title: 'Match the Habitat',
    desc: 'Which biome does this animal call home?',
    icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M2 20l7-14 4 6 3-10 6 18H2z" /><path d="M2 20h20" /></svg>,
  },
  conservation: {
    title: 'Conservation Status',
    desc: 'How endangered is this species?',
    icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z" /><path d="M12 8v4" /><circle cx="12" cy="16" r="0.5" fill="currentColor" /></svg>,
  },
  country: {
    title: 'Country to Species',
    desc: 'Which animal is found in this country?',
    icon: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><ellipse cx="12" cy="12" rx="4" ry="10" /></svg>,
  },
};

const QUESTIONS_PER_ROUND = 10;

/* ──────── Question generators ──────── */
function buildBehaviorQ(pool: AnimalCard[]): QuizQuestion | null {
  const withBehavior = pool.filter(a => a.behavior_summary && a.behavior_summary.length > 30);
  if (withBehavior.length < 4) return null;
  const [animal, ...wrongPick] = pick(withBehavior, 4);
  const correct = animal.common_name;
  const options = shuffle([correct, ...wrongPick.map(w => w.common_name)]);
  return { animal, options, correct, prompt: 'Which animal does this describe?', description: animal.behavior_summary! };
}

function buildHabitatQ(pool: AnimalCard[]): QuizQuestion | null {
  const withBiome = pool.filter(a => a.biome);
  if (withBiome.length < 4) return null;
  const animal = pick(withBiome, 1)[0];
  const correct = animal.biome!;
  const allBiomes = [...new Set(withBiome.map(a => a.biome!))];
  const wrongBiomes = shuffle(allBiomes.filter(b => b !== correct)).slice(0, 3);
  if (wrongBiomes.length < 3) return null;
  const options = shuffle([correct, ...wrongBiomes]);
  const imgSrc = proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name);
  return { animal, options, correct, prompt: `What biome does the ${animal.common_name} live in?`, imageUrl: imgSrc };
}

function buildConservationQ(pool: AnimalCard[]): QuizQuestion | null {
  const withStatus = pool.filter(a => a.conservation_status?.code);
  if (withStatus.length < 4) return null;
  const animal = pick(withStatus, 1)[0];
  const correct = STATUS_NAMES[animal.conservation_status!.code] || animal.conservation_status!.code;
  const allCodes = [...new Set(withStatus.map(a => a.conservation_status!.code))];
  const wrongCodes = shuffle(allCodes.filter(c => c !== animal.conservation_status!.code)).slice(0, 3);
  if (wrongCodes.length < 3) return null;
  const options = shuffle([correct, ...wrongCodes.map(c => STATUS_NAMES[c] || c)]);
  const imgSrc = proxyImage(animal.hero_image_url) || proxyImage(animal.thumbnail_url) || placeholderImage(animal.common_name);
  return { animal, options, correct, prompt: `What is the conservation status of the ${animal.common_name}?`, imageUrl: imgSrc };
}

function buildCountryQ(pool: AnimalCard[], animalDetail: Map<string, string[]>): QuizQuestion | null {
  const withCountries = pool.filter(a => (animalDetail.get(a.slug)?.length ?? 0) > 0);
  if (withCountries.length < 4) return null;
  const [animal, ...wrong] = pick(withCountries, 4);
  const countries = animalDetail.get(animal.slug)!;
  const country = countries[Math.floor(Math.random() * countries.length)];
  const correct = animal.common_name;
  const options = shuffle([correct, ...wrong.map(w => w.common_name)]);
  return { animal, options, correct, prompt: `Which of these animals can be found in ${country}?` };
}

/* ──────── Main component ──────── */
export default function QuizPage() {
  const [animals, setAnimals] = useState<AnimalCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalPlayed, setTotalPlayed] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const [countryMap] = useState<Map<string, string[]>>(new Map());

  // Load stored stats
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem('quiz_stats') || '{}');
      if (s.totalPlayed) setTotalPlayed(s.totalPlayed);
      if (s.totalCorrect) setTotalCorrect(s.totalCorrect);
      if (s.bestStreak) setBestStreak(s.bestStreak);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    getAnimals({ page: 1, size: 500, sort: 'name_asc' })
      .then(data => {
        setAnimals(data.items);
        // Build a simple country map from habitat_summary (contains country names as rough proxy)
        // For a real app this would call a detail API, but we can extract from the data we have
        data.items.forEach(a => {
          if (a.habitat_summary) {
            countryMap.set(a.slug, [a.habitat_summary]);
          }
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const generateQuestions = useCallback((m: Mode) => {
    const qs: QuizQuestion[] = [];
    let attempts = 0;
    while (qs.length < QUESTIONS_PER_ROUND && attempts < 200) {
      attempts++;
      let q: QuizQuestion | null = null;
      switch (m) {
        case 'behavior': q = buildBehaviorQ(animals); break;
        case 'habitat': q = buildHabitatQ(animals); break;
        case 'conservation': q = buildConservationQ(animals); break;
        case 'country': q = buildCountryQ(animals, countryMap); break;
      }
      if (q && !qs.find(existing => existing.animal.id === q!.animal.id)) qs.push(q);
    }
    return qs;
  }, [animals, countryMap]);

  const startQuiz = (m: Mode) => {
    const qs = generateQuestions(m);
    setMode(m);
    setQuestions(qs);
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setStreak(0);
    setFinished(false);
  };

  const handleAnswer = (ans: string) => {
    if (selected) return; // already answered
    setSelected(ans);
    const isCorrect = ans === questions[currentIdx].correct;
    if (isCorrect) {
      setScore(s => s + 1);
      setStreak(s => {
        const ns = s + 1;
        setBestStreak(b => {
          const nb = Math.max(b, ns);
          saveStats(totalPlayed, totalCorrect + 1, nb);
          return nb;
        });
        return ns;
      });
      setTotalCorrect(c => c + 1);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentIdx + 1 >= questions.length) {
      setFinished(true);
      setTotalPlayed(p => {
        const np = p + 1;
        saveStats(np, totalCorrect, bestStreak);
        return np;
      });
    } else {
      setCurrentIdx(i => i + 1);
      setSelected(null);
    }
  };

  const saveStats = (played: number, correct: number, best: number) => {
    try {
      localStorage.setItem('quiz_stats', JSON.stringify({ totalPlayed: played, totalCorrect: correct, bestStreak: best }));
    } catch { /* ignore */ }
  };

  /* ──── Render ──── */
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-2 gap-4">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 bg-gray-200 rounded-2xl" />)}</div>
        </div>
      </div>
    );
  }

  /* Mode selection */
  if (!mode) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-900 text-white rounded-2xl p-8 mb-10">
          <h1 className="font-display text-4xl font-bold mb-2">Wildlife Quiz</h1>
          <p className="text-forest-200 text-lg mb-6">Test your knowledge of the animal kingdom</p>
          <div className="flex gap-8">
            <div><div className="text-3xl font-bold">{totalPlayed}</div><div className="text-sm text-forest-300 uppercase tracking-wide">Quizzes Taken</div></div>
            <div><div className="text-3xl font-bold">{totalCorrect}</div><div className="text-sm text-forest-300 uppercase tracking-wide">Correct Answers</div></div>
            <div><div className="text-3xl font-bold">{bestStreak}</div><div className="text-sm text-forest-300 uppercase tracking-wide">Best Streak</div></div>
          </div>
        </div>

        {/* Mode cards */}
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">Choose a Quiz Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(MODE_META) as [Mode, typeof MODE_META[Mode]][]).map(([key, meta]) => (
            <button
              key={key}
              onClick={() => startQuiz(key)}
              className="group bg-white rounded-2xl border border-gray-200 p-6 text-left hover:border-forest-500 hover:shadow-lg transition-all"
            >
              <div className="w-14 h-14 bg-forest-50 text-forest-700 rounded-xl flex items-center justify-center mb-4 group-hover:bg-forest-100 transition">
                {meta.icon}
              </div>
              <h3 className="font-display font-bold text-lg text-gray-900 mb-1">{meta.title}</h3>
              <p className="text-sm text-gray-500">{meta.desc}</p>
              <div className="mt-3 text-xs font-semibold text-forest-600 flex items-center gap-1">
                {QUESTIONS_PER_ROUND} questions
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  /* Finished screen */
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct >= 80 ? '🏆' : pct >= 50 ? '👏' : '💪';
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="text-6xl mb-4">{emoji}</div>
        <h2 className="font-display text-3xl font-bold text-gray-900 mb-2">Quiz Complete!</h2>
        <p className="text-gray-500 mb-8">{MODE_META[mode].title}</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-4xl font-bold text-forest-700">{score}/{questions.length}</div>
              <div className="text-sm text-gray-500">Score</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-forest-700">{pct}%</div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-forest-700">{bestStreak}</div>
              <div className="text-sm text-gray-500">Best Streak</div>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: pct >= 80 ? '#16a34a' : pct >= 50 ? '#ca8a04' : '#dc2626' }} />
          </div>
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={() => startQuiz(mode)} className="bg-forest-700 hover:bg-forest-800 text-white px-6 py-3 rounded-xl font-semibold transition">
            Play Again
          </button>
          <button onClick={() => { setMode(null); setFinished(false); }} className="bg-white border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-semibold transition">
            Choose Mode
          </button>
        </div>
      </div>
    );
  }

  /* Active question */
  const q = questions[currentIdx];
  if (!q) return null;
  const progress = ((currentIdx) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => { setMode(null); setFinished(false); }} className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Exit
        </button>
        <div className="text-sm font-semibold text-gray-700">
          {MODE_META[mode].title}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-forest-700 font-bold">{score} pts</span>
          {streak > 1 && (
            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold animate-bounce">
              🔥 {streak} streak
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-forest-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Behaviour description area */}
        {q.description && (
          <div className="bg-forest-50 border-b border-forest-100 px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-8 h-8 rounded-full bg-forest-100 text-forest-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
              </div>
              <p className="text-sm text-forest-800 leading-relaxed italic">"{q.description}"</p>
            </div>
          </div>
        )}
        {/* Image area */}
        {q.imageUrl && !q.description && (
          <div className="relative bg-gray-900 flex items-center justify-center overflow-hidden" style={{ height: 280 }}>
            <img
              src={q.imageUrl}
              alt="Mystery animal"
              className="max-h-full max-w-full object-contain"
              onError={e => { (e.target as HTMLImageElement).src = placeholderImage('?'); }}
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-forest-600 uppercase tracking-wide">Question {currentIdx + 1} of {questions.length}</span>
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-5">{q.prompt}</h3>

          {/* Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {q.options.map((opt, i) => {
              let btnClass = 'border border-gray-200 bg-white hover:border-forest-400 hover:bg-forest-50 text-gray-800';
              if (selected) {
                if (opt === q.correct) {
                  btnClass = 'border-2 border-green-500 bg-green-50 text-green-800';
                } else if (opt === selected && opt !== q.correct) {
                  btnClass = 'border-2 border-red-400 bg-red-50 text-red-800';
                } else {
                  btnClass = 'border border-gray-100 bg-gray-50 text-gray-400';
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt)}
                  disabled={!!selected}
                  className={`px-4 py-3 rounded-xl text-left font-medium text-sm transition-all ${btnClass}`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold mr-2">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                  {selected && opt === q.correct && <span className="ml-2">✓</span>}
                  {selected && opt === selected && opt !== q.correct && <span className="ml-2">✗</span>}
                </button>
              );
            })}
          </div>

          {/* Next / result feedback */}
          {selected && (
            <div className="mt-5 flex items-center justify-between">
              <div className={`text-sm font-semibold ${selected === q.correct ? 'text-green-700' : 'text-red-600'}`}>
                {selected === q.correct ? 'Correct!' : `Wrong — the answer is ${q.correct}`}
              </div>
              <button
                onClick={nextQuestion}
                className="bg-forest-700 hover:bg-forest-800 text-white px-5 py-2 rounded-lg font-semibold text-sm transition flex items-center gap-1"
              >
                {currentIdx + 1 >= questions.length ? 'See Results' : 'Next'}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
