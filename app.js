const osInstructions = {
  "macos-linux": {
    label: "macOS & Linux",
    install: "Open a terminal and run the official installer command:",
    command: "curl -fsSL https://install.julialang.org | sh",
    note: "Review the script before confirming the installer prompts.",
    launch: "julia"
  },
  windows: {
    label: "Windows",
    install: "Install juliaup from the Microsoft Store, or use the official Windows App Installer:",
    command: "winget install --name Julia --id 9NJNWW8PVKMN -e -s msstore",
    note: "The command uses Microsoft's Store source. The Julia downloads page also links the MSIX installer.",
    launch: "julia"
  }
};

const osTabs = [...document.querySelectorAll(".os-tab")];
const osPanel = document.querySelector("#os-panel");
function selectOS(tab, focus = false) {
  osTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  const data = osInstructions[tab.dataset.os];
  osPanel.setAttribute("aria-labelledby", tab.id);
  document.querySelector("#install-copy").textContent = data.install;
  document.querySelector("#install-command").textContent = data.command;
  document.querySelector("#install-note").textContent = data.note;
  document.querySelector("#launch-command").textContent = data.launch;
  if (focus) tab.focus();
}
osTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectOS(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0
      : event.key === "End" ? osTabs.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + osTabs.length) % osTabs.length;
    selectOS(osTabs[next], true);
  });
});

let confettiAudioContext;

function playSoftNotes(notes) {
  const AudioContextType = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextType) return;

  try {
    confettiAudioContext ??= new AudioContextType();
    const context = confettiAudioContext;
    const playNotes = () => {
      notes.forEach(({ frequency, delay = 0, duration = 0.28, volume = 0.045 }) => {
        const startAt = context.currentTime + delay;
        const oscillator = context.createOscillator();
        const envelope = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startAt);
        envelope.gain.setValueAtTime(0.0001, startAt);
        envelope.gain.exponentialRampToValueAtTime(volume, startAt + 0.02);
        envelope.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
        oscillator.connect(envelope);
        envelope.connect(context.destination);
        oscillator.start(startAt);
        oscillator.stop(startAt + duration + 0.02);
      });
    };

    if (context.state === "running") playNotes();
    else context.resume().then(playNotes).catch(() => {});
  } catch {
    // Keep the visual celebration working if audio is unavailable.
  }
}

function playConfettiSound() {
  playSoftNotes([
    { frequency: 523.25, delay: 0 },
    { frequency: 659.25, delay: 0.09 }
  ]);
}

function playGardenStatusSound(status) {
  const notes = status === "within-limit"
    ? [
        { frequency: 659.25, delay: 0, duration: 0.16, volume: 0.035 },
        { frequency: 784, delay: 0.08, duration: 0.16, volume: 0.035 },
        { frequency: 987.77, delay: 0.16, duration: 0.22, volume: 0.035 }
      ]
    : [
        { frequency: 392, delay: 0, duration: 0.24, volume: 0.03 },
        { frequency: 293.66, delay: 0.13, duration: 0.3, volume: 0.03 }
      ];
  playSoftNotes(notes);
}

function showAnswerConfetti() {
  playConfettiSound();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const colors = ["#4063d8", "#9558b2", "#f0c54a", "#cb3c33", "#8bcf72"];
  const count = 72;

  document.querySelectorAll(".answer-confetti").forEach((piece) => piece.remove());

  for (let index = 0; index < count; index += 1) {
    const column = (index * 37) % count;
    const startY = Math.random() * window.innerHeight;
    const piece = document.createElement("span");
    piece.className = "answer-confetti";
    piece.setAttribute("aria-hidden", "true");
    piece.style.left = `${((column + 0.5) / count) * 100}%`;
    piece.style.top = `${startY}px`;
    piece.style.width = `${5 + Math.random() * 5}px`;
    piece.style.height = `${8 + Math.random() * 8}px`;
    piece.style.setProperty("--confetti-drift", `${(Math.random() - 0.5) * 180}px`);
    piece.style.setProperty("--confetti-drop", `${Math.max(80, window.innerHeight - startY + 30)}px`);
    piece.style.setProperty("--confetti-rotation", `${360 + Math.random() * 720}deg`);
    piece.style.setProperty("--confetti-color", colors[index % colors.length]);
    if (reducedMotion) {
      piece.style.opacity = "0.85";
      window.setTimeout(() => piece.remove(), 750);
    } else {
      piece.style.animationDuration = `${1.4 + Math.random() * 0.8}s`;
      piece.style.animationDelay = `${Math.random() * 0.25}s`;
      piece.addEventListener("animationend", () => piece.remove(), { once: true });
    }
    document.body.append(piece);
  }
}

async function copyText(text, button) {
  const visibleLabel = button.querySelector("[data-copy-label]");

  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const fallback = document.createElement("textarea");
    const activeElement = document.activeElement;
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.append(fallback);
    fallback.select();
    const copied = typeof document.execCommand === "function" && document.execCommand("copy");
    fallback.remove();
    activeElement?.focus({ preventScroll: true });
    if (!copied) {
      button.setAttribute("aria-label", "Select and copy the code manually");
      if (visibleLabel) {
        visibleLabel.textContent = "Select code";
        window.setTimeout(() => {
          visibleLabel.textContent = visibleLabel.dataset.defaultLabel;
          button.setAttribute("aria-label", button.dataset.defaultLabel);
        }, 1800);
      }
      return;
    }
  }

  button.classList.add("is-copied");
  button.setAttribute("aria-label", "Copied");
  if (visibleLabel) visibleLabel.textContent = "Copied";
  window.setTimeout(() => {
    button.classList.remove("is-copied");
    button.setAttribute("aria-label", button.dataset.defaultLabel);
    if (visibleLabel) visibleLabel.textContent = visibleLabel.dataset.defaultLabel;
  }, 1400);
}
document.querySelectorAll(".copy-button").forEach((button) => {
  button.dataset.defaultLabel = button.getAttribute("aria-label");
  const visibleLabel = button.querySelector("[data-copy-label]");
  if (visibleLabel) visibleLabel.dataset.defaultLabel = visibleLabel.textContent;
  button.addEventListener("click", () => {
    const target = button.dataset.copyTarget
      ? document.querySelector(button.dataset.copyTarget)
      : button.id === "copy-install"
        ? document.querySelector("#install-command")
        : button.id === "copy-launch"
          ? document.querySelector("#launch-command")
          : document.querySelector("#experiment-code");
    copyText(target.textContent, button);
  });
});

