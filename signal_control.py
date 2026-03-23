from traffic_detection import classify_traffic

# ─── Signal Timing Engine ──────────────────────────────────────────────────────

BASE_TIME   = 20   # Minimum green time (seconds)
MAX_TIME    = 90   # Maximum green time (seconds)
EMERG_TIME  = 999  # Emergency override (force green)


def calculate_green_time(count):
    """Calculate green signal time proportional to vehicle count."""
    return min(BASE_TIME + int(count * 0.8), MAX_TIME)


def get_priority_road(roads_data):
    """Return the road with the most vehicles (highest priority)."""
    return max(roads_data, key=roads_data.get)


def get_signal_plan(roads_data, ambulance_road=None):
    """
    Generate a full signal plan for all roads.
    If ambulance_road is set, it overrides all signals.

    Returns a dict: { road: { "vehicles", "state", "green_time", "signal", "priority" } }
    """
    total_vehicles = sum(roads_data.values()) or 1
    priority_road  = get_priority_road(roads_data)
    plan = {}

    for road, count in roads_data.items():
        state      = classify_traffic(count)
        green_time = calculate_green_time(count)
        weight     = round(count / total_vehicles, 2)

        if ambulance_road:
            # Emergency mode: only ambulance road gets green
            signal   = "GREEN"  if road == ambulance_road else "RED"
            g_time   = EMERG_TIME if road == ambulance_road else 0
            is_emerg = road == ambulance_road
        else:
            signal   = "GREEN" if road == priority_road else "RED"
            g_time   = green_time
            is_emerg = False

        plan[road] = {
            "vehicles"    : count,
            "state"       : state,
            "green_time"  : g_time,
            "signal"      : signal,
            "weight"      : weight,
            "priority"    : road == priority_road,
            "emergency"   : is_emerg,
        }

    return plan


def print_signal_plan(plan, ambulance_road=None):
    """Pretty-print the signal plan to the terminal."""
    print("\n" + "=" * 50)
    if ambulance_road:
        print(f"  🚨 EMERGENCY MODE — Ambulance on {ambulance_road}")
    else:
        print("  📊 Signal Plan")
    print("=" * 50)

    for road, info in plan.items():
        marker = "🚑" if info["emergency"] else ("🟢" if info["signal"] == "GREEN" else "🔴")
        print(f"  {marker} {road:6s} | {info['vehicles']:3d} vehicles "
              f"| {info['state']:6s} | {info['green_time']:3d}s green")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    sample = {"Road1": 75, "Road2": 18, "Road3": 40}
    plan   = get_signal_plan(sample)
    print_signal_plan(plan)

    print("--- Emergency Test ---")
    plan2  = get_signal_plan(sample, ambulance_road="Road2")
    print_signal_plan(plan2, ambulance_road="Road2")