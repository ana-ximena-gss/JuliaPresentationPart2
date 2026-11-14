# Julia for Plant Physiology: Presenter Script

## Color Key

- <span style="color: #2563EB;"><strong>BLUE</strong></span> opens the story, explains the calculation, and frames the close.
- <span style="color: #15803D;"><strong>GREEN</strong></span> leads installation, broadcasting, and interpretation.
- <span style="color: #C2410C;"><strong>ORANGE</strong></span> leads workspace choices, dispatch, and arrays.
- <span style="color: #7E22CE;"><strong>PURPLE</strong></span> leads Julia's compilation model and macros.

## 1. Introduction: Putting Julia into Practice

*[Visual: Introduce the plant physiologist scenario.]*

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "Imagine you're a plant physiologist who recently attended our presentation about Julia for scientific computing. You've learned a little about what Julia can do, and now you want to see how you could use it in your own field."

## 2. The Plant Physiologist

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "Your work focuses on crop water relations. You're interested in how weather conditions, such as rainfall and temperature, affect the water available to plants. You decide this would be a great opportunity to try Julia with a practical example."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "For this project, you'll create a simple model that tracks soil water over the course of one week. You'll compare lettuce and cactus, looking at how each responds to changing soil-water availability."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> You decide to start by figuring out how to install Julia so you can begin experimenting with it.

## 3. Install Julia