function escapeHTML(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function highlightJulia(source) {
  const tokenPattern = /(#[^\n]*|@\w+|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\b(?:using|function|end|if|elseif|else|for|in|return|true|false|nothing|let|while|struct|where|break)\b|\b(?:println|print|sum|length|mean|sin|cos|deg2rad|range|enumerate|collect|maximum|minimum|last|first|sqrt|abs|max|min|clamp|copy|hypot)\b|\bpush!(?![a-zA-Z0-9_])|\b\d+(?:\.\d+)?\b|::|(?:\.?[=+\-*/^<>]=?))/g;
  let html = "";
  let cursor = 0;
  for (const match of source.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index;
    html += escapeHTML(source.slice(cursor, index));
    const className = token.startsWith("#") ? "tok-comment"
      : token.startsWith("@") ? "tok-macro"
      : token.startsWith('"') || token.startsWith("'") ? "tok-string"
      : /^(using|function|end|if|elseif|else|for|in|return|true|false|nothing|let|while|struct|where|break)$/.test(token) ? "tok-keyword"
      : /^(println|print|sum|length|mean|sin|cos|deg2rad|range|enumerate|collect|maximum|minimum|last|first|sqrt|abs|max|min|clamp|copy|push!|hypot)$/.test(token) ? "tok-function"
      : /^\d/.test(token) ? "tok-number"
      : "tok-operator";
    html += `<span class="${className}">${escapeHTML(token)}</span>`;
    cursor = index + token.length;
  }
  return html + escapeHTML(source.slice(cursor));
}

const gardenRainInputs = [...document.querySelectorAll("[data-garden-rain]")];
const gardenPlantInputs = [...document.querySelectorAll('input[name="garden-plant"]')];
const gardenTemperatureInput = document.querySelector("#garden-temperature");
const gardenJuliaCode = document.querySelector("#garden-code");
const gardenJuliaPreview = document.querySelector("#garden-code-preview");
const gardenPlantVisual = document.querySelector("#garden-plant-visual");
const gardenPlantImage = document.querySelector("#garden-plant-image");
const gardenDryLimits = { lettuce: 5, cactus: 2 };
let lastGardenStatus = null;

function buildGardenParameterCode(rain, plant, temperature) {
  const plantType = plant === "cactus" ? "Cactus" : "Lettuce";
  const rainValues = rain.map((value) => `${value.toFixed(1)}`).join(", ");

  return `rain = [${rainValues}]
plant = ${plantType}()
temperature = ${temperature.toFixed(1)}`;
}

function buildGardenJuliaCode(rain, plant, temperature) {
  return `abstract type Plant end
struct Lettuce <: Plant end
struct Cactus <: Plant end

# Teaching assumptions only; not measured crop thresholds.
# DISPATCH: Plant type selects the matching dry-limit method.
dry_limit(::Lettuce) = 5.0
dry_limit(::Cactus) = 2.0

# JIT COMPILE: Julia compiles specialized methods for concrete input types.
function simulate(rain::Vector{Float64}, plant::T, temperature::Float64) where {T <: Plant}
    # MATH SYNTAX: A number beside a variable means multiplication.
    evaporation = 0.1temperature

    # BROADCASTING: Dotted subtraction applies to every day's rainfall.
    daily_change = rain .- evaporation

    soil = zeros(length(rain))

    # 1-BASED ARRAYS: The first day is stored at index 1.
    soil[1] = clamp(10.0 + daily_change[1], 0.0, 20.0)
    for day in 2:length(rain)
        soil[day] = clamp(soil[day - 1] + daily_change[day], 0.0, 20.0)
    end

    dry_days = count(water -> water < dry_limit(plant), soil)
    within_limit = dry_days <= 2
    return (soil=soil, dry_days=dry_days, within_limit=within_limit)
end

${buildGardenParameterCode(rain, plant, temperature)}

# WARM-UP: Compile simulate for these input types before timing.
simulate(rain, plant, temperature)

# TIMED RUN: @time reports elapsed time and allocations for one call.
result = @time simulate(rain, plant, temperature)`;
}

function updateGarden() {
  const rain = gardenRainInputs.map((input) => Number(input.value));
  const selectedPlant = gardenPlantInputs.find((input) => input.checked)?.value ?? "lettuce";
  const temperature = Number(gardenTemperatureInput.value);
  const evaporation = 0.1 * temperature;
  const dryLimit = gardenDryLimits[selectedPlant];
  const dailyChange = rain.map((amount) => amount - evaporation);
  const soil = new Array(rain.length);

  soil[0] = Math.min(20, Math.max(0, 10 + dailyChange[0]));
  for (let day = 1; day < rain.length; day += 1) {
    soil[day] = Math.min(20, Math.max(0, soil[day - 1] + dailyChange[day]));
  }

  const dryDays = soil.filter((water) => water < dryLimit).length;
  const withinLimit = dryDays <= 2;
  const gardenStatus = withinLimit ? "within-limit" : "outside-limit";
  const plantLabel = selectedPlant === "cactus" ? "Cactus" : "Lettuce";
  const outlook = document.querySelector("#garden-outlook");

  document.querySelector("#garden-temperature-value").value = temperature;
  gardenRainInputs.forEach((input, index) => {
    document.querySelector(`#garden-rain-value-${index + 1}`).value = rain[index];
  });
  document.querySelector("#garden-dry-days").value = dryDays;
  document.querySelector("#garden-final-water").value = soil[soil.length - 1].toFixed(1);

  document.querySelector("#garden-status").dataset.state = withinLimit ? "moist" : "dry";
  outlook.textContent = withinLimit ? "WITHIN LIMIT" : "LIMIT EXCEEDED";
  gardenPlantVisual.dataset.plant = selectedPlant;
  gardenPlantVisual.dataset.state = withinLimit ? "within-limit" : "dry";
  gardenPlantImage.src = `assets/${withinLimit ? selectedPlant : `dry_${selectedPlant}`}.png`;
  gardenPlantImage.alt = `${withinLimit ? "Within-limit" : "Dry"} ${plantLabel.toLowerCase()} illustration`;
  document.querySelector("#garden-summary").textContent =
    `Soil is below the illustrative ${plantLabel.toLowerCase()} threshold (${dryLimit.toFixed(1)} mm) on ${dryDays} of 7 days.`;

  const chart = document.querySelector("#garden-chart");
  chart.setAttribute(
    "aria-label",
    `Soil water by day for ${plantLabel.toLowerCase()}: ${soil.map((water) => water.toFixed(1)).join(", ")} millimeters.`
  );
  document.querySelectorAll(".garden-chart-column").forEach((column, index) => {
    column.querySelector("[data-garden-value]").textContent = soil[index].toFixed(1);
    column.querySelector(".garden-bar-fill").style.height = `${soil[index] / 20 * 100}%`;
    column.dataset.state = soil[index] < dryLimit ? "dry" : "moist";
  });

  gardenJuliaPreview.innerHTML = highlightJulia(buildGardenParameterCode(rain, selectedPlant, temperature));
  gardenJuliaCode.innerHTML = highlightJulia(buildGardenJuliaCode(rain, selectedPlant, temperature));

  if (lastGardenStatus !== null && lastGardenStatus !== gardenStatus) {
    playGardenStatusSound(gardenStatus);
  }
  lastGardenStatus = gardenStatus;
}

gardenRainInputs.forEach((input) => input.addEventListener("input", updateGarden));
gardenPlantInputs.forEach((input) => input.addEventListener("change", updateGarden));
gardenTemperatureInput.addEventListener("input", updateGarden);
updateGarden();

const gardenDeepDiveChoices = [
  ...document.querySelectorAll(".garden-deep-dive-parent > .garden-deep-dive-content > .garden-deep-dive-child")
];
function syncGardenDeepDiveChoices() {
  const openChoice = gardenDeepDiveChoices.find((choice) => choice.open);
  gardenDeepDiveChoices.forEach((choice) => {
    choice.hidden = Boolean(openChoice && choice !== openChoice);
  });
}
gardenDeepDiveChoices.forEach((choice) => {
  choice.addEventListener("toggle", syncGardenDeepDiveChoices);
});

const experiments = [
  {
    title: "Let math read like math.",
    detailTitle: "IMPLICIT MULTIPLICATION",
    story: "Julia keeps mathematical notation compact.",
    note: "A number beside a variable implies multiplication: `2x` means `2 * x`. Between variables, write the operator: `x * y`.",
    code: `x = 5
α = 0.5
y = 2x + 1
scaled = α * y

println((y, scaled))`,
    result: "(11, 5.5)",
    control: "math-notation",
    question: "What does 2x mean in Julia?",
    answers: [
      { text: "2 multiplied by x", correct: true, feedback: "Julia allows a numeric literal coefficient: 2x is shorthand for 2 * x." },
      { text: "x raised to the second power", correct: false, feedback: "Exponentiation uses the caret operator: x^2." },
      { text: "A variable named 2x", correct: false, feedback: "A name cannot begin with a digit; 2x is numeric coefficient syntax." }
    ]
  },
  {
    title: "The first index is 1.",
    detailTitle: "ARRAY INDEXING",
    story: "Standard Julia arrays start at 1, unlike arrays in Python and C. That small difference matters when translating familiar code or interpreting scientific data.",
    note: "For a standard Julia vector, `readings[1]` is the first element. Specialized array types may define different valid index axes.",
    code: `readings = [10, 20, 30]
first_reading = readings[1]

println(first_reading)`,
    result: "10",
    control: "array-index",
    arrayValues: [10, 20, 30],
    question: "Where does indexing begin for a standard Julia array?",
    answers: [
      { text: "At index 1", correct: true, feedback: "The first element of a standard Julia array is at index 1." },
      { text: "At index 0", correct: false, feedback: "Index 0 is common in some languages, but standard Julia arrays start at 1." },
      { text: "At index -1", correct: false, feedback: "Negative indexes do not count backward from the end in standard Julia arrays." }
    ]
  },
  {
    title: "The dot means elementwise.",
    detailTitle: "DOTTED BROADCASTING",
    story: "Julia distinguishes array operations from elementwise ones with dotted operators. Try the same operation across every value in a vector.",
    note: "`.*` and `.^` broadcast element by element; `A * B` is matrix multiplication for matrices. Dotted expressions can fuse, but broadcasting is not automatically parallel.",
    code: `values = [2, 3, 4]
result = values .+ 2

println(result)`,
    result: "[4, 5, 6]",
    control: "broadcast",
    broadcastValues: [2, 3, 4],
    question: "Which operator multiplies array elements element by element?",
    answers: [
      { text: ".*", correct: true, feedback: "The dot broadcasts multiplication over corresponding array elements." },
      { text: "*", correct: false, feedback: "For matrices, * performs matrix multiplication; .* is elementwise." },
      { text: ".+", correct: false, feedback: ".+ broadcasts addition, not multiplication." }
    ]
  },
  {
    title: "One function can have many methods.",
    detailTitle: "MULTIPLE DISPATCH",
    story: "Julia's multiple dispatch selects a method using the types of all positional arguments. The same function name can express behavior for numbers and vectors.",
    note: "`Number` and `AbstractVector` constrain these method signatures. Julia dispatches on argument types; the variables themselves do not need declarations.",
    code: `combine(a::Number, b::Number) = a + b
combine(a::AbstractVector, b::AbstractVector) = a .+ b

combine(2, 3)`,
    result: "5",
    control: "dispatch",
    question: "How does Julia choose which method to run?",
    answers: [
      { text: "From the types of all positional arguments", correct: true, feedback: "Multiple dispatch matches the call to the most specific method for its argument types." },
      { text: "Only from the function name", correct: false, feedback: "A generic function can have multiple methods selected by argument types." },
      { text: "From the order the values appear in an array", correct: false, feedback: "Dispatch is based on types, not array position." }
    ]
  },
  {
    title: "Dynamic code can compile to native speed.",
    detailTitle: "JIT SPECIALIZATION",
    story: "Julia lets you write functions without declaring variable types, then specializes and compiles methods for the concrete types they receive.",
    note: "First calls may include compilation, so benchmark after warm-up. Deployment may also require bundling Julia's runtime.",
    code: `function transform(x)
    2x + 1
end

transform(5)`,
    result: "transform(5) = 11",
    control: "jit",
    question: "What is a tradeoff of Julia's just-in-time compilation?",
    answers: [
      { text: "The first use can pause while a method is compiled", correct: true, feedback: "Compilation can add warm-up latency before specialized native code is ready." },
      { text: "Every call must be manually compiled by the programmer", correct: false, feedback: "Julia compiles methods automatically when needed." },
      { text: "Dynamic typing prevents code from running as native code", correct: false, feedback: "Julia specializes methods for argument types and compiles them to native code." }
    ]
  },
  {
    title: "Macros transform expressions.",
    detailTitle: "MACRO EXPANSION",
    story: "Julia macros receive code as an expression and transform it before execution. The built-in @time macro wraps a call with timing and allocation reporting.",
    note: "`@time` returns the expression's value, but its measurements vary by machine and can include compilation. Use BenchmarkTools.jl for repeated benchmarks.",
    code: `function total()
    sum(1:1_000)
end

result = @time total()`,
    result: "0.000001 seconds (0 allocations: 0 bytes)\n500500",
    control: "macro",
    question: "What does Julia's @time macro add around an expression?",
    answers: [
      { text: "Timing and allocation reporting, then the expression's value", correct: true, feedback: "@time reports elapsed time and memory allocations, and returns the wrapped expression's result." },
      { text: "A parallel execution guarantee", correct: false, feedback: "@time measures a call; it does not make that call parallel." },
      { text: "A permanent cache of every result", correct: false, feedback: "@time reports a measurement; it does not cache function results." }
    ]
  }
];

const experimentTabs = [...document.querySelectorAll(".experiment-tab")];
const experimentCode = document.querySelector("#experiment-code");
const experimentResult = document.querySelector("#experiment-result");
const experimentControls = document.querySelector("#experiment-controls");
const conceptVisual = document.querySelector("#concept-visual");
const experimentNoteLabel = document.querySelector("#experiment-note-label");
const experimentOutput = document.querySelector("#experiment-output");
let experimentIndex = 0;
let activeExperimentSource = "";
let broadcastOperator = ".+";
let dispatchMode = "numbers";
let jitPhase = "first";
let macroMode = "timed";
const selfCheckTrigger = document.querySelector("#self-check-trigger");
const questionDialog = document.querySelector("#experiment-question-dialog");
const questionScreenPart = document.querySelector("#question-screen-part");
const questionScreenTitle = document.querySelector("#experiment-question");
const questionScreenAnswers = document.querySelector("#question-screen-answers");
const questionScreenFeedback = document.querySelector("#question-screen-feedback");

function renderSelfCheck(experiment, index) {
  const part = String.fromCharCode(65 + index);
  questionScreenPart.textContent = `EXPERIMENT ${part} / QUICK QUESTION`;
  questionScreenTitle.textContent = experiment.question;
  questionScreenFeedback.textContent = "";
  questionScreenFeedback.removeAttribute("data-state");
  questionScreenAnswers.replaceChildren(...experiment.answers.map((answer, answerIndex) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.questionAnswer = String(answerIndex);

    const indexLabel = document.createElement("span");
    indexLabel.className = "question-option-index";
    indexLabel.setAttribute("aria-hidden", "true");
    indexLabel.textContent = String.fromCharCode(65 + answerIndex);

    const answerLabel = document.createElement("span");
    answerLabel.textContent = answer.text;
    button.append(indexLabel, answerLabel);
    return button;
  }));
}

function updateExperimentSource(source) {
  activeExperimentSource = source;
  experimentCode.innerHTML = highlightJulia(source);
}

function renderInlineCode(container, text) {
  const parts = text.split(/(`[^`]+`)/g);
  container.replaceChildren(...parts.map((part) => {
    if (!part.startsWith("`") || !part.endsWith("`")) {
      return document.createTextNode(part);
    }
    const code = document.createElement("code");
    code.textContent = part.slice(1, -1);
    return code;
  }));
}

function formatJuliaArray(values) {
  return `[${values.join(", ")}]`;
}

function broadcastValues(operator, values) {
  return values.map((value) => operator === ".+" ? value + 2
    : operator === ".*" ? value * 2
    : value ** 2);
}

function setPressedButton(buttons, selected) {
  buttons.forEach((button) => button.setAttribute("aria-pressed", String(button === selected)));
}

function renderConceptVisual(experiment) {
  const visual = document.querySelector("#concept-visual");
  if (experiment.control === "math-notation") {
    visual.innerHTML = `<div class="concept-figure math-notation-figure">
      <div class="concept-figure-heading"><span>GREEK LETTER AS A VARIABLE</span></div>
      <div class="math-notation-example"><code>α = 0.5</code></div>
    </div>`;
  } else if (experiment.control === "array-index") {
    visual.innerHTML = `<div class="concept-figure">
      <div class="concept-figure-heading"><span>STANDARD JULIA ARRAY</span><span>readings</span></div>
      <ol class="array-cells array-index-cells" aria-label="Readings and their Julia indexes">
        ${experiment.arrayValues.map((value, index) => `<li class="${index === 0 ? "is-selected" : ""}"><span>index ${index + 1}</span><b>${value}</b></li>`).join("")}
      </ol>
      <p id="array-index-summary"><code>readings[1]</code> selects the first element.</p>
    </div>`;
  } else if (experiment.control === "broadcast") {
    const values = experiment.broadcastValues;
    const output = broadcastValues(broadcastOperator, values);
    visual.innerHTML = `<div class="concept-figure">
      <div class="concept-figure-heading"><span>ELEMENTWISE BROADCAST</span><span>ARRAY + SCALAR</span></div>
      <div class="broadcast-example">
        <span>INPUT</span><code>${formatJuliaArray(values)}</code>
        <span>OPERATION</span><code id="broadcast-operation">${broadcastOperator} 2</code>
        <span>RESULT</span><output id="broadcast-visual-result">${formatJuliaArray(output)}</output>
      </div>
      <p>Each value receives the selected operation; the array shape is preserved.</p>
    </div>`;
  } else if (experiment.control === "dispatch") {
    visual.innerHTML = `<div class="concept-figure">
      <div class="concept-figure-heading"><span>ONE GENERIC FUNCTION</span><span>combine(a, b)</span></div>
      <div class="dispatch-method ${dispatchMode === "numbers" ? "is-selected" : ""}" id="dispatch-number-method"><code>combine(::Number, ::Number)</code><span>number method</span></div>
      <div class="dispatch-method ${dispatchMode === "vectors" ? "is-selected" : ""}" id="dispatch-vector-method"><code>combine(::AbstractVector, ::AbstractVector)</code><span>vector method</span></div>
      <p id="dispatch-summary">The Number method handles two scalar arguments.</p>
    </div>`;
  } else if (experiment.control === "jit") {
    visual.innerHTML = `<div class="concept-figure">
      <div class="concept-figure-heading"><span>JULIA EXECUTION / CONCEPTUAL</span><span>transform(::Int64)</span></div>
      <div class="jit-flow">
        <div class="jit-stage ${jitPhase === "first" ? "is-active" : "is-complete"}" id="jit-compile-stage"><span>01</span><b>Specialize &amp; compile</b></div>
        <span class="function-arrow" aria-hidden="true">→</span>
        <div class="jit-stage ${jitPhase === "first" ? "" : "is-active"}" id="jit-run-stage"><span>02</span><b>Run native code</b></div>
      </div>
      <p id="jit-summary">On first use, Julia compiles a method for the argument types, then runs it.</p>
    </div>`;
  } else if (experiment.control === "macro") {
    visual.innerHTML = `<div class="concept-figure">
      <div class="concept-figure-heading"><span>METAPROGRAMMING</span><span>EXPRESSION TRANSFORM</span></div>
      <div class="macro-transform">
        <code>total()</code><span aria-hidden="true">→</span><code id="macro-expression">@time total()</code>
      </div>
      <p id="macro-summary">The macro instruments the call with elapsed-time and allocation reporting.</p>
    </div>`;
  } else {
    visual.replaceChildren();
  }
}

function renderExperimentControl(experiment) {
  experimentControls.innerHTML = "";
  experimentOutput.textContent = "";
  if (experiment.control === "math-notation") {
    experimentControls.innerHTML = `<div class="inline-range"><label for="math-input"><span>Change x</span><b><output id="math-input-value">5</output></b></label><input id="math-input" type="range" min="1" max="12" value="5" step="1"></div>`;
    const slider = experimentControls.querySelector("input");
    const update = () => {
      const x = Number(slider.value);
      const y = 2 * x + 1;
      const scaled = .5 * y;
      experimentControls.querySelector("output").value = x;
      experimentOutput.textContent = `2x + 1 = ${y}  |  α(2x + 1) = ${scaled}`;
      experimentResult.textContent = `(${y}, ${scaled})`;
      updateExperimentSource(activeExperimentSource.replace(/x = \d+/, `x = ${x}`));
    };
    slider.addEventListener("input", update);
    update();
  } else if (experiment.control === "array-index") {
    experimentControls.innerHTML = `<div class="index-stepper" role="group" aria-label="Select an array index">
      <span class="index-stepper-label">INDEX <output id="array-index-value" aria-live="polite">1</output></span>
      <div class="index-stepper-buttons">
        <button type="button" data-index-step="-1" aria-label="Previous index" title="Previous index"><span aria-hidden="true">←</span> Previous index</button>
        <button type="button" data-index-step="1">Next index <span aria-hidden="true">→</span></button>
      </div>
    </div>`;
    const buttons = [...experimentControls.querySelectorAll("button")];
    let index = 1;
    const update = () => {
      const value = experiment.arrayValues[index - 1];
      experimentControls.querySelector("output").value = index;
      buttons[0].disabled = index === 1;
      buttons[1].disabled = index === experiment.arrayValues.length;
      document.querySelectorAll(".array-index-cells li").forEach((cell, cellIndex) => {
        cell.classList.toggle("is-selected", cellIndex === index - 1);
      });
      document.querySelector("#array-index-summary").innerHTML = `<code>readings[${index}]</code> selects the ${["first", "second", "third"][index - 1]} element.`;
      experimentOutput.textContent = `readings[${index}] = ${value}`;
      experimentResult.textContent = String(value);
      updateExperimentSource(activeExperimentSource.replace(/readings\[\d+\]/, `readings[${index}]`));
    };
    buttons.forEach((button) => button.addEventListener("click", () => {
      index += Number(button.dataset.indexStep);
      update();
    }));
    update();
  } else if (experiment.control === "broadcast") {
    experimentControls.innerHTML = `<div class="example-switch" role="group" aria-label="Choose a broadcast operator"><button type="button" data-broadcast-op=".+" aria-pressed="true">.+ add</button><button type="button" data-broadcast-op=".*" aria-pressed="false">.* multiply</button><button type="button" data-broadcast-op=".^" aria-pressed="false">.^ power</button></div>`;
    const buttons = [...experimentControls.querySelectorAll("button")];
    const update = (button) => {
      broadcastOperator = button.dataset.broadcastOp;
      setPressedButton(buttons, button);
      const values = broadcastValues(broadcastOperator, experiment.broadcastValues);
      const result = formatJuliaArray(values);
      document.querySelector("#broadcast-operation").textContent = `${broadcastOperator} 2`;
      document.querySelector("#broadcast-visual-result").textContent = result;
      experimentOutput.textContent = `values ${broadcastOperator} 2 → ${result}`;
      experimentResult.textContent = result;
      updateExperimentSource(experiment.code.replace(/values \.[+*^] 2/, `values ${broadcastOperator} 2`));
    };
    buttons.forEach((button) => button.addEventListener("click", () => update(button)));
    update(buttons[0]);
  } else if (experiment.control === "dispatch") {
    experimentControls.innerHTML = `<div class="example-switch" role="group" aria-label="Choose argument types"><button type="button" data-dispatch-mode="numbers" aria-pressed="true">Numbers</button><button type="button" data-dispatch-mode="vectors" aria-pressed="false">Vectors</button></div>`;
    const buttons = [...experimentControls.querySelectorAll("button")];
    const update = (button) => {
      dispatchMode = button.dataset.dispatchMode;
      setPressedButton(buttons, button);
      const isVector = dispatchMode === "vectors";
      const call = isVector ? "combine([1, 2], [10, 20])" : "combine(2, 3)";
      const result = isVector ? "[11, 22]" : "5";
      document.querySelector("#dispatch-number-method").classList.toggle("is-selected", !isVector);
      document.querySelector("#dispatch-vector-method").classList.toggle("is-selected", isVector);
      document.querySelector("#dispatch-summary").textContent = isVector
        ? "The vector method applies .+ elementwise to both arguments."
        : "The Number method adds the two scalar arguments.";
      experimentOutput.textContent = `${call} → ${result}`;
      experimentResult.textContent = result;
      const methods = experiment.code.split("\n\n")[0];
      updateExperimentSource(`${methods}\n\n${call}`);
    };
    buttons.forEach((button) => button.addEventListener("click", () => update(button)));
    update(buttons[0]);
  } else if (experiment.control === "jit") {
    experimentControls.innerHTML = `<div class="example-switch" role="group" aria-label="Choose a call stage"><button type="button" data-jit-phase="first" aria-pressed="true">First call</button><button type="button" data-jit-phase="later" aria-pressed="false">Later call</button></div>`;
    const buttons = [...experimentControls.querySelectorAll("button")];
    const update = (button) => {
      jitPhase = button.dataset.jitPhase;
      setPressedButton(buttons, button);
      const firstCall = jitPhase === "first";
      document.querySelector("#jit-compile-stage").classList.toggle("is-active", firstCall);
      document.querySelector("#jit-compile-stage").classList.toggle("is-complete", !firstCall);
      document.querySelector("#jit-run-stage").classList.toggle("is-active", !firstCall);
      document.querySelector("#jit-summary").textContent = firstCall
        ? "On first use, Julia compiles a method for the argument types, then runs it."
        : "A later call can reuse that compiled specialization; timing still depends on the full workload.";
      experimentOutput.textContent = firstCall
        ? "First call: compile specialization, then execute."
        : "Later call: reuse compiled method.";
      experimentResult.textContent = "transform(5) = 11";
    };
    buttons.forEach((button) => button.addEventListener("click", () => update(button)));
    update(buttons[0]);
  } else if (experiment.control === "macro") {
    experimentControls.innerHTML = `<div class="example-switch" role="group" aria-label="Compare a plain function call with a macro"><button type="button" data-macro-mode="plain" aria-pressed="false">Plain call</button><button type="button" data-macro-mode="timed" aria-pressed="true">@time</button></div>`;
    const buttons = [...experimentControls.querySelectorAll("button")];
    const update = (button) => {
      macroMode = button.dataset.macroMode;
      setPressedButton(buttons, button);
      const timed = macroMode === "timed";
      const call = timed ? "@time total()" : "total()";
      document.querySelector("#macro-expression").textContent = call;
      document.querySelector("#macro-summary").textContent = timed
        ? "The macro instruments the call with elapsed-time and allocation reporting."
        : "The function call runs without adding a timing or allocation report.";
      experimentOutput.textContent = timed
        ? "Sample: 0.000001 s, 0 allocations; result = 500500"
        : "No measurement report; result = 500500";
      experimentResult.textContent = timed
        ? experiments[5].result
        : "500500";
      updateExperimentSource(experiment.code.replace("result = @time total()", `result = ${call}`));
    };
    buttons.forEach((button) => button.addEventListener("click", () => update(button)));
    update(buttons[1]);
  }
}

function selectExperiment(tab, focus = false) {
  const index = Number(tab.dataset.exp);
  experimentIndex = index;
  experimentTabs.forEach((item) => {
    const active = item === tab;
    item.classList.toggle("is-active", active);
    item.setAttribute("aria-selected", String(active));
    item.tabIndex = active ? 0 : -1;
  });
  const experiment = experiments[index];
  broadcastOperator = ".+";
  dispatchMode = "numbers";
  jitPhase = "first";
  macroMode = "timed";
  const experimentPanel = document.querySelector("#experiment-panel");
  experimentPanel.dataset.exp = String(index);
  experimentPanel.setAttribute("aria-labelledby", tab.id);
  document.querySelector("#experiment-title").textContent = experiment.title;
  document.querySelector("#experiment-story").textContent = experiment.story;
  experimentNoteLabel.textContent = experiment.detailTitle;
  renderInlineCode(document.querySelector("#experiment-note"), experiment.note);
  if (experiment.control === "math-notation") {
    experimentControls.before(conceptVisual);
  } else {
    conceptVisual.before(experimentControls);
  }
  renderConceptVisual(experiment);
  updateExperimentSource(experiment.code);
  experimentResult.textContent = experiment.result;
  renderExperimentControl(experiment);
  renderSelfCheck(experiment, index);
  if (focus) tab.focus();
}
experimentTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => selectExperiment(tab));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0
      : event.key === "End" ? experimentTabs.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + experimentTabs.length) % experimentTabs.length;
    selectExperiment(experimentTabs[next], true);
  });
});
selectExperiment(experimentTabs[0]);

const questionScreenClose = document.querySelector("#question-screen-close");
selfCheckTrigger.addEventListener("click", () => {
  renderSelfCheck(experiments[experimentIndex], experimentIndex);
  questionDialog.showModal();
  questionScreenTitle.focus({ preventScroll: true });
});
questionScreenClose.addEventListener("click", () => questionDialog.close());
questionScreenAnswers.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-question-answer]");
  if (!button || button.disabled) return;

  const answer = experiments[experimentIndex].answers[Number(button.dataset.questionAnswer)];
  questionScreenAnswers.querySelectorAll("button").forEach((option) => {
    option.removeAttribute("data-result");
    option.setAttribute("aria-pressed", String(option === button));
  });
  button.dataset.result = answer.correct ? "correct" : "incorrect";
  questionScreenFeedback.dataset.state = answer.correct ? "correct" : "incorrect";
  questionScreenFeedback.textContent = `${answer.correct ? "Correct." : "Not quite."} ${answer.feedback}`;
  if (answer.correct) {
    questionScreenAnswers.querySelectorAll("button").forEach((option) => {
      option.disabled = true;
    });
    window.setTimeout(() => {
      questionDialog.close();
    }, 1000);
  }
});

document.querySelectorAll(".check-options button").forEach((button) => {
  button.addEventListener("click", () => {
    const correct = button.dataset.answer === "two-language";
    document.querySelectorAll(".check-options button").forEach((item) => item.removeAttribute("aria-pressed"));
    button.setAttribute("aria-pressed", "true");
    const feedback = document.querySelector("#quiz-feedback");
    feedback.textContent = correct
      ? "Correct. Julia aims to combine high-level productivity with high-performance computing in one language."
      : "Not quite. Julia was designed to avoid the rewrite between an easy prototyping language and a faster implementation language.";
    feedback.style.color = correct ? "var(--lime)" : "#ff9c83";
  });
});

const quizToggle = document.querySelector("#quiz-toggle");
const quizContent = document.querySelector("#quiz-content");
const quizDisclosureIcon = quizToggle.querySelector(".check-disclosure-icon");
quizToggle.addEventListener("click", () => {
  const expanded = quizToggle.getAttribute("aria-expanded") !== "true";
  quizToggle.setAttribute("aria-expanded", String(expanded));
  quizContent.hidden = !expanded;
  quizDisclosureIcon.textContent = expanded ? "−" : "+";
});

const gardenLessonSteps = [
  {
    id: "dispatch",
    comparison: {
      title: "Choosing a plant threshold",
      languages: [
        {
          label: "JULIA / MULTIPLE DISPATCH",
          language: "julia",
          code: "dry_limit(::Lettuce) = 5.0\ndry_limit(::Cactus) = 2.0"
        },
        {
          label: "PYTHON / EXPLICIT BRANCHES",
          language: "python",
          code: "def dry_limit(plant):\n    if isinstance(plant, Lettuce):\n        return 5.0\n    if isinstance(plant, Cactus):\n        return 2.0\n    raise TypeError(\"Unknown plant\")"
        }
      ],
      note: [
        { text: "This Python example uses explicit branches. Python also offers " },
        { code: "singledispatch" },
        { text: " for dispatch on the first argument, while Julia's built-in method system can select a method from the types of all positional arguments." }
      ]
    },
    name: "Dispatch",
    title: "How can Julia choose a dry-soil limit for each plant?",
    story: "",
    explanation: "",
    lesson: {
      intro: "A Julia function can have several methods. Multiple dispatch picks the most specific method whose argument types match the call.",
      examples: [
        {
          code: "describe(x::Int) = \"integer\"\ndescribe(x::Float64) = \"decimal\"",
          note: "One function name can have methods for different argument types."
        },
        {
          code: "describe(3.5) # \"decimal\"",
          note: "Julia selects the method that matches the value passed in."
        }
      ]
    },
    context: "abstract type Plant end\nstruct Lettuce <: Plant end\nstruct Cactus <: Plant end\n\n# DISPATCH: Plant type selects the matching dry-limit method.",
    question: "Complete the method signatures that set the lettuce 🥬 and cactus 🌵 thresholds.",
    questionEmphasis: ["lettuce", "cactus"],
    prefix: "dry_limit(::",
    suffix: ") = 5.0",
    expected: "Lettuce",
    followUp: {
      prefix: "dry_limit(::",
      suffix: ") = 2.0",
      expected: "Cactus"
    },
    hint: "Use the plant type names exactly as shown above.",
    feedback: "Correct. Each plant type selects its matching dry_limit method.",
    snippet: "abstract type Plant end\nstruct Lettuce <: Plant end\nstruct Cactus <: Plant end\n\n# DISPATCH: Plant type selects the matching dry-limit method.\ndry_limit(::Lettuce) = 5.0\ndry_limit(::Cactus) = 2.0\n\n"
  },
  {
    id: "jit",
    name: "JIT compile",
    title: "How can Julia specialize one method for each plant type?",
    story: "",
    explanation: "",
    lesson: {
      intro: "Julia compiles functions as they are used and specializes compiled code for concrete argument types. Type annotations can clarify constraints, but are not required for specialization.",
      examples: [
        {
          code: "daily_change(rain, evaporation) = rain - evaporation",
          note: "This function accepts values without declaring their types."
        },
        {
          code: "daily_change(8.0, 2.5) # Float64\ndaily_change(8, 2)     # Int",
          note: "Different argument types can get specialized compiled methods; the first call may include compilation."
        }
      ]
    },
    context: "abstract type Plant end\nstruct Lettuce <: Plant end\nstruct Cactus <: Plant end\n\nfunction simulate(rain::Vector{Float64}, plant::T, temperature::Float64)",
    question: "Which shared parent type should constrain T?",
    prefix: "where {T <: ",
    suffix: "}",
    expected: "Plant",
    hint: "Use the abstract parent type shared by Lettuce and Cactus.",
    feedback: "Correct. Julia specializes this method for concrete plant types when it is called.",
    snippet: "# JIT COMPILE: Julia specializes and compiles methods when they are first needed.\nfunction simulate(rain::Vector{Float64}, plant::T, temperature::Float64) where {T <: Plant}\n"
  },
  {
    id: "math",
    name: "Math syntax",
    title: "How can Julia express 10% of temperature compactly?",
    story: "",
    explanation: "",
    lesson: {
      intro: "Julia keeps familiar mathematical operations and function calls compact and readable.",
      examples: [
        {
          code: "soil_water += rainfall",
          note: "A compact update, equivalent to adding rainfall and assigning the result."
        },
        {
          code: "distance = sqrt(x^2 + y^2)",
          note: "Use ^ for powers and ordinary function calls for calculations."
        },
        {
          code: "mean_rain = sum(rain) / length(rain)",
          note: "Built-in functions combine naturally in a formula."
        }
      ]
    },
    context: "temperature = 25.0",
    question: "Write the multiplication expression using Julia's compact syntax.",
    prefix: "evaporation = ",
    suffix: "",
    expected: "0.1temperature",
    hint: "Put the number directly beside the variable.",
    feedback: "Correct. Julia's numeric-literal coefficient keeps this multiplication compact.",
    snippet: "    # MATH SYNTAX: A number beside a variable means multiplication.\n    evaporation = 0.1temperature\n\n"
  },
  {
    id: "broadcast",
    comparison: {
      title: "Subtracting evaporation from every day",
      languages: [
        {
          label: "JULIA / BROADCAST",
          language: "julia",
          code: "daily_change = rain .- evaporation"
        },
        {
          label: "PYTHON / NUMPY",
          language: "python",
          code: "import numpy as np\ndaily_change = np.asarray(rain) - evaporation"
        }
      ],
      note: "Both examples broadcast a scalar across an array. Julia marks elementwise work with dots; NumPy provides similar array behavior in Python. A regular Python list does not subtract a scalar this way."
    },
    comparison2: {
      title: "The same update, different responsibilities",
      languages: [
        {
          label: "JULIA / ARRAY BROADCAST",
          language: "julia",
          code: "daily_change = rain .- evaporation"
        },
        {
          label: "C / EXPLICIT ARRAY LOOP",
          language: "c",
          code: "#include <stddef.h>\n\nvoid subtract_evaporation(const double *rain,\n                          double evaporation,\n                          double *daily_change,\n                          size_t count)\n{\n    for (size_t day = 0; day < count; ++day) {\n        daily_change[day] = rain[day] - evaporation;\n    }\n}"
        }
      ],
      note: "Julia's dotted subtraction applies the operation elementwise and creates a result array. C makes the iteration explicit and writes into output storage supplied by the caller, who must provide valid buffers and the correct count. This compares abstraction and memory responsibilities, not a blanket speed claim."
    },
    name: "Broadcasting",
    title: "How can one subtraction adjust every rainfall value?",
    story: "",
    explanation: "",
    lesson: {
      intro: "A dot applies an operation element by element. Julia can broadcast a scalar or combine compatible arrays.",
      examples: [
        {
          code: "readings .+ 0.5",
          note: "Add the same scalar value to every item."
        },
        {
          code: "readings .> 20.0",
          note: "Compare every item and get a Boolean result for each one."
        },
        {
          code: "round.(readings)",
          note: "The dot after a function name applies it to every item."
        }
      ]
    },
    context: "rain = [8.0, 1.0, 4.0, 0.0, 6.0, 2.0, 5.0]\nevaporation = 2.5",
    question: "Which operator subtracts evaporation element by element?",
    prefix: "daily_change = rain ",
    suffix: " evaporation",
    expected: ".-",
    hint: "The dot goes immediately before the minus sign.",
    feedback: "Correct. Dotted subtraction applies the operation to each rainfall value.",
    snippet: "    # BROADCASTING: Dotted subtraction applies to every day's rainfall.\n    daily_change = rain .- evaporation\n\n"
  },
  {
    id: "arrays",
    name: "1-based arrays",
    title: "Which index stores the first day's soil-water value?",
    story: "",
    explanation: "",
    lesson: {
      intro: "Julia provides direct access to array positions, plus helpers for referring to the end and iterating over valid indices.",
      examples: [
        {
          code: "samples = [8.0, 1.0, 4.0]\nsamples[end] # 4.0",
          note: "Within brackets, end refers to the final position."
        },
        {
          code: "for position in eachindex(samples)\n    println(samples[position])\nend",
          note: "eachindex supplies valid positions when looping over an array."
        }
      ]
    },
    context: "soil = zeros(length(rain))",
    question: "Complete the index used for day one.",
    prefix: "soil[",
    suffix: "] = clamp(10.0 + daily_change[1], 0.0, 20.0)",
    expected: "1",
    hint: "The first position in a standard Julia array is not zero.",
    feedback: "Correct. Index 1 stores day one; the loop can then build on the previous day's value.",
    snippet: "    soil = zeros(length(rain))\n\n    # 1-BASED ARRAYS: The first day is stored at index 1.\n    soil[1] = clamp(10.0 + daily_change[1], 0.0, 20.0)\n    for day in 2:length(rain)\n        soil[day] = clamp(soil[day - 1] + daily_change[day], 0.0, 20.0)\n    end\n\n    dry_days = count(water -> water < dry_limit(plant), soil)\n    within_limit = dry_days <= 2\n    return (soil=soil, dry_days=dry_days, within_limit=within_limit)\nend\n\n"
  },
  {
    id: "macros",
    name: "Macros",
    title: "Which Julia macro times a model run and reports allocations?",
    story: "",
    explanation: "",
    lesson: {
      intro: "Macros start with @ and transform an expression before Julia evaluates it. These built-in macros help inspect values, check assumptions, and work with arrays.",
      examples: [
        {
          code: "@show temperature",
          note: "Prints the expression and its value, then returns the value."
        },
        {
          code: "@assert all(readings .>= 0)",
          note: "Raises an error if the condition is false."
        },
        {
          code: "window = @view readings[2:4]",
          note: "Creates a view into part of an array instead of copying those values."
        }
      ]
    },
    context: "rain = [8.0, 1.0, 4.0, 0.0, 6.0, 2.0, 5.0]\nplant = Lettuce()\ntemperature = 25.0",
    question: "Complete the call with Julia's timing macro.",
    prefix: "result = ",
    suffix: " simulate(rain, plant, temperature)",
    expected: "@time",
    hint: "The macro starts with @ and wraps the function call.",
    feedback: "Correct. After a warm-up call, @time reports elapsed time and allocations for one subsequent call.",
    snippet: "rain = [8.0, 1.0, 4.0, 0.0, 6.0, 2.0, 5.0]\nplant = Lettuce()\ntemperature = 25.0\n\n# WARM-UP: Compile simulate for these input types before timing.\nsimulate(rain, plant, temperature)\n\n# TIMED RUN: @time reports elapsed time and allocations for one call.\nresult = @time simulate(rain, plant, temperature)"
  }
];

const lessonActive = document.querySelector("#lesson-active");
const lessonFinish = document.querySelector("#lesson-finish");
const lessonPromptPanel = document.querySelector("#lesson-prompt-panel");
const lessonViewTabs = [...document.querySelectorAll("[data-lesson-view]")];
const lessonConceptPanel = document.querySelector("#lesson-concept-panel");
const lessonCodePanel = document.querySelector("#lesson-code-panel");
const lessonComparisonPanel = document.querySelector("#lesson-comparison-panel");
const lessonComparisonTab = document.querySelector("#lesson-tab-comparison");
const lessonComparisonPanel2 = document.querySelector("#lesson-comparison-panel-2");
const lessonComparisonTab2 = document.querySelector("#lesson-tab-comparison-2");
const lessonComparisonTabs = [lessonComparisonTab, lessonComparisonTab2];
const lessonTitle = document.querySelector("#lesson-title");
const lessonContextCode = document.querySelector("#lesson-context-code");
const lessonStory = document.querySelector("#lesson-story");
const lessonExplanation = document.querySelector("#lesson-explanation");
const lessonQuestion = document.querySelector("#lesson-question");
const lessonPrefix = document.querySelector("#lesson-prefix");
const lessonSuffix = document.querySelector("#lesson-suffix");
const lessonAnswer = document.querySelector("#lesson-answer");
const lessonFollowUp = document.querySelector("#lesson-follow-up");
const lessonFollowUpPrefix = document.querySelector("#lesson-follow-up-prefix");
const lessonFollowUpSuffix = document.querySelector("#lesson-follow-up-suffix");
const lessonFollowUpAnswer = document.querySelector("#lesson-follow-up-answer");
const lessonAnswerForm = document.querySelector("#lesson-answer-form");
const lessonAnswerHint = document.querySelector("#lesson-answer-hint");
const lessonFeedback = document.querySelector("#lesson-feedback");
const caseSensitivityDialog = document.querySelector("#case-sensitivity-dialog");
const caseSensitivityExamples = document.querySelector("#case-sensitivity-examples");
const caseSensitivityClose = document.querySelector("#case-sensitivity-close");
const lessonReveal = document.querySelector("#lesson-reveal");
const lessonPieceCode = document.querySelector("#lesson-piece-code");
const lessonCopyPiece = document.querySelector("#lesson-copy-piece");
const lessonNext = document.querySelector("#lesson-next");
const lessonCompleteCode = document.querySelector("#lesson-complete-code");
const lessonProgressTrack = document.querySelector("#lesson-progress-track");
const lessonProgressFill = document.querySelector("#lesson-progress-fill");
const lessonStepIndicators = [...document.querySelectorAll("[data-lesson-indicator]")];
const completedGardenSteps = new Set();
const gardenLessonDrafts = new Map();
let gardenLessonIndex = 0;
let caseSensitivityReturnFocus = null;

const gardenLessonFullProgram = gardenLessonSteps.map((step) => step.snippet).join("");

function renderLessonQuestion(element, text, emphasis) {
  const emphasisTerms = (Array.isArray(emphasis) ? emphasis : [emphasis]).filter(Boolean);
  const matches = emphasisTerms
    .map((term) => ({ term, start: text.indexOf(term) }))
    .filter((match) => match.start >= 0)
    .sort((a, b) => a.start - b.start);
  if (!matches.length) {
    element.textContent = text;
    return;
  }

  const parts = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start < cursor) continue;
    parts.push(document.createTextNode(text.slice(cursor, match.start)));
    const highlightedWord = document.createElement("span");
    highlightedWord.className = "lesson-plant-emphasis";
    highlightedWord.textContent = match.term;
    parts.push(highlightedWord);
    cursor = match.start + match.term.length;
  }
  parts.push(document.createTextNode(text.slice(cursor)));
  element.replaceChildren(...parts);
}

function renderGardenLessonConcept(lesson) {
  const intro = document.createElement("p");
  intro.className = "lesson-concept-intro";
  intro.textContent = lesson.intro;

  const examples = document.createElement("ul");
  examples.className = "lesson-concept-examples";
  lesson.examples.forEach((example) => {
    const item = document.createElement("li");
    item.className = "lesson-concept-example";

    const pre = document.createElement("pre");
    pre.className = "lesson-concept-code";
    const code = document.createElement("code");
    code.innerHTML = highlightJulia(example.code);
    pre.append(code);

    const note = document.createElement("p");
    note.className = "lesson-concept-note";
    note.textContent = example.note;

    item.append(pre, note);
    examples.append(item);
  });

  lessonConceptPanel.replaceChildren(intro, examples);
}

function renderGardenLessonComparison(comparison, panel = lessonComparisonPanel) {
  if (!comparison) {
    panel.replaceChildren();
    return;
  }

  const title = document.createElement("h3");
  title.textContent = comparison.title;

  const grid = document.createElement("div");
  grid.className = "lesson-comparison-grid";
  comparison.languages.forEach((languageExample) => {
    const languageBlock = document.createElement("div");
    languageBlock.className = "lesson-comparison-language";

    const label = document.createElement("span");
    label.className = "lesson-comparison-label";
    label.textContent = languageExample.label;

    const pre = document.createElement("pre");
    pre.className = "lesson-concept-code";
    const code = document.createElement("code");
    if (languageExample.language === "julia") {
      code.innerHTML = highlightJulia(languageExample.code);
    } else {
      code.textContent = languageExample.code;
    }
    pre.append(code);
    languageBlock.append(label, pre);
    grid.append(languageBlock);
  });

  const note = document.createElement("p");
  note.className = "lesson-comparison-note";
  const noteParts = Array.isArray(comparison.note) ? comparison.note : [{ text: comparison.note }];
  noteParts.forEach((part) => {
    if (part.code) {
      const inlineCode = document.createElement("code");
      inlineCode.textContent = part.code;
      note.append(inlineCode);
    } else {
      note.append(document.createTextNode(part.text));
    }
  });
  panel.replaceChildren(title, grid, note);
}

function selectGardenLessonView(view, focus = false) {
  const activeTab = lessonViewTabs.find((tab) => tab.dataset.lessonView === view);
  const panels = {
    lesson: lessonConceptPanel,
    code: lessonCodePanel,
    comparison: lessonComparisonPanel,
    comparison2: lessonComparisonPanel2
  };
  lessonViewTabs.forEach((tab) => {
    const selected = tab === activeTab;
    tab.setAttribute("aria-selected", String(selected));
    tab.tabIndex = selected ? 0 : -1;
    tab.classList.toggle("is-active", selected);
  });
  Object.entries(panels).forEach(([panelView, panel]) => {
    panel.hidden = panelView !== view;
  });
  if (focus) activeTab.focus();
}

lessonViewTabs.forEach((tab) => {
  tab.addEventListener("click", () => selectGardenLessonView(tab.dataset.lessonView));
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const availableTabs = lessonViewTabs.filter((item) => !item.hidden);
    const index = availableTabs.indexOf(tab);
    const nextIndex = event.key === "Home" ? 0
      : event.key === "End" ? availableTabs.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + availableTabs.length) % availableTabs.length;
    selectGardenLessonView(availableTabs[nextIndex].dataset.lessonView, true);
  });
});

function updateGardenLessonProgress() {
  const count = completedGardenSteps.size;
  lessonProgressTrack.setAttribute("aria-valuenow", String(count));
  lessonProgressFill.style.width = `${count / gardenLessonSteps.length * 100}%`;
  lessonStepIndicators.forEach((indicator, index) => {
    const step = gardenLessonSteps[index];
    indicator.classList.toggle("is-complete", Boolean(step && completedGardenSteps.has(step.id)));
    if (index === gardenLessonIndex) {
      indicator.setAttribute("aria-current", "step");
    } else {
      indicator.removeAttribute("aria-current");
    }
  });
}

function renderGardenLessonStep() {
  const step = gardenLessonSteps[gardenLessonIndex];
  if (!step) {
    lessonActive.hidden = true;
    lessonFinish.hidden = false;
    lessonPromptPanel.setAttribute("aria-labelledby", "lesson-finish-title");
    lessonCompleteCode.innerHTML = highlightJulia(gardenLessonFullProgram);
    updateGardenLessonProgress();
    return;
  }

  const comparisonWasFocused = lessonComparisonTabs.includes(document.activeElement);
  lessonComparisonTab.hidden = !step.comparison;
  lessonComparisonTab2.hidden = !step.comparison2;
  selectGardenLessonView("lesson");
  if (comparisonWasFocused && lessonComparisonTabs.every((tab) => tab.hidden)) {
    lessonViewTabs.find((tab) => tab.dataset.lessonView === "lesson").focus();
  }
  lessonActive.hidden = false;
  lessonFinish.hidden = true;
  lessonPromptPanel.setAttribute("aria-labelledby", "lesson-title");
  lessonTitle.textContent = step.title;
  renderGardenLessonConcept(step.lesson);
  renderGardenLessonComparison(step.comparison, lessonComparisonPanel);
  renderGardenLessonComparison(step.comparison2, lessonComparisonPanel2);
  lessonContextCode.hidden = !step.context;
  lessonContextCode.querySelector("code").textContent = step.context || "";
  lessonStory.textContent = step.story;
  lessonStory.hidden = !step.story;
  lessonExplanation.textContent = step.explanation;
  lessonExplanation.hidden = !step.explanation;
  renderLessonQuestion(lessonQuestion, step.question, step.questionEmphasis);
  lessonPrefix.textContent = step.prefix;
  lessonSuffix.textContent = step.suffix;
  const isComplete = completedGardenSteps.has(step.id);
  const savedAnswers = gardenLessonDrafts.get(step.id);
  lessonAnswer.value = isComplete ? step.expected : savedAnswers?.answer || "";
  lessonAnswer.disabled = isComplete;
  lessonFollowUp.hidden = !step.followUp;
  lessonFollowUpAnswer.disabled = !step.followUp || isComplete;
  lessonFollowUpAnswer.required = Boolean(step.followUp);
  lessonFollowUpAnswer.value = isComplete ? step.followUp?.expected || "" : savedAnswers?.followUpAnswer || "";
  if (step.followUp) {
    lessonFollowUpPrefix.textContent = step.followUp.prefix;
    lessonFollowUpSuffix.textContent = step.followUp.suffix;
  }
  lessonAnswerHint.textContent = step.hint;
  lessonAnswerForm.querySelector("#lesson-check").disabled = isComplete;
  lessonFeedback.textContent = isComplete ? step.feedback : "";
  if (isComplete) lessonFeedback.dataset.state = "correct";
  else lessonFeedback.removeAttribute("data-state");
  lessonReveal.hidden = !isComplete;
  lessonPieceCode.textContent = step.snippet;
  if (isComplete) lessonPieceCode.innerHTML = highlightJulia(step.snippet);
  lessonCopyPiece.disabled = !isComplete;
  lessonNext.hidden = !isComplete;
  lessonNext.textContent = gardenLessonIndex === gardenLessonSteps.length - 1
    ? "View complete code"
    : "Next Julia idea";
  updateGardenLessonProgress();
}

function saveGardenLessonDraft() {
  const step = gardenLessonSteps[gardenLessonIndex];
  if (!step || completedGardenSteps.has(step.id)) return;
  gardenLessonDrafts.set(step.id, {
    answer: lessonAnswer.value,
    followUpAnswer: lessonFollowUpAnswer.value
  });
}

lessonAnswer.addEventListener("input", saveGardenLessonDraft);
lessonFollowUpAnswer.addEventListener("input", saveGardenLessonDraft);

caseSensitivityDialog.addEventListener("close", () => {
  caseSensitivityReturnFocus?.focus({ preventScroll: true });
  caseSensitivityReturnFocus = null;
});
caseSensitivityClose.addEventListener("click", () => caseSensitivityDialog.close());

lessonStepIndicators.forEach((indicator, index) => {
  indicator.addEventListener("click", () => {
    saveGardenLessonDraft();
    gardenLessonIndex = index;
    renderGardenLessonStep();
  });
});

lessonAnswerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const step = gardenLessonSteps[gardenLessonIndex];
  const answer = lessonAnswer.value.trim();
  const followUpAnswer = lessonFollowUpAnswer.value.trim();
  const firstCorrect = answer === step.expected;
  const followUpCorrect = !step.followUp
    || followUpAnswer === step.followUp.expected;
  if (!firstCorrect || !followUpCorrect) {
    lessonFeedback.dataset.state = "incorrect";
    const attemptedAnswers = [
      { answer, expected: step.expected, input: lessonAnswer },
      ...(step.followUp
        ? [{ answer: followUpAnswer, expected: step.followUp.expected, input: lessonFollowUpAnswer }]
        : [])
    ];
    const caseMismatches = attemptedAnswers.filter(({ answer: value, expected }) =>
      value !== expected && value.toLowerCase() === expected.toLowerCase()
    );
    if (caseMismatches.length) {
      caseSensitivityExamples.replaceChildren(...caseMismatches.map(({ answer: value, expected }) => {
        const item = document.createElement("li");
        const typedCode = document.createElement("code");
        typedCode.textContent = value;
        const explanation = document.createElement("span");
        explanation.textContent = " is not the same as ";
        const expectedCode = document.createElement("code");
        expectedCode.textContent = expected;
        item.append(typedCode, explanation, expectedCode);
        return item;
      }));
      caseSensitivityReturnFocus = caseMismatches[0].input;
      lessonFeedback.textContent = "Julia is case-sensitive. Match the capitalization shown in the message.";
      caseSensitivityDialog.showModal();
      caseSensitivityClose.focus({ preventScroll: true });
      return;
    }
    lessonFeedback.textContent = step.followUp
      ? "Not quite. Check both plant type names, then try again."
      : "Not quite. Try again, or use the hint above.";
    return;
  }

  lessonAnswer.disabled = true;
  lessonFollowUpAnswer.disabled = true;
  lessonAnswerForm.querySelector("#lesson-check").disabled = true;
  lessonFeedback.dataset.state = "correct";
  lessonFeedback.textContent = step.feedback;
  lessonReveal.hidden = false;
  lessonCopyPiece.disabled = false;
  lessonPieceCode.innerHTML = highlightJulia(step.snippet);
  completedGardenSteps.add(step.id);
  gardenLessonDrafts.delete(step.id);
  updateGardenLessonProgress();
  lessonNext.hidden = false;
  lessonCopyPiece.focus();
  showAnswerConfetti();
});

lessonNext.addEventListener("click", () => {
  gardenLessonIndex += 1;
  renderGardenLessonStep();
  lessonStepIndicators[gardenLessonIndex].focus();
});

renderGardenLessonStep();

const projectFlightInputs = {
  speed: document.querySelector("#project-velocity-slider"),
  angle: document.querySelector("#project-angle-slider"),
  gravity: document.querySelector("#project-gravity-slider")
};
const svgNS = "http://www.w3.org/2000/svg";
let currentFlight = null;
let replayFrame = 0;

function flightPhysics(speed, angleDegrees, gravity) {
  const angle = angleDegrees * Math.PI / 180;
  const horizontal = speed * Math.cos(angle);
  const vertical = speed * Math.sin(angle);
  const time = 2 * vertical / gravity;
  const range = horizontal * time;
  const height = vertical ** 2 / (2 * gravity);
  return { horizontal, vertical, time, range, height };
}

function updatePlotGrid(group, width, height, columns = 6, rows = 4, offsetX = 0, offsetY = 0) {
  group.replaceChildren();
  for (let i = 0; i <= columns; i += 1) {
    const x = width * i / columns;
    const line = document.createElementNS(svgNS, "path");
    line.setAttribute("d", `M${offsetX + x} ${offsetY}V${offsetY + height}`);
    group.append(line);
  }
  for (let i = 0; i <= rows; i += 1) {
    const y = height * i / rows;
    const line = document.createElementNS(svgNS, "path");
    line.setAttribute("d", `M${offsetX} ${offsetY + y}H${offsetX + width}`);
    group.append(line);
  }
}
updatePlotGrid(document.querySelector("#project-grid"), 440, 200, 5, 4, 34, 50);

function updateFlight() {
  const speed = Number(projectFlightInputs.speed.value);
  const angle = Number(projectFlightInputs.angle.value);
  const gravity = Number(projectFlightInputs.gravity.value);
  const physics = flightPhysics(speed, angle, gravity);
  currentFlight = { speed, angle, gravity, ...physics };
  document.querySelector("#project-velocity-value").value = speed;
  document.querySelector("#project-angle-value").value = angle;
  document.querySelector("#project-gravity-value").value = gravity.toFixed(2);
  document.querySelectorAll(".project-gravity-presets [data-gravity]").forEach((button) => {
    const selected = Math.abs(Number(button.dataset.gravity) - gravity) < 0.005;
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  document.querySelector("#project-range").value = physics.range.toFixed(1);
  document.querySelector("#project-time").value = physics.time.toFixed(2);
  document.querySelector("#project-height").value = physics.height.toFixed(1);
  document.querySelector("#landing-status").textContent = physics.range <= 150 ? "WITHIN FIELD" : "PAST FIELD LIMIT";
  document.querySelector("#landing-status").style.color = physics.range <= 150 ? "var(--julia-green)" : "var(--coral)";

  const projectMaxX = Math.max(165, physics.range * 1.12);
  const projectMaxY = Math.max(35, physics.height * 1.2);
  const projectMapX = (x) => 34 + x / projectMaxX * 440;
  const projectMapY = (y) => 250 - y / projectMaxY * 200;
  const projectPoints = [];
  for (let i = 0; i <= 45; i += 1) {
    const t = physics.time * i / 45;
    const x = physics.horizontal * t;
    const y = Math.max(0, physics.vertical * t - .5 * gravity * t ** 2);
    projectPoints.push(`${i === 0 ? "M" : "L"}${projectMapX(x).toFixed(2)} ${projectMapY(y).toFixed(2)}`);
  }
  document.querySelector("#project-curve").setAttribute("d", projectPoints.join(" "));
  document.querySelector("#project-end").setAttribute("cx", projectMapX(physics.range));
  document.querySelector("#project-end").setAttribute("cy", "250");
  updateProjectCode();
  updateHeroScene(physics);
}

function updateHeroScene(physics) {
  const scaleX = (x) => 90 + (x / Math.max(physics.range, 1)) * 535;
  const scaleY = (y) => 340 - (y / Math.max(physics.height, 1)) * 235;
  const pathPoints = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = physics.time * i / 40;
    const x = physics.horizontal * t;
    const y = Math.max(0, physics.vertical * t - .5 * physics.gravity * t ** 2);
    pathPoints.push(`${i === 0 ? "M" : "L"}${scaleX(x).toFixed(1)} ${scaleY(y).toFixed(1)}`);
  }
  const path = pathPoints.join(" ");
  document.querySelector("#hero-trajectory .trajectory-path").setAttribute("d", path);
  document.querySelector("#hero-trajectory .trajectory-shadow").setAttribute("d", path);
  const apex = document.querySelector("#hero-trajectory .apex-point");
  apex.setAttribute("cx", scaleX(physics.range / 2));
  apex.setAttribute("cy", scaleY(physics.height));
  document.querySelector("#hero-trajectory .target-point").setAttribute("cx", scaleX(physics.range));
  document.querySelector(".scene-readout b").textContent = Math.round(physics.range);
}

function updateProjectCode() {
  if (!currentFlight) return;
  const code = `# Ideal projectile motion on level ground
function flight_time(v0, angle, g)
    2 * v0 * sin(angle) / g
end

function height_at(t, v0, angle, g)
    v0 * sin(angle) * t - 0.5 * g * t^2
end

function simulate(v0, angle, g, field_limit)
    t_flight = flight_time(v0, angle, g)
    times = range(0, t_flight; length=51)
    heights = height_at.(times, v0, angle, g)
    max_height = 0.0
    for height in heights
        if height > max_height
            max_height = height
        end
    end
    distance = v0 * cos(angle) * t_flight

    landing = if distance <= field_limit
        "within field"
    else
        "past field limit"
    end

    return (flight_time=t_flight, times=times, heights=heights,
            max_height=max_height, distance=distance, landing=landing)
end

result = simulate(${currentFlight.speed}.0, deg2rad(${currentFlight.angle}.0),
                  ${currentFlight.gravity.toFixed(2)}, 150.0)
println(result.landing)`;
  document.querySelector("#project-code").innerHTML = highlightJulia(code);
}

const climateYears = [2000, 2005, 2010, 2015, 2020, 2023, 2025];
const climateBase = [0.42, 0.48, 0.56, 0.68, 0.73, 0.82];
const climatePlot = document.querySelector("#climate-plot");
const climatePlotBounds = { left: 60, right: 490, top: 38, bottom: 220, max: 2 };

function updateClimateProjectCode(latestAnomaly) {
  const code = `using Statistics

years = [2000, 2005, 2010, 2015, 2020, 2023, 2025]
anomalies = [0.42, 0.48, 0.56, 0.68, 0.73, 0.82, ${latestAnomaly.toFixed(2)}]

mean_anomaly = mean(anomalies)
warming_per_decade =
    (last(anomalies) - first(anomalies)) / ((last(years) - first(years)) / 10)

threshold = 1.5
assessment = if last(anomalies) >= threshold
    "above teaching threshold"
else
    "below teaching threshold"
end

println((mean_anomaly, warming_per_decade, assessment))`;
  document.querySelector("#climate-project-code").innerHTML = highlightJulia(code);
}

function updateClimate() {
  if (!climatePlot) return;
  const latestAnomaly = Number(document.querySelector("#latest-anomaly").value);
  const anomalies = [...climateBase, latestAnomaly];
  const { left, right, top, bottom, max } = climatePlotBounds;
  const grid = document.querySelector("#climate-grid");
  if (!grid.childElementCount) {
    for (let step = 0; step <= 4; step += 1) {
      const value = step * 0.5;
      const y = bottom - value / max * (bottom - top);
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", left);
      line.setAttribute("x2", right);
      line.setAttribute("y1", y);
      line.setAttribute("y2", y);
      grid.append(line);

      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("x", "49");
      label.setAttribute("y", y + 3);
      label.setAttribute("text-anchor", "end");
      label.textContent = value.toFixed(1);
      grid.append(label);
    }
  }
  const xAt = (index) => left + (right - left) * index / (anomalies.length - 1);
  const yAt = (value) => bottom - value / max * (bottom - top);
  const points = anomalies.map((value, index) => ({
    x: xAt(index),
    y: yAt(value),
    value,
    year: climateYears[index]
  }));
  const linePath = points.map((point, index) =>
    `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`
  ).join(" ");
  const first = points[0];
  const last = points.at(-1);
  document.querySelector("#climate-line").setAttribute("d", linePath);
  document.querySelector("#climate-area").setAttribute(
    "d",
    `${linePath} L${last.x.toFixed(1)} ${bottom} L${first.x.toFixed(1)} ${bottom} Z`
  );

  const pointsGroup = document.querySelector("#climate-points");
  const labelsGroup = document.querySelector("#climate-labels");
  pointsGroup.replaceChildren();
  labelsGroup.replaceChildren();
  points.forEach((point) => {
    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", point.x);
    circle.setAttribute("cy", point.y);
    circle.setAttribute("r", point.year === 2025 ? "5.5" : "3.5");
    circle.classList.add("climate-point");
    const title = document.createElementNS(svgNS, "title");
    title.textContent = `${point.year}: ${point.value.toFixed(2)} °C`;
    circle.append(title);
    pointsGroup.append(circle);

    const label = document.createElementNS(svgNS, "text");
    label.setAttribute("x", point.x);
    label.setAttribute("y", "244");
    label.setAttribute("text-anchor", "middle");
    label.textContent = point.year;
    labelsGroup.append(label);
  });

  const values = anomalies;
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const rate = (values.at(-1) - values[0]) / ((climateYears.at(-1) - climateYears[0]) / 10);
  document.querySelector("#latest-anomaly-value").value = latestAnomaly.toFixed(2);
  document.querySelector("#climate-mean").value = mean.toFixed(2);
  document.querySelector("#climate-rate").value = rate.toFixed(2);
  const assessment = document.querySelector("#climate-assessment");
  const aboveThreshold = latestAnomaly >= 1.5;
  assessment.textContent = aboveThreshold ? "ABOVE" : "BELOW";
  assessment.style.color = aboveThreshold ? "var(--coral)" : "var(--julia-green)";
  updateClimateProjectCode(latestAnomaly);
}

const orbitPanel = document.querySelector("#project-panel-orbit");
const orbitDistanceInput = document.querySelector("#orbit-distance");
const orbitSpeedInput = document.querySelector("#orbit-speed");
const orbitGravityInput = document.querySelector("#orbit-gravity");
const orbitTrajectory = document.querySelector("#orbit-trajectory");
const orbitSatellite = document.querySelector("#orbit-satellite");
const orbitSatelliteHalo = document.querySelector("#orbit-satellite-halo");
const orbitOrigin = document.querySelector("#orbit-origin");
const orbitReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let orbitAnimationPaused = orbitReducedMotion.matches;
let orbitAnimationFrame = 0;
let orbitAnimationStart = 0;
let orbitPathLength = 0;
let currentOrbit = null;
let currentOrbitPreset = "elliptical";

function updateOrbitProjectCode(distance, speed, gravityMultiplier) {
  const code = `# Planar satellite motion around Earth (km, s)
earth_radius = 6371.0
earth_mu = 398600.0
gravity_multiplier = ${gravityMultiplier.toFixed(2)}
mu = earth_mu * gravity_multiplier
distance = ${distance.toFixed(1)}
speed = ${speed.toFixed(2)}

function acceleration(position, mu)
    radius = sqrt(sum(position .^ 2))
    (-mu / radius^3) .* position
end

function surface_intersection(start, finish, radius)
    segment = finish .- start
    a = sum(segment .^ 2)
    b = 2 * sum(start .* segment)
    c = sum(start .^ 2) - radius^2
    fraction = (-b - sqrt(max(0.0, b^2 - 4 * a * c))) / (2 * a)
    start .+ clamp(fraction, 0.0, 1.0) .* segment
end

function simulate_orbit(distance, speed, mu; steps=1600)
    energy = speed^2 / 2 - mu / distance
    circular_period = 2 * pi * sqrt(distance^3 / mu)
    a = energy < 0 ? -mu / (2 * energy) : nothing
    period = a === nothing ? nothing : 2 * pi * sqrt(a^3 / mu)
    duration = period === nothing ? 2 * circular_period : min(period, 6 * circular_period)
    dt = duration / (steps - 1)
    position = [distance, 0.0]
    velocity = [0.0, speed]
    positions = [copy(position)]
    impact = false
    acceleration_now = acceleration(position, mu)

    for step in 2:steps
        velocity_half = velocity .+ (dt / 2) .* acceleration_now
        next_position = position .+ dt .* velocity_half
        radius_next = sqrt(sum(next_position .^ 2))
        if radius_next <= earth_radius
            next_position = surface_intersection(position, next_position, earth_radius)
            push!(positions, next_position)
            impact = true
            break
        end
        acceleration_next = acceleration(next_position, mu)
        velocity = velocity_half .+ (dt / 2) .* acceleration_next
        position = next_position
        acceleration_now = acceleration_next
        push!(positions, copy(position))
    end
    return positions, impact
end

positions, impact = simulate_orbit(distance, speed, mu)
circular_speed = sqrt(mu / distance)
escape_speed = sqrt(2 * mu / distance)
orbit_type = if impact
    "surface impact"
elseif speed >= escape_speed
    "escape trajectory"
elseif abs(speed - circular_speed) / circular_speed < 0.012
    "circular orbit"
else
    "elliptical orbit"
end

println(orbit_type)`;
  document.querySelector("#orbit-project-code").innerHTML = highlightJulia(code);
}

function placeOrbitSatellite(point, scale) {
  const cx = 310 + point.x * scale;
  const cy = 200 - point.y * scale;
  orbitSatellite.setAttribute("cx", cx.toFixed(2));
  orbitSatellite.setAttribute("cy", cy.toFixed(2));
  orbitSatelliteHalo.setAttribute("cx", cx.toFixed(2));
  orbitSatelliteHalo.setAttribute("cy", cy.toFixed(2));
}

function syncOrbitAnimationButton() {
  const button = document.querySelector("#orbit-animation-toggle");
  const icon = document.querySelector("#orbit-animation-icon");
  const label = orbitAnimationPaused ? "Play orbital animation" : "Pause orbital animation";
  button.setAttribute("aria-label", label);
  button.title = label;
  icon.textContent = orbitAnimationPaused ? "▶" : "Ⅱ";
}

function animateOrbit(now) {
  if (orbitAnimationPaused || orbitPanel.hidden || !currentOrbit) {
    orbitAnimationFrame = 0;
    return;
  }
  if (!orbitAnimationStart) orbitAnimationStart = now;
  const elapsed = (now - orbitAnimationStart) % 9000;
  const point = orbitTrajectory.getPointAtLength(orbitPathLength * elapsed / 9000);
  orbitSatellite.setAttribute("cx", point.x.toFixed(2));
  orbitSatellite.setAttribute("cy", point.y.toFixed(2));
  orbitSatelliteHalo.setAttribute("cx", point.x.toFixed(2));
  orbitSatelliteHalo.setAttribute("cy", point.y.toFixed(2));
  orbitAnimationFrame = requestAnimationFrame(animateOrbit);
}

function startOrbitAnimation() {
  if (orbitAnimationPaused || orbitPanel.hidden || orbitAnimationFrame) return;
  orbitAnimationStart = 0;
  orbitAnimationFrame = requestAnimationFrame(animateOrbit);
}

function updateOrbit() {
  if (!window.OrbitModel) return;
  const distance = Number(orbitDistanceInput.value);
  const speed = Number(orbitSpeedInput.value);
  const gravityMultiplier = Number(orbitGravityInput.value);
  const mu = 398600 * gravityMultiplier;
  const result = window.OrbitModel.simulate({
    distanceKm: distance,
    speedKmS: speed,
    muKm3S2: mu
  });
  currentOrbit = result;

  document.querySelector("#orbit-distance-value").value = distance.toLocaleString("en-US");
  document.querySelector("#orbit-speed-value").value = speed.toFixed(2);
  document.querySelector("#orbit-gravity-value").value = gravityMultiplier.toFixed(2);
  document.querySelector("#orbit-circular-speed").value = result.circularSpeed.toFixed(2);
  document.querySelector("#orbit-escape-speed").value = result.escapeSpeed.toFixed(2);
  document.querySelector("#orbit-period").value = result.period && !result.impact
    ? (result.period / 3600).toFixed(2)
    : "--";

  const orbitType = document.querySelector("#orbit-type");
  orbitType.textContent = result.type;
  const orbitStatus = document.querySelector(".orbit-status");
  orbitStatus.dataset.state = result.impact ? "impact"
    : result.type === "CIRCULAR ORBIT" ? "circular"
    : result.type === "ESCAPE TRAJECTORY" ? "escape"
    : "elliptical";
  document.querySelector("#orbit-plot").setAttribute(
    "aria-label",
    `${result.type.toLowerCase()} traced by a satellite around Earth`
  );

  const maximumRadius = Math.max(
    ...result.points.map((point) => Math.hypot(point.x, point.y)),
    window.OrbitModel.EARTH_RADIUS_KM
  );
  const scale = 145 / maximumRadius;
  const mapX = (x) => 310 + x * scale;
  const mapY = (y) => 200 - y * scale;
  const path = result.points.map((point, index) =>
    `${index === 0 ? "M" : "L"}${mapX(point.x).toFixed(2)} ${mapY(point.y).toFixed(2)}`
  ).join(" ") + (result.closed ? " Z" : "");
  orbitTrajectory.setAttribute("d", path);
  orbitPathLength = orbitTrajectory.getTotalLength();
  orbitTrajectory.classList.toggle("is-circular", orbitStatus.dataset.state === "circular");
  orbitTrajectory.classList.toggle("is-escape", orbitStatus.dataset.state === "escape");
  orbitTrajectory.classList.toggle("is-impact", orbitStatus.dataset.state === "impact");

  const earthRadius = window.OrbitModel.EARTH_RADIUS_KM * scale;
  document.querySelector("#orbit-earth").setAttribute("r", earthRadius.toFixed(2));
  document.querySelector("#orbit-earth-halo").setAttribute("r", (earthRadius + 5).toFixed(2));
  const firstPoint = result.points[0];
  const startX = mapX(firstPoint.x);
  const startY = mapY(firstPoint.y);
  orbitOrigin.setAttribute("cx", startX.toFixed(2));
  orbitOrigin.setAttribute("cy", startY.toFixed(2));
  placeOrbitSatellite(firstPoint, scale);

  document.querySelectorAll("[data-orbit-preset]").forEach((button) => {
    button.classList.toggle("is-selected", button.dataset.orbitPreset === currentOrbitPreset);
  });
  updateOrbitProjectCode(distance, speed, gravityMultiplier);
  orbitAnimationStart = 0;
  startOrbitAnimation();
}

document.querySelectorAll("[data-orbit-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    const distance = Number(orbitDistanceInput.value);
    const mu = 398600 * Number(orbitGravityInput.value);
    const circularSpeed = Math.sqrt(mu / distance);
    const speed = button.dataset.orbitPreset === "circular"
      ? circularSpeed
      : button.dataset.orbitPreset === "elliptical"
        ? circularSpeed * Math.max(
          0.88,
          Math.sqrt((2 * window.OrbitModel.EARTH_RADIUS_KM) /
            (distance + window.OrbitModel.EARTH_RADIUS_KM)) * 1.03
        )
        : Math.sqrt(2 * mu / distance) * 1.12;
    orbitSpeedInput.value = speed.toFixed(2);
    currentOrbitPreset = button.dataset.orbitPreset;
    updateOrbit();
  });
});
[orbitDistanceInput, orbitSpeedInput, orbitGravityInput].forEach((input) => {
  input.addEventListener("input", () => {
    currentOrbitPreset = null;
    updateOrbit();
  });
});
document.querySelector("#orbit-animation-toggle").addEventListener("click", () => {
  orbitAnimationPaused = !orbitAnimationPaused;
  syncOrbitAnimationButton();
  if (orbitAnimationPaused) {
    cancelAnimationFrame(orbitAnimationFrame);
    orbitAnimationFrame = 0;
  } else {
    startOrbitAnimation();
  }
});
orbitReducedMotion.addEventListener("change", (event) => {
  orbitAnimationPaused = event.matches;
  syncOrbitAnimationButton();
  if (orbitAnimationPaused) {
    cancelAnimationFrame(orbitAnimationFrame);
    orbitAnimationFrame = 0;
  } else {
    startOrbitAnimation();
  }
});
syncOrbitAnimationButton();

const projectChoices = [...document.querySelectorAll(".project-choice")];
const projectPanels = [...document.querySelectorAll(".project-view")];
const projectCompletionInputs = [...document.querySelectorAll("[data-project-completion]")];
const projectSelector = document.querySelector("#project-selector");
const projectExperience = document.querySelector("#project-experience");
const projectTitle = document.querySelector("#project-title");
let selectedProject = null;

function selectProject(project) {
  projectPanels.forEach((panel) => {
    panel.hidden = panel.id !== `project-panel-${project}`;
  });
  const projectCopy = {
    projectile: {
      title: "From first prompt to a flight model.",
      intro: "Functions hold the physics. A time array samples the flight. Broadcasting evaluates each sample, a loop finds the apex, and a condition checks whether the landing point fits the field."
    },
    climate: {
      title: "Read the signal in a changing climate.",
      intro: "Summarize temperature-anomaly measurements, estimate their end-to-end change per decade, and classify the latest reading with Julia's Statistics standard library."
    },
    orbit: {
      title: "Build an orbit from first principles.",
      intro: "Change distance, velocity, or gravitational strength and watch the satellite move between circular, elliptical, impact, and escape paths. The Julia walkthrough and calculated thresholds follow the same settings."
    }
  }[project];
  selectedProject = project;
  projectSelector.hidden = true;
  projectExperience.hidden = false;
  projectTitle.textContent = projectCopy.title;
  document.querySelector("#project-intro").textContent = projectCopy.intro;
  if (project === "climate") updateClimate();
  if (project === "orbit") {
    updateOrbit();
    syncOrbitAnimationButton();
  }
  projectTitle.focus({ preventScroll: true });
}

projectChoices.forEach((choice) => {
  choice.addEventListener("click", () => selectProject(choice.dataset.project));
});

projectCompletionInputs.forEach((input) => {
  input.addEventListener("change", () => {
    const choice = document.querySelector(`#project-choice-${input.dataset.projectCompletion}`);
    choice.classList.toggle("is-complete", input.checked);
  });
});

