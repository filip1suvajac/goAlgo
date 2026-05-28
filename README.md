# goAlgo

WASM project - sorthing algorithm visualization in React and C++.

The UI is built with React and TypeScript, while the sorting algorithms are written in C++ and compiled to WebAssembly.

## Features

- custom number array input
- random array generation
- sorting algorithm selection:
  - Bubble Sort
  - Selection Sort
  - Insertion Sort
  - Quick Sort
- sorting animation
- step backward / step forward
- reset
- animation speed control
- comparison and swap counter
- short description of the selected algorithm

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

To build the C++ code, Emscripten (`emcc`) is required.

```bash
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

Check installation:

```bash
emcc --version
```

## Build WASM

From the project root folder:

```bash
npm run build:wasm
```

This generates WASM files in:

```text
public/wasm/
```

## Run

```bash
npm run dev
```

Vite will print a local URL, for example:

```text
http://localhost:5173
```

![goAlgo](./assets/skrin.png)
