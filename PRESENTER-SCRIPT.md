# Julia for Plant Physiology: Presenter Script

## Color Key

- <span style="color: #2563EB;"><strong>BLUE</strong></span> opens the story, explains the calculation, and frames the close.
- <span style="color: #15803D;"><strong>GREEN</strong></span> leads installation, broadcasting, and interpretation.
- <span style="color: #C2410C;"><strong>ORANGE</strong></span> leads workspace choices, dispatch, and arrays.
- <span style="color: #7E22CE;"><strong>PURPLE</strong></span> leads Julia's compilation model and macros.

The color labels are the speakers' only identifiers. Bracketed text is a stage cue, not spoken dialogue. Let the audience type or paste each code fragment into their own Julia environment before moving on.

## 1. Handoff: Julia for Scientific Computing

*[Visual: finish the Julia slides, then bring up the plant physiologist scenario.]*

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "We've just been introduced to Julia for scientific computing. Let's make that concrete with a question from plant science: how might a changing week of rain and temperature affect water available to a crop?"

## 2. The Plant Physiologist

*[Pause on the crop-water-relations scenario.]*

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "For this example, we're plant physiologists specializing in crop water relations. We want to explore how water availability affects plants, so we'll build a small model that tracks soil water across one week."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "We'll compare lettuce and cactus using different dry-soil thresholds. These are teaching assumptions chosen to make the code easy to explore. They are not measured crop data, and this model is not crop-care advice."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "You decide to start by installing Julia and trying a few simple examples."

## 3. Install Julia

