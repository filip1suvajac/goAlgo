export type AlgorithmId = 'bubble' | 'selection' | 'insertion' | 'quick';

export type SortStep = {
  array: number[];
  comparedIndices: [number, number];
  swappedIndices: [number, number];
  description: string;
};

export type AlgorithmInfo = {
  id: AlgorithmId;
  label: string;
  explanation: string;
};
