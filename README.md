# goAlgo

Prvi (vadbeni) projekt z WASM - vizualizacija algoritmov sortiranja v React + C++.

UI je narejen v Reactu + TypeScriptu, algoritmi pa so napisani v C++ in prevedeni v WebAssembly.

## Kaj dela

- vnos svojega arraya števil
- generiranje random arraya
- izbira algoritma:
  - Bubble Sort
  - Selection Sort
  - Insertion Sort
  - Quick Sort
- animacija sortiranja
- korak nazaj/korak naprej po algoritmu
- reset
- nastavitev hitrosti animacije
- prikaz števila primerjav in zamenjav
- kratek opis izbranega algoritma

## Tech

- React
- TypeScript
- Vite
- C++
- WebAssembly
- Emscripten

## Setup

```bash
npm install
```

## Emscripten

Za build C++ kode rabiš Emscripten (`emcc`).

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

Preveri:

```bash
emcc --version
```

## Build WASM

Iz root folderja projekta:

```bash
npm run build:wasm
```

To zgenerira WASM datoteke v:

```text
public/wasm/
```

## Run

```bash
npm run dev
```

Vite potem izpiše lokalni URL, npr:

```text
http://localhost:5173
```

![goAlgo](./assets/skrin.png)