document.querySelector("#project-choose-again").addEventListener("click", () => {
  projectPanels.forEach((panel) => {
    panel.hidden = true;
  });
  projectExperience.hidden = true;
  projectSelector.hidden = false;
  document.querySelector(`#project-choice-${selectedProject}`).focus();
});
document.querySelector("#latest-anomaly").addEventListener("input", updateClimate);
updateOrbit();

Object.values(projectFlightInputs).forEach((input) => input.addEventListener("input", updateFlight));
document.querySelectorAll(".project-gravity-presets [data-gravity]").forEach((button) => {
  button.addEventListener("click", () => {
    projectFlightInputs.gravity.value = button.dataset.gravity;
    updateFlight();
  });
});

function replayTrajectory() {
  const marker = document.querySelector("#projectile-marker");
  const button = document.querySelector("#replay-flight");
  const flight = { ...currentFlight };
  const start = performance.now();
  const duration = Math.min(3000, Math.max(1400, flight.time * 280));
  const icon = button.querySelector("span");
  const originalLabel = "Replay trajectory";
  button.setAttribute("aria-live", "polite");
  button.setAttribute("aria-label", "Playing trajectory");
  button.lastChild.textContent = " Playing trajectory";
  icon.textContent = "Ⅱ";
  marker.classList.add("is-playing");
  button.disabled = true;
  const animate = (now) => {
    const progress = Math.min(1, (now - start) / duration);
    const time = flight.time * progress;
    const x = flight.horizontal * time;
    const y = Math.max(0, flight.vertical * time - .5 * flight.gravity * time ** 2);
    const maxX = Math.max(165, flight.range * 1.12);
    const maxY = Math.max(35, flight.height * 1.2);
    const cx = 34 + x / maxX * 440;
    const cy = 250 - y / maxY * 200;
    marker.setAttribute("transform", `translate(${cx} ${cy})`);
    if (progress < 1) {
      replayFrame = requestAnimationFrame(animate);
    } else {
      marker.classList.remove("is-playing");
      marker.setAttribute("transform", `translate(${34 + flight.range / maxX * 440} 250)`);
      icon.textContent = "▶";
      button.lastChild.textContent = ` ${originalLabel}`;
      button.setAttribute("aria-label", originalLabel);
      button.disabled = false;
    }
  };
  cancelAnimationFrame(replayFrame);
  replayFrame = requestAnimationFrame(animate);
}
document.querySelector("#replay-flight").addEventListener("click", replayTrajectory);

