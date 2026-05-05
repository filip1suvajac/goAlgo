#include <algorithm>
#include <cstdlib>
#include <sstream>
#include <string>
#include <vector>

#ifdef __EMSCRIPTEN__
#include <emscripten/emscripten.h>
#endif

struct Step {
  std::vector<int> array;
  int comparedA;
  int comparedB;
  int swappedA;
  int swappedB;
  std::string description;
};

static std::string escapeJson(const std::string& text) {
  std::ostringstream out;

  for (char ch : text) {
    if (ch == '"') {
      out << "\\\"";
    } else if (ch == '\\') {
      out << "\\\\";
    } else {
      out << ch;
    }
  }

  return out.str();
}

static void addStep(std::vector<Step>& steps,
                    const std::vector<int>& values,
                    int comparedA,
                    int comparedB,
                    int swappedA,
                    int swappedB,
                    const std::string& description) {
  steps.push_back({values, comparedA, comparedB, swappedA, swappedB, description});
}

static void bubbleSort(std::vector<int> values, std::vector<Step>& steps) {
  addStep(steps, values, -1, -1, -1, -1, "Start Bubble Sort.");

  for (int end = static_cast<int>(values.size()) - 1; end > 0; --end) {
    for (int i = 0; i < end; ++i) {
      addStep(steps, values, i, i + 1, -1, -1, "Compare neighboring values.");

      if (values[i] > values[i + 1]) {
        std::swap(values[i], values[i + 1]);
        addStep(steps, values, i, i + 1, i, i + 1, "Swap because the left value is larger.");
      }
    }
  }

  addStep(steps, values, -1, -1, -1, -1, "Bubble Sort is complete.");
}

static void selectionSort(std::vector<int> values, std::vector<Step>& steps) {
  addStep(steps, values, -1, -1, -1, -1, "Start Selection Sort.");

  for (int i = 0; i < static_cast<int>(values.size()); ++i) {
    int smallest = i;

    for (int j = i + 1; j < static_cast<int>(values.size()); ++j) {
      addStep(steps, values, smallest, j, -1, -1, "Compare current minimum with the next value.");

      if (values[j] < values[smallest]) {
        smallest = j;
        addStep(steps, values, smallest, i, -1, -1, "Found a new minimum for this pass.");
      }
    }

    if (smallest != i) {
      std::swap(values[i], values[smallest]);
      addStep(steps, values, i, smallest, i, smallest, "Move the smallest value into the sorted area.");
    }
  }

  addStep(steps, values, -1, -1, -1, -1, "Selection Sort is complete.");
}

static void insertionSort(std::vector<int> values, std::vector<Step>& steps) {
  addStep(steps, values, -1, -1, -1, -1, "Start Insertion Sort.");

  for (int i = 1; i < static_cast<int>(values.size()); ++i) {
    int j = i;

    while (j > 0) {
      addStep(steps, values, j - 1, j, -1, -1, "Compare the key with the value before it.");

      if (values[j - 1] <= values[j]) {
        break;
      }

      std::swap(values[j - 1], values[j]);
      addStep(steps, values, j - 1, j, j - 1, j, "Shift the key left by swapping.");
      --j;
    }
  }

  addStep(steps, values, -1, -1, -1, -1, "Insertion Sort is complete.");
}

static int partition(std::vector<int>& values, int low, int high, std::vector<Step>& steps) {
  int pivot = values[high];
  int storeIndex = low;

  addStep(steps, values, high, -1, -1, -1, "Choose the rightmost value as the pivot.");

  for (int i = low; i < high; ++i) {
    addStep(steps, values, i, high, -1, -1, "Compare value with the pivot.");

    if (values[i] < pivot) {
      if (i != storeIndex) {
        std::swap(values[i], values[storeIndex]);
        addStep(steps, values, i, storeIndex, i, storeIndex, "Move value smaller than pivot to the left side.");
      }
      ++storeIndex;
    }
  }

  if (storeIndex != high) {
    std::swap(values[storeIndex], values[high]);
    addStep(steps, values, storeIndex, high, storeIndex, high, "Place the pivot between smaller and larger values.");
  }

  return storeIndex;
}

static void quickSortRange(std::vector<int>& values, int low, int high, std::vector<Step>& steps) {
  if (low >= high) {
    return;
  }

  int pivotIndex = partition(values, low, high, steps);
  quickSortRange(values, low, pivotIndex - 1, steps);
  quickSortRange(values, pivotIndex + 1, high, steps);
}

static void quickSort(std::vector<int> values, std::vector<Step>& steps) {
  addStep(steps, values, -1, -1, -1, -1, "Start Quick Sort.");
  quickSortRange(values, 0, static_cast<int>(values.size()) - 1, steps);
  addStep(steps, values, -1, -1, -1, -1, "Quick Sort is complete.");
}

static std::vector<int> parseNumbers(const std::string& input) {
  std::vector<int> values;
  std::stringstream stream(input);
  std::string item;

  while (std::getline(stream, item, ',')) {
    if (!item.empty()) {
      values.push_back(std::stoi(item));
    }
  }

  return values;
}

static std::string toJson(const std::vector<Step>& steps) {
  std::ostringstream json;
  json << "[";

  for (size_t i = 0; i < steps.size(); ++i) {
    const Step& step = steps[i];
    json << "{";
    json << "\"array\":[";

    for (size_t j = 0; j < step.array.size(); ++j) {
      json << step.array[j];
      if (j + 1 < step.array.size()) {
        json << ",";
      }
    }

    json << "],";
    json << "\"comparedIndices\":[" << step.comparedA << "," << step.comparedB << "],";
    json << "\"swappedIndices\":[" << step.swappedA << "," << step.swappedB << "],";
    json << "\"description\":\"" << escapeJson(step.description) << "\"";
    json << "}";

    if (i + 1 < steps.size()) {
      json << ",";
    }
  }

  json << "]";
  return json.str();
}

extern "C" {
#ifdef __EMSCRIPTEN__
EMSCRIPTEN_KEEPALIVE
#endif
char* sortArray(const char* input, const char* algorithm) {
  std::vector<int> values = parseNumbers(input);
  std::vector<Step> steps;
  std::string selectedAlgorithm = algorithm;

  if (selectedAlgorithm == "bubble") {
    bubbleSort(values, steps);
  } else if (selectedAlgorithm == "selection") {
    selectionSort(values, steps);
  } else if (selectedAlgorithm == "insertion") {
    insertionSort(values, steps);
  } else if (selectedAlgorithm == "quick") {
    quickSort(values, steps);
  } else {
    addStep(steps, values, -1, -1, -1, -1, "Unknown algorithm.");
  }

  std::string output = toJson(steps);
  char* result = static_cast<char*>(std::malloc(output.size() + 1));
  std::copy(output.begin(), output.end(), result);
  result[output.size()] = '\0';
  return result;
}
}
