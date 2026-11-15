# Julia for Plant Research: Presenter Script

## Color Key

- <span style="color: #2563EB;"><strong>BLUE</strong></span> carries the story and transitions.
- <span style="color: #15803D;"><strong>GREEN</strong></span> connects Julia to the plant-science model and its results.
- <span style="color: #C2410C;"><strong>ORANGE</strong></span> cues audience questions and on-screen actions.
- <span style="color: #7E22CE;"><strong>PURPLE</strong></span> explains Julia concepts and code.

*The colors are presenter cues; one presenter can deliver all four.*

## 1. From the Slides to a Research Question

*[Transition from the Julia slides to the plant physiologist scenario.]* 

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "We've just seen our Julia slides. Julia's readable syntax and potential for high-performance numerical computing stood out. Let's move from seeing what Julia can do to trying it in a small research-style model."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "Imagine you're a plant physiologist studying crop water relations. You want to explore how a changing week of rain and temperature might affect soil water for lettuce and cactus. We'll use Julia to build a simple model we can inspect and change."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "This is a learning model, not crop advice. Its starting water, evaporation rate, and plant thresholds are illustrative assumptions, not measured data."

## 2. Install Julia and Get Started

*[Show the installation section. Select the operating-system tab that matches the audience. If Julia is already installed, continue at the REPL example.]* 

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Choose macOS &amp; Linux or Windows to see the matching installation steps. The page shows the command for that system and links to the official installation guide."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Follow the installer prompts, and review them before confirming. Once Julia is installed, open a new terminal and enter `julia`."

*[Point to the `julia&gt;` prompt, then run `120 / 4`. Give the audience a moment to try it.]* 

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The `julia&gt;` prompt is Julia's REPL: the read-eval-print loop. Enter an expression, Julia evaluates it, and the REPL displays the result. Here, `120 / 4` returns `30.0`."

*[Show the workspace choices.]* 

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "The REPL is useful for quick calculations. For a project we want to keep, we can work in an editor or notebook."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "VS Code with the Julia extension keeps a source file, terminal, and REPL together. Pluto.jl offers reactive notebook cells. For this exercise, have a local Julia file open; the hosted Pluto option is temporary and does not save files to the cloud."

## 3. Build `garden_week.jl`

*[Show the six-step Julia section. Each new step opens on its Lesson tab.]* 

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "We'll build `garden_week.jl` from six small pieces, each introducing a Julia idea we'll use in the model."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Start on Lesson. Read the explanation and examples, then select Code when you're ready to answer. Check your response; when it's correct, copy the revealed fragment into your file. You can move between lessons freely to review, but keep the fragments in their original order in the file."

### 3.1 Dispatch

*[On Lesson, point out the `describe` examples. Then select Code and invite the audience to complete both plant methods.]* 

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Which plant type belongs in the lettuce method? And which belongs in the cactus method?"

*[Presenter key after the attempt: `Lettuce`, then `Cactus`.]* 

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Julia can define several methods with the same function name. The argument's type determines which method runs. Here, `dry_limit` uses the plant type to select the matching model threshold."

### 3.2 JIT Compilation

*[On Lesson, use the `daily_change` calls to introduce specialization. Then select Code and ask for the shared parent type.]* 

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "The method accepts a plant type parameter `T`. Which shared parent type should constrain `T` so either plant can use this method?"

*[Presenter key after the attempt: `Plant`.]* 

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Julia compiles methods as they're used and can specialize them for concrete input types. Type annotations describe or constrain inputs; they aren't a command to compile the program by hand."

### 3.3 Math Syntax

*[On Lesson, review the examples of compound assignment, powers, and function calls. Then select Code.]* 

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "How could we write ten percent of the temperature as a compact Julia multiplication expression?"

*[Presenter key after the attempt: `0.1temperature`.]* 

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Julia allows a numeric literal beside a variable to mean multiplication. In this model, `0.1temperature` is equivalent to `0.1 * temperature`. At 25 degrees, the illustrative evaporation value is 2.5."

### 3.4 Broadcasting

*[On Lesson, point out scalar addition, elementwise comparison, and `round.`. Then select Code.]* 

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Rain is a vector and evaporation is one value. Which operator tells Julia to subtract that value from every rainfall entry?"

*[Presenter key after the attempt: `.-`.]* 

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The dot marks an elementwise operation. Julia applies the subtraction to each rain value and returns a vector of daily changes. Broadcasting describes how the operation applies; the dot alone does not mean the work runs in parallel."

### 3.5 1-Based Arrays

*[On Lesson, review `end` and `eachindex`. Then select Code and ask for the first day's index.]* 

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Which index should store the soil-water value for day one?"

*[Presenter key after the attempt: `1`.]* 

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Standard Julia arrays start at 1. The loop begins at day two because the first day's value has already been set; each later value builds on the previous day's soil water."

### 3.6 Macros

*[On Lesson, point out `@show`, `@assert`, and `@view`. Then select Code and ask which macro wraps the model call.]* 

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Which macro should wrap this call to report elapsed time and allocations?"

*[Presenter key after the attempt: `@time`.]* 

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Macros start with `@` and transform an expression before it runs. `@time` reports elapsed time and memory allocations, then returns the call's result. The first call may include compilation, so treat it as a demonstration, not a benchmark."

## 4. Run the Program

*[After the six lessons, select Complete Code. Point out the full source and the run instructions.]* 

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "The six pieces are now together. Save the source as `garden_week.jl`. In Terminal, move into the folder where you saved it, then run `julia garden_week.jl`."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "The complete source is visible as a reference, and Copy full program copies it if you need it. Once your file runs, open the garden model."

## 5. Explore the Changing Week

*[Open the garden model. Point to the plant and temperature controls, the seven daily rainfall controls, the chart and readouts, then the code preview beside them.]* 

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "Can your plant make it through a changing week of weather? Let's use the model to find out."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "Choose lettuce or cactus, set the air temperature, and adjust rainfall for each day. The chart shows soil water across the week; the readouts show dry days, day-seven water, and whether the result is within the model's limit."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The code preview updates with the current `rain`, `plant`, and `temperature` values. The Copy full program button copies the complete Julia program using those settings."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "For the starting settings, temperature is 25 degrees, so the model uses 2.5 millimeters of evaporation per day. Starting from 10 millimeters, the example week ends at 18.5 millimeters, with no days below either plant's illustrative threshold."

*[Ask the audience to predict the result of a dry week. Set all seven rainfall controls to zero while leaving temperature at 25 degrees.]* 

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "What do you expect to happen to the soil-water chart? And will lettuce and cactus have the same number of dry days?"

<span style="color: #15803D;"><strong>GREEN:</strong></span> "With no rain, the water values fall to 7.5, 5, and 2.5 millimeters, then reach zero. The comparison is strictly 'below' the threshold, so a value equal to 5 is not counted as dry for lettuce."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The model counts five dry days for lettuce and four for cactus. The soil-water sequence is the same for both plants; dispatch changes the threshold used to classify those values. Both counts exceed the model's two-day allowance."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "These numbers are teaching assumptions only: the model starts at 10 millimeters, caps soil water at 20, and uses simple temperature-based evaporation. Real crop-water research needs measured data and a more complete model."

## 6. Close

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "We started with the ideas from our Julia slides and used them to build a working, editable model. We can now change the inputs, inspect the code, and ask how each assumption shapes the result."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Before we finish: which part of the model would you want to improve first with real research data?"

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "For more Julia practice, continue with the Julia Manual and learning resources, or use the official downloads page to install Julia on your own machine."