const themeOptions = [...document.querySelectorAll("[data-theme-option]")];
const themeColorMeta = document.querySelector('meta[name="theme-color"]');
const themeStorageKey = "julia-field-lab-theme";

function applyTheme(theme, persist = false) {
  const selectedTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = selectedTheme;
  document.documentElement.style.colorScheme = selectedTheme;
  themeOptions.forEach((option) => {
    option.setAttribute("aria-pressed", String(option.dataset.themeOption === selectedTheme));
  });
  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", selectedTheme === "dark" ? "#141a36" : "#202748");
  }
  if (persist) {
    try {
      localStorage.setItem(themeStorageKey, selectedTheme);
    } catch {
      // Theme remains available for this page view if storage is disabled.
    }
  }
}

let savedTheme = "light";
try {
  savedTheme = localStorage.getItem(themeStorageKey) === "dark" ? "dark" : "light";
} catch {
  // Use the light theme when storage is unavailable.
}
applyTheme(savedTheme);
themeOptions.forEach((option) => {
  option.addEventListener("click", () => applyTheme(option.dataset.themeOption, true));
});

const thankYouDialog = document.querySelector("#thank-you-slide-dialog");
document.querySelector("#open-thank-you-slide").addEventListener("click", () => {
  thankYouDialog.showModal();
});
document.querySelector("#close-thank-you-slide").addEventListener("click", () => {
  thankYouDialog.close();
});
thankYouDialog.addEventListener("click", (event) => {
  if (event.target === thankYouDialog) thankYouDialog.close();
});

