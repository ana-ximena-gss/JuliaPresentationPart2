using Printf

abstract type Plant end
struct Lettuce <: Plant end
struct Cactus <: Plant end

# Julia picks a threshold by dispatching on the plant's concrete type.
dry_limit(::Lettuce) = 5.0
dry_limit(::Cactus) = 2.0

function simulate(rain::Vector{Float64}, plant::T, temperature::Float64) where {T <: Plant}
    evaporation = 0.1temperature

    # Julia's dotted subtraction broadcasts across the array and creates a result vector.
    daily_change = rain .- evaporation

    soil = Vector{Float64}(undef, length(rain))
    soil[1] = clamp(10.0 + daily_change[1], 0.0, 20.0)
    for day in 2:length(rain)
        soil[day] = clamp(soil[day - 1] + daily_change[day], 0.0, 20.0)
    end

    limit = dry_limit(plant)
    dry_days = count(water -> water < limit, soil)
    return (soil=soil, dry_days=dry_days, within_limit=dry_days <= 2)
end

function timed_simulation(rain, plant, temperature)
    started = time_ns()
    result = simulate(rain, plant, temperature)
    elapsed = (time_ns() - started) / 1.0e9
    return elapsed, result
end

days = parse(Int, get(ENV, "GARDEN_DAYS", "1000000"))
repeats = parse(Int, get(ENV, "GARDEN_REPEATS", "5"))
@assert days > 0 "GARDEN_DAYS must be positive"
@assert repeats > 0 && isodd(repeats) "GARDEN_REPEATS must be a positive odd number"

# Generate the same deterministic 0.00-4.99 mm pattern used by the Python version.
rain = [Float64(mod(day * 37, 500)) / 100.0 for day in 1:days]
plant = Lettuce()
temperature = 25.0

# This first call includes Julia's just-in-time compilation of simulate.
time_ns()
GC.gc()
started = time_ns()
cold_result = simulate(rain, plant, temperature)
cold_seconds = (time_ns() - started) / 1.0e9

# Warm the timing wrapper and model before collecting steady-state samples.
timed_simulation(rain, plant, temperature)
for _ in 1:2
    GC.gc()
    timed_simulation(rain, plant, temperature)
end

samples = Vector{Float64}(undef, repeats)
for run in 1:repeats
    GC.gc()
    elapsed, _ = timed_simulation(rain, plant, temperature)
    samples[run] = elapsed
end
sort!(samples)
median_seconds = samples[(repeats + 1) ÷ 2]

middle = (days + 1) ÷ 2
@printf("Julia %s | days=%d | first_model_call_ms=%.3f | warmed_median_ms=%.3f | repeats=%d\n",
        VERSION, days, cold_seconds * 1000, median_seconds * 1000, repeats)
@printf("CHECK dry_days=%d first=%.6f middle=%.6f last=%.6f\n",
        cold_result.dry_days, cold_result.soil[1], cold_result.soil[middle], cold_result.soil[end])