*[Show the installation instructions for the audience's operating systems. If Julia is already installed, continue at the REPL example.]*

<span style="color: #15803D;"><strong>GREEN:</strong></span> "For a typical installation, we'll use `juliaup`. It installs Julia and manages Julia versions, so we can add or update versions later without manually replacing the whole installation."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The installer may take a little while and may ask us to confirm settings. Read the prompts before confirming, and open a new terminal after installation so the `julia` command is available."

*[While installation runs, keep the discussion moving rather than waiting silently.]*

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "Let's start by doing a simple calculation in Julia."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Type `julia` in the terminal. The `julia>` prompt means we're in Julia's REPL: the read-eval-print loop. We enter an expression, Julia evaluates it, and the REPL prints the result."

*[Run `120 / 4` and give the audience time to try it.]*

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Julia returns `30.0`. The slash performs ordinary division and gives us a floating-point result. We can also give that value a name: `speed = 120 / 4`. The equals sign assigns the result to `speed`; it doesn't ask Julia to solve an equation."

## 4. Choose a Workspace

*[Show the workspace options.]*

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "The REPL is excellent for quick questions. For a program we want to keep and build on, we should use a file or notebook."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "VS Code with the Julia extension keeps a Julia file, terminal, and REPL close together. Pluto.jl is a notebook where code and results are organized in reactive cells. If Julia isn't installed locally, a hosted Pluto session can be a temporary way to try Julia in a browser; don't rely on that session to save your files."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Choose whichever workspace is comfortable. We'll use VS Code with the Julia extension."

## 5. Build the Julia Ideas

*[Move into the six code ideas. Ask participants to keep a file such as `garden_week.jl` open. After each explanation, pause for them to add the fragment.]*

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "Now we're going to learn six key parts of Julia that will help us build our plant-water model. We'll take each part step by step, starting with the basics and gradually putting everything together. By the end, we'll have a program that can simulate how soil water changes throughout the week and compare how different plants respond."

### 5.1 Dispatch: Give Each Plant Its Own Rule

*[Ask the question before showing the completed code. Leave the type blank, invite a few answers, and only then reveal the fragment.]*

**Question to ask:** "Complete the method signature that sets the lettuce threshold."

```julia
dry_limit(::____) = 5.0
```

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "We already have a type for each plant. This method should describe the lettuce rule specifically. Which type belongs in the argument position so Julia can recognize that?"

*[Pause for answers. If needed, ask the audience to look at the plant type names and notice which one is the lettuce type. After someone answers, show the full fragment.]*  

```julia
abstract type Plant end
struct Lettuce <: Plant end
struct Cactus <: Plant end

# Illustrative thresholds only; not measured crop data.
# DISPATCH: Plant type selects the matching dry-limit method.
dry_limit(::Lettuce) = 5.0
dry_limit(::Cactus) = 2.0
```

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Correct: `Lettuce`. `Plant` is an abstract parent type that describes a family, while `Lettuce` and `Cactus` are concrete types in that family. These `struct`s have no fields because, in this model, the plant's identity is all we need."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Both definitions have the same function name, `dry_limit`, but different argument types. The `::Lettuce` in the method signature means this method applies to a lettuce value. The argument is unnamed because the method only needs its type. When we later call `dry_limit(plant)`, Julia selects a method from the plant's type. That's multiple dispatch."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "The values mean that this teaching model labels soil water below 5 millimeters as dry for lettuce, and below 2 millimeters as dry for cactus. Those thresholds are illustrative, not biological measurements. We now have plant-specific rules; next we'll define the common calculation that uses them."

### 5.2 JIT Compilation: Define a Typed Method

*[Ask the question before showing the completed signature. Let the audience reason from the plant types they just defined.]*  

**Question to ask:** "Which shared type should `T` be constrained to?"

```julia
function simulate(rain::Vector{Float64}, plant::T, temperature::Float64) where {T <: ____}
```

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "We want `simulate` to accept either plant type, but keep the plant argument within the family we just defined. What type name is shared by lettuce and cactus?"

*[Pause for answers. After the audience proposes the parent type, reveal the completed signature.]*  

```julia
# JIT COMPILE: Julia specializes and compiles methods when they are first needed.
function simulate(rain::Vector{Float64}, plant::T, temperature::Float64) where {T <: Plant}
```

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The shared type is `Plant`. `simulate` is the function that will run the week. Its signature describes three inputs: `rain` is a vector of `Float64` values, `plant` has a type `T` in the `Plant` family, and `temperature` is a `Float64`."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The `where` clause introduces the type parameter `T`. If we pass a `Lettuce`, then `T` is `Lettuce`; if we pass a `Cactus`, then `T` is `Cactus`. Julia can specialize and compile this method for the concrete types it sees when the function is called. The annotations describe the method's inputs; they are not a manual command to start compilation."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "This is part of Julia's approach: we can write a high-level function and call it interactively, while Julia compiles specialized machine code as needed. Compilation and good algorithms both matter; a type annotation by itself doesn't make arbitrary code fast. We have the function's outline, so now let's fill in its first calculation."

### 5.3 Math Syntax: Estimate Evaporation

*[Ask the question and show the unfinished assignment. Let participants work out the decimal and Julia's multiplication syntax before revealing the expression.]*  

**Question to ask:** "Write a compact expression for 10% of temperature."

```julia
evaporation = ____
```

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "What decimal represents ten percent? Once we have that number, how might Julia write multiplication compactly when a number is placed beside a variable?"

*[Pause for answers, then reveal the completed line.]*  

```julia
# MATH SYNTAX: A number beside a variable means multiplication.
evaporation = 0.1temperature
```

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "The answer is `0.1temperature`. Julia allows a numeric literal coefficient, so placing a number directly beside a variable means multiplication: this is equivalent to `0.1 * temperature`. In our simplified model, that gives the evaporation amount for one day."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "At 25 degrees, the expression evaluates to 2.5, which we're treating as 2.5 millimeters lost per day. That rate is a teaching assumption, not a physical law about evaporation. Next we need to subtract that one daily loss from every rainfall measurement."

### 5.4 Broadcasting: Adjust Every Rain Measurement

*[Ask the question and leave the operator missing. Give the audience time to reason about one scalar being applied to a vector.]*  

**Question to ask:** "Add the broadcast marker to subtract evaporation from every rain value."

```julia
daily_change = rain ____ evaporation
```

<span style="color: #15803D;"><strong>GREEN:</strong></span> "`rain` is a collection of seven daily measurements, while `evaporation` is one number. We want the same subtraction applied separately to every value. What mark in Julia's syntax tells us to do an element-by-element operation?"

*[Pause for answers, then reveal the completed line.]*  

```julia
# BROADCASTING: Dotted subtraction applies to every day's rainfall.
daily_change = rain .- evaporation
```

<span style="color: #15803D;"><strong>GREEN:</strong></span> "The marker is the dot: `.-` broadcasts subtraction element by element. Julia applies the same evaporation amount to every rainfall value and produces a vector of daily changes."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "With our example week and 25 degrees, evaporation is 2.5. The rainfall values `[8, 1, 4, 0, 6, 2, 5]` become daily changes `[5.5, -1.5, 1.5, -2.5, 3.5, -0.5, 2.5]`. These are daily gains or losses; they are not yet the soil-water totals."

<span style="color: #15803D;"><strong>GREEN:</strong></span> "The dot means elementwise here; it does not by itself promise parallel execution. We have a daily change for each day. Now we need to accumulate those changes into a soil-water value for each day."

### 5.5 1-Based Arrays: Carry Water Forward Through the Week

*[Ask the question with only the first array index missing. Let participants answer before showing the complete loop and summary code.]*  

**Question to ask:** "Which index stores the first day's soil-water value?"

```julia
soil[____] = clamp(10.0 + daily_change[1], 0.0, 20.0)
```

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "Think about how Julia numbers positions in a standard vector. What number is the first position, and therefore the index for day one?"

*[Pause for answers, then reveal the full fragment.]*  

```julia
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
```

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "The answer is `1`. Julia's standard arrays start at index 1, so `soil[1]` stores day one. `zeros(length(rain))` creates a zero-filled vector with one numeric slot per day. We begin with 10 millimeters, add the first day's change, and use `clamp` to keep the result between 0 and 20."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "The loop starts at day 2 because day 1 has already been calculated. The range `2:length(rain)` includes the final index. On each pass, `soil[day - 1]` reads yesterday's stored water, then we add today's change and clamp it again. That's how the individual daily changes become a running soil-water estimate."

<span style="color: #2563EB;"><strong>BLUE:</strong></span> "With the example values, the soil-water vector becomes `[15.5, 14.0, 15.5, 13.0, 16.5, 16.0, 18.5]`. The first value is 10 plus 5.5. The second is yesterday's 15.5 minus 1.5. The loop repeats that same state update through day seven."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "After the loop, `count` checks every value in `soil`. The expression `water -> water < dry_limit(plant)` is a small anonymous function: for each value named `water`, it asks whether that value is below the threshold selected for this plant. `dry_days` counts how many days pass the test."

<span style="color: #C2410C;"><strong>ORANGE:</strong></span> "`within_limit` is true when there are at most two dry days. The named tuple at the end returns all three results together: the daily soil-water vector, the number of dry days, and the model's yes-or-no status. In Julia, `return` makes that result explicit."

### 5.6 Macros: Time the Call

*[Ask the question before showing the completed call. Invite the audience to recall how Julia marks a macro and what measurement we want.]*  

**Question to ask:** "Add Julia's built-in macro for timing and allocation reporting."

```julia
result = ____ simulate(rain, plant, temperature)
```

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "We want to wrap the function call so Julia reports time and memory allocations while still giving us the simulation result. What built-in macro can do that?"

*[Pause for answers, then reveal the complete final fragment.]*  

```julia
rain = [8.0, 1.0, 4.0, 0.0, 6.0, 2.0, 5.0]
plant = Lettuce()
temperature = 25.0

# MACROS: @time transforms the call to report elapsed time and allocations.
# The first call may include compilation.
result = @time simulate(rain, plant, temperature)
```

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The answer is `@time`. The `@` marks this as a macro call. The square brackets create a vector of seven rainfall measurements; the decimal points make these `Float64` values, matching the function signature. `Lettuce()` constructs a value of the `Lettuce` type, so dispatch can choose the lettuce threshold."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "A macro receives an expression and transforms it before that expression runs. The built-in `@time` macro wraps our function call, reports elapsed time and memory allocations, and returns the call's value. That value is assigned to `result`, so we can inspect the named tuple afterward."

<span style="color: #7E22CE;"><strong>PURPLE:</strong></span> "The first call can include the time needed to compile a specialized method. `@time` is useful for seeing timing and allocation information, but a single first-call measurement is not a reliable benchmark. We now have all the pieces needed to run the full week."

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
