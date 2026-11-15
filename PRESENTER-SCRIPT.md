# Julia for Plant Research: Presenter Script

## 1. A Reason to Try Julia

*[Open the plant physiologist scenario.]*  

"Imagine you're a plant physiologist specializing in crop water relations. You've just seen our Julia presentation. Its readable syntax and potential for high-performance numerical computing caught your attention, and now you want to see what Julia could do in your own research."

"You decide to start by installing Julia."

## 2. Get Julia Running

*[Show the macOS & Linux installation instructions and command, then switch to Windows and explain its separate command.]*  

"For macOS and Linux, the install command is the same for both. Here's that command. Windows works a little differently, so let's switch over and look at its command."

"The macOS and Linux command runs Julia's official `juliaup` installer. On Windows, Julia installs through the Microsoft Store with a separate `winget` command. Once installation is finished, we'll open a new terminal window and type `julia`."

*[Open a new terminal, enter `julia`, and point out the startup message and prompt.]*  

"We should see Julia's welcome message, followed by the `julia&gt;` prompt. Great, Julia is ready. Let's try a simple division: we'll enter `120 / 4` and press Enter."

*[Run the expression.]*  

"We get `30.0`. This interactive prompt is called the REPL: we enter an expression, Julia evaluates it, and the result appears right away. It's a handy place to test an idea before it becomes part of a larger program."

*[Show the workspace choices.]*  

"The REPL is handy for checking one expression at a time. For a project we want to keep building, we can choose an editor or a notebook."

"VS Code gives us a Julia file, terminal, and REPL together in one workspace. That's a familiar setup for writing and running a saved program."

"Pluto.jl takes a notebook approach. We can keep code, results, and explanations together, and its cells update as we change the code. We can also try Pluto in the browser without installing Julia first. That hosted session may take a little while to start, and it doesn't save our files to the cloud."

"For this activity, we'll work in a local file called `garden_week.jl`. That gives us a program we can build up and run ourselves."

## 3. Let's Experiment with Julia

*[Move to `garden_week.jl` and open the first Lesson.]*  

"We've seen Julia evaluate one expression. Now let's use a few Julia ideas to build a small research-style model: we'll track soil water through a changing week of rain and temperature, then compare the results for lettuce and cactus."

"We'll build the model by working through the Julia ideas that let us represent each plant, calculate daily water changes, and track soil water through the week."

### 3.1 Dispatch

*[On Lesson, walk through the two `describe` methods and the sample call.]*  

"Here, `describe` has one method for integers and another for decimal numbers. When we call it, Julia looks at the argument's type and chooses the matching method. That's multiple dispatch: one function name can have different methods for different kinds of input."

*[Switch to Code. Point out the shared `Plant` type, the `Lettuce` and `Cactus` types, and the two incomplete `dry_limit` methods.]*  

"In our program, both plants belong to the `Plant` family. The two `dry_limit` methods will give each concrete plant type its own threshold."

"Let's complete them. Which type belongs in the lettuce method, and which belongs in the cactus method?"

*[Presenter key after the attempt: `Lettuce`, then `Cactus`.]*  

"Now `dry_limit(plant)` can use the type of `plant` to select the right method and threshold."

### 3.2 JIT Compilation

*[On Lesson, compare the two calls to `daily_change` with different argument types.]*  

"Julia compiles a method when it is first needed, and it can specialize that method for the concrete types it receives. In these examples, the same `daily_change` function works with integers or floating-point numbers. We don't have to write a separate function for each one."

*[Switch to Code. Point to the `simulate` signature and its type parameter `T`.]*  

"Here, `simulate` receives rainfall, a plant represented by `T`, and temperature. The type constraint after `where` will let the method work with our plant types while still specializing for the actual type passed in."

"Which shared parent type should we use to constrain `T`?"

*[Presenter key after the attempt: `Plant`.]*  

"The constraint is `T <: Plant`. That allows either plant type, and Julia can specialize the method when we call it."

### 3.3 Math Syntax

*[On Lesson, walk through compound assignment, powers, and function calls.]*  

"Julia's math syntax stays close to familiar notation. We can update a value with `+=`, raise a number to a power with `^`, and combine calculations with ordinary function calls."

*[Switch to Code and point to `temperature = 25.0` and the unfinished evaporation assignment.]*  

"This temperature value will set the model's daily evaporation. We're filling in the expression on the right side of `evaporation =`."

"How can we write ten percent of `temperature` using Julia's compact multiplication syntax?"

*[Presenter key after the attempt: `0.1temperature`.]*  

"Julia lets us put a number directly beside a variable to mean multiplication. So `0.1temperature` is the same as `0.1 * temperature`; at 25 degrees, this gives us 2.5."

### 3.4 Broadcasting

*[On Lesson, walk through scalar addition, elementwise comparison, and `round.`.]*  

