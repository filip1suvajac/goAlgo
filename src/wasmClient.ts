import type { AlgorithmId, SortStep } from './types';

type SortingModule = {
  ccall: (
    ident: string,
    returnType: string,
    argTypes: string[],
    args: string[],
  ) => number;
  UTF8ToString: (pointer: number) => string;
  _free: (pointer: number) => void;
};

type SortingModuleFactory = (options?: {
  locateFile?: (path: string) => string;
}) => Promise<SortingModule>;

declare global {
  interface Window {
    createSortingModule?: SortingModuleFactory;
  }
}

let modulePromise: Promise<SortingModule> | null = null;

const loadScript = () =>
  new Promise<void>((resolve, reject) => {
    if (window.createSortingModule) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = '/wasm/sorting.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('The WASM JavaScript glue file was not found.'));
    document.head.appendChild(script);
  });

export const loadSortingModule = async () => {
  if (!modulePromise) {
    modulePromise = loadScript().then(() => {
      if (!window.createSortingModule) {
        throw new Error('The WASM module factory was not available after loading.');
      }

      return window.createSortingModule({
        locateFile: (path) => `/wasm/${path}`,
      });
    });
  }

  return modulePromise;
};

export const sortWithWasm = async (values: number[], algorithm: AlgorithmId): Promise<SortStep[]> => {
  const module = await loadSortingModule();
  const input = values.join(',');
  const pointer = module.ccall('sortArray', 'number', ['string', 'string'], [input, algorithm]);
  const rawJson = module.UTF8ToString(pointer);
  module._free(pointer);
  return JSON.parse(rawJson) as SortStep[];
};
