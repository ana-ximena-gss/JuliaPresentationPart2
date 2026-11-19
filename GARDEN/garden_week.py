"""Dependency-free Python counterpart to garden_week.jl's soil-water model."""

import gc
import os
import platform
import statistics
import sys
import time


class Plant:
    __slots__ = ()


class Lettuce(Plant):
    __slots__ = ()


class Cactus(Plant):
    __slots__ = ()


def dry_limit(plant: Plant) -> float:
    # Julia selects a dry_limit method by plant type; this Python counterpart
    # expresses the same choice with explicit isinstance branches.
    if isinstance(plant, Lettuce):
        return 5.0
    if isinstance(plant, Cactus):
        return 2.0
    raise TypeError("Unknown plant")


def simulate(rain: list[float], plant: Plant, temperature: float):
    evaporation = 0.1 * temperature

    # Julia writes `rain .- evaporation`; built-in Python lists need this
    # comprehension to apply the same scalar subtraction to every rainfall value.
    daily_change = [value - evaporation for value in rain]

    # Julia's first array index is 1; Python's is 0, so day zero seeds the recurrence.
    soil = [0.0] * len(rain)
    initial_water = 10.0 + daily_change[0]
    soil[0] = min(20.0, max(0.0, initial_water))
    for day in range(1, len(rain)):
        water = soil[day - 1] + daily_change[day]
        if water < 0.0:
            water = 0.0
        elif water > 20.0:
            water = 20.0
        soil[day] = water

    limit = dry_limit(plant)
    # This counts the same threshold matches as Julia's count(predicate, soil).
    dry_days = sum(water < limit for water in soil)
    return soil, dry_days, dry_days <= 2


def timed_simulation(rain: list[float], plant: Plant, temperature: float):
    started = time.perf_counter_ns()
    result = simulate(rain, plant, temperature)
    elapsed = (time.perf_counter_ns() - started) / 1_000_000_000
    return elapsed, result


def main():
    days = int(os.environ.get("GARDEN_DAYS", "1000000"))
    repeats = int(os.environ.get("GARDEN_REPEATS", "5"))
    if days < 1:
        raise ValueError("GARDEN_DAYS must be positive")
    if repeats < 1 or repeats % 2 == 0:
        raise ValueError("GARDEN_REPEATS must be a positive odd number")

    # Match the deterministic inputs generated in garden_week.jl.
    rain = [((day * 37) % 500) / 100.0 for day in range(1, days + 1)]
    plant = Lettuce()
    temperature = 25.0
    jit = getattr(sys, "_jit", None)
    if jit is None or not hasattr(jit, "is_available") or not jit.is_available():
        native_jit_status = "unavailable"
    else:
        native_jit_status = "enabled" if jit.is_enabled() else "available, disabled"

    # In the measured CPython build the optional native JIT is unavailable.
    time.perf_counter_ns()
    gc.collect()
    started = time.perf_counter_ns()
    cold_result = simulate(rain, plant, temperature)
    cold_seconds = (time.perf_counter_ns() - started) / 1_000_000_000

    # Warm the interpreter path, then measure repeated runs after collecting garbage.
    timed_simulation(rain, plant, temperature)
    for _ in range(2):
        gc.collect()
        timed_simulation(rain, plant, temperature)

    samples = []
    result = cold_result
    for _ in range(repeats):
        gc.collect()
        elapsed, result = timed_simulation(rain, plant, temperature)
        samples.append(elapsed)

    middle = (days - 1) // 2
    print(
        f"Python {platform.python_implementation()} {platform.python_version()} "
        f"| days={days} | first_model_call_ms={cold_seconds * 1000:.3f} "
        f"| warmed_median_ms={statistics.median(samples) * 1000:.3f} "
        f"| repeats={repeats} | native_jit={native_jit_status}"
    )
    print(
        f"CHECK dry_days={result[1]} first={result[0][0]:.6f} "
        f"middle={result[0][middle]:.6f} last={result[0][-1]:.6f}"
    )


if __name__ == "__main__":
    main()