*[Show the installation instructions for the audience's operating systems. If Julia is already installed, continue at the REPL example.]*

<span style="color: #15803D;"><strong>GREEN:</strong></span> "For a typical installation, we'll use `juliaup`. It installs Julia and manages Julia versions, so we can add or update versions later without manually replacing the whole installation."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The installer may take a little while and may ask us to confirm settings. That pause is normal. Read the prompts before confirming, and open a new terminal after installation so the `julia` command is available."

*[While installation runs, keep the discussion moving rather than waiting silently.]*

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "The first goal is just to get a Julia prompt. We don't need to understand the whole language before we can try a calculation."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Type `julia` in the terminal. The `julia>` prompt means we're in Julia's REPL: the read-eval-print loop. We enter an expression, Julia evaluates it, and the REPL prints the result."

*[Run `120 / 4` and give the audience time to try it.]*

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Julia returns `30.0`. The slash performs ordinary division and gives us a floating-point result. We can also give that value a name: `speed = 120 / 4`. The equals sign assigns the result to `speed`; it doesn't ask Julia to solve an equation."

## 4. Choose a Workspace

*[Show the workspace options.]*

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "The REPL is excellent for quick questions. For a program we want to keep and build on, we should use a file or notebook."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "VS Code with the Julia extension keeps a Julia file, terminal, and REPL close together. Pluto.jl is a notebook where code and results are organized in reactive cells. If Julia isn't installed locally, a hosted Pluto session can be a temporary way to try Julia in a browser; don't rely on that session to save your files."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Choose whichever workspace is comfortable. We'll build the same program either way. The important part is that we can read and change the code ourselves."

## 5. Build the Julia Ideas

*[Move into the six code ideas. Ask participants to keep a file such as `garden_week.jl` open. After each explanation, pause for them to add the fragment.]*

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "We aren't learning six disconnected tricks. Each idea will do a real job in our garden model: describe the plants, define a calculation, process the week's measurements, track the changing soil water, and inspect the result."

### 5.1 Dispatch: Give Each Plant Its Own Rule

*[Add the plant types and the two `dry_limit` methods.]*

```julia
abstract type Plant end
struct Lettuce <: Plant end
struct Cactus <: Plant end

dry_limit(::Lettuce) = 5.0
dry_limit(::Cactus) = 2.0
```

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "`Plant` is an abstract parent type: it describes a family of plants, but we won't create a plain `Plant` value. `Lettuce` and `Cactus` are concrete types in that family. These `struct`s have no fields because, for this model, the plant's identity is all we need."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Now look at the two methods with the same function name. In `dry_limit(::Lettuce)`, the `::Lettuce` says this method applies to a lettuce argument. The argument is unnamed because the method doesn't need to inspect a value; its type is enough. When we call `dry_limit(plant)`, Julia selects the method that matches the plant's type. That's multiple dispatch."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "The numbers mean that our toy model labels soil water below 5 millimeters as dry for lettuce, and below 2 millimeters as dry for cactus. They are deliberately simple illustrative thresholds, not biological measurements."

### 5.2 JIT Compilation: Define a Typed Method

*[Add the function signature; its body will be built in the next pieces.]*

```julia
function simulate(rain::Vector{Float64}, plant::T, temperature::Float64) where {T <: Plant}
```

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "`simulate` is the function we'll use to run the week. The signature describes its inputs: `rain` is a vector of `Float64` values, `temperature` is a `Float64`, and `plant` has some type `T` that is a subtype of `Plant`."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The `where` clause introduces that type parameter `T`. If we pass a `Lettuce`, then `T` is `Lettuce`; if we pass a `Cactus`, then `T` is `Cactus`. Julia can specialize and compile a version of this method for the concrete types it sees when the method is called. The annotations describe the method's accepted inputs; they aren't a command that manually starts compilation."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "This is part of Julia's approach: we can write a high-level function and call it interactively, while Julia compiles specialized machine code as that function is needed. Compilation and good algorithms both matter; a type annotation by itself doesn't make arbitrary code fast."

### 5.3 Math Syntax: Estimate Evaporation

*[Add this line inside `simulate`.]*

```julia
evaporation = 0.1temperature
```

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "Julia allows a numeric literal coefficient: putting a number directly beside a variable means multiplication. So `0.1temperature` means `0.1 * temperature`. In our simplified model, that's the evaporation amount for each day."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "At 25 degrees, `0.1temperature` is 2.5. We'll treat that as 2.5 millimeters of water lost per day. The rate is a made-up teaching assumption, not a physical law about evaporation."

### 5.4 Broadcasting: Adjust Every Rain Measurement

*[Add this line after the evaporation calculation.]*

```julia
daily_change = rain .- evaporation
```

<span style="color: #15803D;"><strong>GREEN:</strong></span> "`rain` contains one rainfall measurement per day, while `evaporation` is one number. The dot in `.-` broadcasts subtraction element by element, applying the same evaporation amount to every rainfall value and producing a vector of daily changes."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "With our example week and 25 degrees, evaporation is 2.5. The rainfall values `[8, 1, 4, 0, 6, 2, 5]` become daily changes `[5.5, -1.5, 1.5, -2.5, 3.5, -0.5, 2.5]`. These are daily gains or losses; they are not yet the soil-water totals."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "The dot means elementwise here. It makes the operation concise, but it isn't by itself a promise that Julia will run the work in parallel."

### 5.5 1-Based Arrays: Carry Water Forward Through the Week

*[Add the rest of the function body and its closing `end`.]*

```julia
    soil = zeros(length(rain))

    soil[1] = clamp(10.0 + daily_change[1], 0.0, 20.0)
    for day in 2:length(rain)
        soil[day] = clamp(soil[day - 1] + daily_change[day], 0.0, 20.0)
    end

    dry_days = count(water -> water < dry_limit(plant), soil)
    within_limit = dry_days <= 2
    return (soil=soil, dry_days=dry_days, within_limit=within_limit)
end
```

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "`zeros(length(rain))` creates a zero-filled vector with one numeric slot for each day. Julia's standard arrays start at index 1, so `soil[1]` is day one. We begin with 10 millimeters, add the first day's change, and use `clamp` to keep the result between 0 and 20."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "The loop starts at day 2 because day 1 has already been calculated. The range `2:length(rain)` includes the final index. On each pass, `soil[day - 1]` reads yesterday's stored water, then we add today's change and clamp it again. That's how the individual daily changes become a running soil-water estimate."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "With the example values, the soil-water vector becomes `[15.5, 14.0, 15.5, 13.0, 16.5, 16.0, 18.5]`. The first value is 10 plus 5.5. The second is yesterday's 15.5 minus 1.5. The loop repeats that same state update through day seven."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Next, `count` checks every value in `soil`. The expression `water -> water < dry_limit(plant)` is a small anonymous function: for each value named `water`, it asks whether the value is below the threshold selected for this plant. `dry_days` counts how many days pass that test."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "`within_limit` is true when there are at most two dry days. The named tuple at the end returns all three results together: the daily soil-water vector, the number of dry days, and the model's yes-or-no status. In Julia, `return` makes that result explicit."

### 5.6 Macros: Time the Call

*[Add the inputs and final call after the function definition.]*

```julia
rain = [8.0, 1.0, 4.0, 0.0, 6.0, 2.0, 5.0]
plant = Lettuce()
temperature = 25.0

result = @time simulate(rain, plant, temperature)
```

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The square brackets create a vector of seven rainfall measurements. The decimal points make these `Float64` values, matching the function signature. `Lettuce()` constructs a value of the `Lettuce` type; that concrete type is what lets dispatch choose the lettuce threshold."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "A macro receives an expression and transforms it before that expression runs. The built-in `@time` macro wraps our function call, reports elapsed time and memory allocations, and returns the call's value. That value is assigned to `result`, so we can inspect the named tuple afterward."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The first call can include the time needed to compile a specialized method. `@time` is useful for seeing that timing and allocation information, but a single first-call measurement is not a reliable benchmark."

## 6. Let's Put It All Together

*[Run the completed program, then bring up the changing-week garden model. Invite predictions before changing the rainfall or plant.]*

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "Can your plant make it through a changing week of weather? We now have a small program that lets us ask that question. It takes daily rain, a plant type, and one air temperature, then returns the soil-water estimate and how many days fall below that plant's threshold."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "For the starting example, evaporation is 2.5 millimeters per day. The model starts with 10 millimeters of water, adds each day's rain minus evaporation, and caps the result between 0 and 20. The example ends at 18.5 millimeters. None of its seven values is below either selected threshold, so it counts zero dry days."

*[Set each day's rainfall to zero while keeping the temperature at 25 degrees. Ask the audience to predict the soil-water series and whether the model limit is met.]*

<span style="color: #15803D;"><strong>GREEN:</strong></span> "With no rain, the sequence is 7.5, 5, 2.5, then zero for the remaining days. The comparison is strictly less than the plant threshold, so a value exactly equal to 5 is not counted as below 5."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "That gives lettuce five days below its illustrative 5-millimeter threshold, and cactus four days below its illustrative 2-millimeter threshold. Both exceed the model's allowance of two dry days. The different counts come from multiple dispatch selecting a different threshold for each plant."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "This is a useful code experiment, not a validated crop-water model. It assumes a fixed starting amount, a simple temperature-based evaporation rate, a 20-millimeter capacity, and one threshold per plant type. Real crop water relations depend on many more measurements and conditions."

## 7. Recall and Conclusion

*[Ask each question, pause for an audience answer, then deliver the short recap.]*

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "What does Julia mean when it sees `0.1temperature`?"  
*[Recall: multiplication, or `0.1 * temperature`.]*

<span style="color: #15803D;"><strong>GREEN:</strong></span> "What does the dot in `rain .- evaporation` tell Julia?"  
*[Recall: broadcast subtraction element by element across the rainfall vector.]*

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "What index stores the first day, and how does Julia choose the correct dry-soil limit?"  
*[Recall: arrays start at 1; multiple dispatch selects the method from the plant's type.]*

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "When does Julia specialize and compile this method, and what does `@time` add?"  
*[Recall: Julia can compile a specialization when the method is called with concrete types; `@time` reports elapsed time and allocations, then returns the result.]*

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "We started with a plant-science question and used Julia to turn measurements into a model we can inspect."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "We can now change the inputs and see exactly how the assumptions affect the result."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "The most important habit is to ask what each line means and whether the model represents the science we care about."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "For the next step, consult the Julia Manual for language details, use the Julia learning resources for guided practice, and use the official downloads page to install or update Julia. Thank you."