const sessionStartTime = Date.now();
const sessionProgress = document.querySelector("#session-progress");
const sessionDots = [...sessionProgress.querySelectorAll(".session-dot")];

function updateSessionProgress() {
  const duration = 25 * 60 * 1000;
  const elapsed = Math.max(0, Date.now() - sessionStartTime);
  const progress = Math.min(elapsed, duration);
  const completedIntervals = Math.floor(progress / (5 * 60 * 1000));
  const elapsedMinutes = Math.floor(progress / 60000);

  sessionDots.forEach((dot, index) => {
    dot.classList.toggle("is-lit", index < completedIntervals);
  });
  sessionProgress.setAttribute("aria-valuenow", String(elapsedMinutes));
  sessionProgress.setAttribute(
    "aria-valuetext",
    `${elapsedMinutes} ${elapsedMinutes === 1 ? "minute" : "minutes"} elapsed`
  );
}

updateSessionProgress();
window.setInterval(updateSessionProgress, 60_000);

updateFlight();
updateClimate();

document.querySelectorAll("[data-benchmark-presentation]").forEach((presentation) => {
  const tabs = [...presentation.querySelectorAll("[data-benchmark-tab]")];
  const panelElements = [...presentation.querySelectorAll("[data-benchmark-panel]")];
  const panels = tabs.map((tab) => {
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    return panel && presentation.contains(panel) ? panel : null;
  });
  const previous = presentation.querySelector("[data-benchmark-previous]");
  const next = presentation.querySelector("[data-benchmark-next]");
  const progress = presentation.querySelector("[data-benchmark-progress]");
  if (!tabs.length || panelElements.length !== tabs.length || panels.some((panel) => !panel) || !previous || !next || !progress) return;
  let activeIndex = Math.max(0, tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true"));

  function showSlide(index, focusTab = false) {
    activeIndex = index;
    tabs.forEach((tab, tabIndex) => {
      const isActive = tabIndex === activeIndex;
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
      tab.classList.toggle("is-active", isActive);
      panels[tabIndex].hidden = !isActive;
    });
    previous.disabled = activeIndex === 0;
    next.disabled = activeIndex === tabs.length - 1;
    progress.textContent = `Slide ${activeIndex + 1} of ${tabs.length}`;
    if (focusTab) tabs[activeIndex].focus();
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => showSlide(index));
    tab.addEventListener("keydown", (event) => {
      let nextIndex = index;
      if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
      else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = tabs.length - 1;
      else return;
      event.preventDefault();
      showSlide(nextIndex, true);
    });
  });

  previous.addEventListener("click", () => showSlide(activeIndex - 1));
  next.addEventListener("click", () => showSlide(activeIndex + 1));
  showSlide(activeIndex);

  const outputDetails = [...presentation.querySelectorAll("[data-benchmark-output-details]")];
  outputDetails.forEach((detail) => {
    detail.addEventListener("toggle", () => {
      if (!detail.open) return;
      outputDetails.forEach((other) => {
        if (other !== detail) other.open = false;
      });
    });
  });

  const calculator = presentation.querySelector("[data-benchmark-calculator]");
  if (!calculator) return;
  const juliaInput = calculator.querySelector("#garden-benchmark-julia-ms");
  const pythonInput = calculator.querySelector("#garden-benchmark-python-ms");
  const result = calculator.querySelector("#garden-benchmark-calculator-result");
  const chart = calculator.querySelector("#garden-benchmark-calculator-chart");
  const juliaBar = calculator.querySelector("#garden-benchmark-julia-bar");
  const pythonBar = calculator.querySelector("#garden-benchmark-python-bar");
  const juliaValue = calculator.querySelector("#garden-benchmark-julia-value");
  const pythonValue = calculator.querySelector("#garden-benchmark-python-value");

  function formatMilliseconds(value) {
    return `${value.toLocaleString(undefined, { maximumFractionDigits: 3 })} ms`;
  }

  function updateCalculator() {
    const juliaRaw = juliaInput.value.trim();
    const pythonRaw = pythonInput.value.trim();
    if (!juliaRaw || !pythonRaw) {
      chart.hidden = true;
      result.textContent = "Enter both warmed medians to compare the runs.";
      return;
    }

    const juliaMs = Number(juliaRaw);
    const pythonMs = Number(pythonRaw);
    if (!Number.isFinite(juliaMs) || !Number.isFinite(pythonMs) || juliaMs <= 0 || pythonMs <= 0) {
      chart.hidden = true;
      result.textContent = "Both timings must be positive numbers greater than zero.";
      return;
    }

    const longest = Math.max(juliaMs, pythonMs);
    juliaBar.style.width = `${(juliaMs / longest) * 100}%`;
    pythonBar.style.width = `${(pythonMs / longest) * 100}%`;
    juliaValue.textContent = formatMilliseconds(juliaMs);
    pythonValue.textContent = formatMilliseconds(pythonMs);
    chart.hidden = false;
    chart.setAttribute(
      "aria-label",
      `Runtime comparison: Julia ${formatMilliseconds(juliaMs)}, Python ${formatMilliseconds(pythonMs)}. Shorter is faster.`
    );

    if (juliaMs === pythonMs) {
      result.textContent = "The warmed median times are equal.";
      return;
    }

    const faster = juliaMs < pythonMs ? "Julia" : "Python";
    const quicker = Math.min(juliaMs, pythonMs);
    const slower = Math.max(juliaMs, pythonMs);
    const speedup = slower / quicker;
    const lessTimePercent = ((slower - quicker) / slower) * 100;
    result.textContent = `${faster} was ${speedup.toFixed(2)}× faster and took ${lessTimePercent.toFixed(1)}% less time in this comparison.`;
  }

  juliaInput.addEventListener("input", updateCalculator);
  pythonInput.addEventListener("input", updateCalculator);
  updateCalculator();
});