"The dot tells Julia to apply an operation element by element. We can add one scalar to every item, compare every item and get a Boolean array, or put a dot after a function name to apply it across an array."

*[Switch to Code. Point to the seven rainfall values, the single evaporation value, and the unfinished `daily_change` expression.]*  

"Rainfall is a vector with one value for each day, while evaporation is a single value. We want Julia to subtract that same daily loss from every rainfall value."

"Which operator should go between `rain` and `evaporation` to do that element by element?"

*[Presenter key after the attempt: `.-`.]*  

"The dotted subtraction gives us a vector of daily gains and losses. The dot describes how Julia applies the operation; it doesn't, by itself, mean the work runs in parallel."

### 3.5 1-Based Arrays

*[On Lesson, walk through the `end` and `eachindex` examples.]*  

"Julia gives us ways to work with array positions without hard-coding every one. `end` refers to the last valid position, and `eachindex` lets a loop visit the valid positions in an array."

*[Switch to Code. Point to the soil array and the unfinished assignment for the first day.]*  

"This array has one slot for each day. We set the first day's soil-water value, then the loop uses each day's change and the previous day's water value to fill the rest."

"What index should we put in the brackets for the first day's value?"

*[Presenter key after the attempt: `1`.]*  

"Day one is `soil[1]`; Julia's standard arrays are 1-based. From there, the loop carries the soil-water estimate forward, and the program counts how many days fall below the plant's threshold."

### 3.6 Macros

*[On Lesson, walk through `@show`, `@assert`, and `@view`.]*  

"Julia macros start with `@` and transform an expression before it runs. `@show` displays a value, `@assert` checks that a condition is true, and `@view` works with part of an array without copying it."

*[Switch to Code. Point to the rain, plant, and temperature inputs, then the unfinished simulation call.]*  

"These are the inputs for one run of our model. The final line calls `simulate` and stores its result. We can wrap that call with a macro to see how long it takes and how many allocations it makes."

"Which macro should we put before `simulate`?"

*[Presenter key after the attempt: `@time`.]*  

"That's `@time`. It reports elapsed time and allocations, then returns the simulation result. The first call may include compilation, so we'll treat this timing as a demonstration rather than a benchmark."

## 4. Run Your Program

*[Open Complete Code. Point out the source and the run command.]*  

"Those six ideas now fit together in one file. Save the source as `garden_week.jl`. In Terminal, move into the folder where you saved it, then run `julia garden_week.jl`."

"When the program runs, it applies each day's rain and evaporation, carries the soil-water estimate forward, and compares that week's values with the selected plant's threshold."

"Once your program runs, let's see what happens when we change its inputs."

## 5. Can Your Plant Make It Through a Changing Week of Weather?

*[Open the model. Point out the plant and temperature controls, rainfall for each day, the chart and readouts, and the code preview.]*  

"Now we can take the same idea out of the file and experiment with it. Let's see how the soil-water estimate responds as the week's weather changes."

"Choose lettuce or cactus, set a temperature, and adjust the rain for each day. The chart follows soil water across the week; the readouts summarize the final water, dry days, and whether the model's limit is exceeded."

"Let's experiment with the program by changing its rain, plant, and temperature inputs. As we adjust them, we'll see how the Julia model's soil-water values and dry-day count respond."

*[Begin with the default settings. Give the audience a moment to inspect the chart and readouts.]*  

"Before we change anything, what do you notice about the soil-water line? Does it fall below either plant's threshold?"

"At 25 degrees, this example uses 2.5 millimeters of evaporation per day. With the displayed rainfall, the soil-water estimate ends at 18.5 millimeters and stays above both thresholds."

*[Keep the temperature at 25 degrees and set all seven rainfall values to zero. Pause for predictions before revealing the result.]*  

"Now let's take rain out of the week. What do you think the chart will do, and will lettuce and cactus have the same number of dry days?"

"The water estimate drops from 10 to 7.5, then 5, then 2.5 millimeters, and eventually reaches zero. From there, it stays at zero."

"In this model, a dry day means the value is below the threshold, not equal to it. Lettuce has five days below its 5-millimeter limit; cactus has four below its 2-millimeter limit. The water curve is the same for both. Dispatch gives each plant a different rule for interpreting it, and both exceed the model's two-day allowance."

"Those results depend on the numbers we chose: 10 millimeters of starting water, evaporation set to ten percent of temperature, a 20-millimeter cap, and thresholds of 5 for lettuce and 2 for cactus. They're illustrative inputs for exploring the program, not measured thresholds for either crop."

## 6. Close

"We started with a single calculation in the REPL and used Julia ideas to build a model we can run, inspect, and change. The next step in real research would be to test the model's assumptions against measurements."

"Which assumption would you want to measure or refine first?"

"To keep learning Julia, the getting-started guide and Julia Manual are good places to go next."
