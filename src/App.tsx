import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { ArrowLeft, ArrowRight, Play, RotateCcw, Shuffle } from 'lucide-react';
import type { AlgorithmId, AlgorithmInfo, SortStep } from './types';
import { sortWithWasm } from './wasmClient';

const algorithms: AlgorithmInfo[] = [
  {
    id: 'bubble',
    label: 'Bubble Sort',
    explanation:
      'Bubble Sort repeatedly compares neighboring values and swaps them when they are out of order. Large values slowly bubble toward the end.',
  },
  {
    id: 'selection',
    label: 'Selection Sort',
    explanation:
      'Selection Sort scans the unsorted area for the smallest value, then places it at the front of the sorted area.',
  },
  {
    id: 'insertion',
    label: 'Insertion Sort',
    explanation:
      'Insertion Sort grows a sorted prefix by moving each new value left until it belongs in the right position.',
  },
  {
    id: 'quick',
    label: 'Quick Sort',
    explanation:
      'Quick Sort chooses a pivot, partitions smaller and larger values around it, then recursively sorts each side.',
  },
];

const defaultValues = [34, 12, 55, 8, 21, 3, 89, 42];

const parseInput = (input: string) =>
  input
    .split(',')
    .map((item) => Number(item.trim()))
    .filter((value) => Number.isFinite(value));

const formatValues = (values: number[]) => values.join(', ');

export function App() {
  const [arrayInput, setArrayInput] = useState(formatValues(defaultValues));
  const [algorithm, setAlgorithm] = useState<AlgorithmId>('bubble');
  const [steps, setSteps] = useState<SortStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [speed, setSpeed] = useState(550);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(
    'Build the WASM module, then start an animation to see C++ sorting steps.',
  );
  const timerRef = useRef<number | null>(null);

  const selectedAlgorithm = algorithms.find((item) => item.id === algorithm) ?? algorithms[0];
  const values = useMemo(() => parseInput(arrayInput), [arrayInput]);
  const currentStep = steps[currentStepIndex];
  const displayedArray = currentStep?.array ?? values;
  const maxValue = Math.max(...displayedArray.map((value) => Math.abs(value)), 1);
  const comparisonCount = steps
    .slice(0, currentStepIndex + 1)
    .filter((step) => step.comparedIndices.some((index) => index >= 0)).length;
  const swapCount = steps
    .slice(0, currentStepIndex + 1)
    .filter((step) => step.swappedIndices.some((index) => index >= 0)).length;

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setCurrentStepIndex((index) => {
        if (index >= steps.length - 1) {
          setIsPlaying(false);
          return index;
        }

        return index + 1;
      });
    }, speed);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, [currentStepIndex, isPlaying, speed, steps.length]);

  const resetTimeline = () => {
    setIsPlaying(false);
    setSteps([]);
    setCurrentStepIndex(0);
    setMessage('Ready for a fresh run.');
  };

  const generateRandomArray = () => {
    const randomValues = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10);
    setArrayInput(formatValues(randomValues));
    setSteps([]);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    setMessage('Random array generated.');
  };

  const startAnimation = async () => {
    if (values.length < 2) {
      setMessage('Enter at least two comma-separated numbers.');
      return;
    }

    setIsLoading(true);
    setIsPlaying(false);

    try {
      const nextSteps = await sortWithWasm(values, algorithm);
      setSteps(nextSteps);
      setCurrentStepIndex(0);
      setIsPlaying(true);
      setMessage('Animation running from WebAssembly-generated steps.');
    } catch {
      setMessage(
        'WASM is not built yet. Run npm run build:wasm after installing Emscripten, then refresh this page.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const stepForward = () => {
    setIsPlaying(false);
    setCurrentStepIndex((index) => Math.min(index + 1, Math.max(steps.length - 1, 0)));
  };

  const stepBackward = () => {
    setIsPlaying(false);
    setCurrentStepIndex((index) => Math.max(index - 1, 0));
  };

  const compared = currentStep?.comparedIndices ?? [-1, -1];
  const swapped = currentStep?.swappedIndices ?? [-1, -1];

  return (
    <main className="app-shell">
      <section className="workspace">
        <div className="topbar">
          <div>
            <p className="eyebrow">Filip Suvajac</p>
            <h1>goAlgo</h1>
          </div>
          <div className="status-pill">{steps.length ? `${currentStepIndex + 1} / ${steps.length}` : 'Idle'}</div>
        </div>

        <div className="layout">
          <section className="visualizer" aria-label="Sorting visualizer">
            <div className="bars" style={{ '--bar-count': displayedArray.length } as CSSProperties}>
              {displayedArray.map((value, index) => {
                const isCompared = compared.includes(index);
                const isSwapped = swapped.includes(index);

                return (
                  <div className="bar-slot" key={`${index}-${value}`}>
                    <div
                      className={`bar ${isCompared ? 'compared' : ''} ${isSwapped ? 'swapped' : ''}`}
                      style={{ height: `${Math.max((Math.abs(value) / maxValue) * 100, 8)}%` }}
                    >
                      <span>{value}</span>
                    </div>
                    <small>{index}</small>
                  </div>
                );
              })}
            </div>
            <div className="step-caption">
              {currentStep?.description ?? 'Build the WASM module and start an animation.'}
            </div>
          </section>

          <aside className="control-panel">
            <label>
              Array values
              <input
                value={arrayInput}
                onChange={(event) => {
                  setArrayInput(event.target.value);
                  setSteps([]);
                  setCurrentStepIndex(0);
                }}
                placeholder="34, 12, 55, 8"
              />
            </label>

            <label>
              Algorithm
              <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as AlgorithmId)}>
                {algorithms.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="button-grid">
              <button onClick={generateRandomArray} type="button">
                <Shuffle size={18} />
                Random
              </button>
              <button className="primary" disabled={isLoading} onClick={startAnimation} type="button">
                <Play size={18} />
                {isLoading ? 'Loading' : 'Start'}
              </button>
              <button disabled={!steps.length} onClick={stepBackward} type="button" aria-label="Step backward">
                <ArrowLeft size={18} />
              </button>
              <button disabled={!steps.length} onClick={stepForward} type="button" aria-label="Step forward">
                <ArrowRight size={18} />
              </button>
              <button onClick={resetTimeline} type="button">
                <RotateCcw size={18} />
                Reset
              </button>
            </div>

            <label>
              Speed
              <input
                max="1000"
                min="100"
                onChange={(event) => setSpeed(Number(event.target.value))}
                step="50"
                type="range"
                value={speed}
              />
            </label>

            <div className="metrics">
              <div>
                <span>{comparisonCount}</span>
                <p>Comparisons</p>
              </div>
              <div>
                <span>{swapCount}</span>
                <p>Swaps</p>
              </div>
            </div>

            <div className="algorithm-note">
              <h2>{selectedAlgorithm.label}</h2>
              <p>{selectedAlgorithm.explanation}</p>
            </div>

            <p className="message">{message}</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
