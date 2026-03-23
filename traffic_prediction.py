import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import time

# ─── Traffic Prediction Engine ─────────────────────────────────────────────────
# Supports:
#   - Linear Regression (fast, good for simple trends)
#   - Random Forest     (better for non-linear patterns)
#
# Input : historical vehicle counts (time-indexed)
# Output: predicted vehicle count for next N steps

ROADS = ["Road1", "Road2", "Road3"]

# In-memory history buffer (used if DB has no data yet)
_history_buffer = {
    "Road1": [],
    "Road2": [],
    "Road3": [],
}


def add_to_history(road, count):
    """Add a new count to the in-memory history buffer."""
    _history_buffer[road].append(count)
    if len(_history_buffer[road]) > 200:
        _history_buffer[road].pop(0)


def _build_training_data(history):
    """
    Convert a list of vehicle counts into (X, y) for supervised learning.
    X = [t-2, t-1], y = t  (uses last 2 steps to predict next)
    """
    if len(history) < 5:
        return None, None

    X, y = [], []
    for i in range(2, len(history)):
        X.append([i - 1, history[i - 2], history[i - 1]])
        y.append(history[i])

    return np.array(X), np.array(y)


def predict_linear(history, steps_ahead=1):
    """
    Simple linear regression prediction.
    Returns predicted vehicle count.
    """
    if len(history) < 4:
        return _fallback_prediction(history)

    X = np.array(range(len(history))).reshape(-1, 1)
    y = np.array(history)

    model = LinearRegression()
    model.fit(X, y)

    future_x = np.array([[len(history) + steps_ahead - 1]])
    pred      = model.predict(future_x)[0]

    return max(0, int(round(pred)))


def predict_random_forest(history, steps_ahead=1):
    """
    Random Forest prediction (better for rush-hour spikes).
    Returns predicted vehicle count.
    """
    X, y = _build_training_data(history)

    if X is None:
        return _fallback_prediction(history)

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    model = RandomForestRegressor(n_estimators=50, random_state=42)
    model.fit(X_scaled, y)

    n    = len(history)
    x_new = scaler.transform([[n + steps_ahead - 1, history[-2], history[-1]]])
    pred  = model.predict(x_new)[0]

    return max(0, int(round(pred)))


def _fallback_prediction(history):
    """Return average of available history when not enough data."""
    if not history:
        return 30
    return int(round(sum(history) / len(history)))


def get_predictions(roads_data, method="linear"):
    """
    Generate next-step predictions for all roads.
    roads_data: current { road: count } dict
    method    : "linear" or "forest"
    Returns   : { road: { "current", "predicted", "trend" } }
    """
    # Update in-memory history
    for road, count in roads_data.items():
        add_to_history(road, count)

    results = {}

    for road in ROADS:
        history = _history_buffer[road]
        current = roads_data.get(road, 0)

        if method == "forest" and len(history) >= 5:
            predicted = predict_random_forest(history)
        else:
            predicted = predict_linear(history)

        diff  = predicted - current
        trend = "INCREASING" if diff > 5 else ("DECREASING" if diff < -5 else "STABLE")

        results[road] = {
            "current"  : current,
            "predicted": predicted,
            "trend"    : trend,
            "diff"     : diff,
            "method"   : method,
        }

    return results


def load_history_from_db(road, limit=100):
    """Load historical data from SQLite into the buffer."""
    try:
        from traffic_database import get_traffic_history_for_ml
        rows = get_traffic_history_for_ml(road, limit)
        if rows:
            _history_buffer[road] = [v for _, v in rows]
            print(f"[ML] Loaded {len(rows)} records for {road} from DB")
    except Exception as e:
        print(f"[ML] Could not load DB history: {e}")


def init_predictions():
    """Pre-load DB history for all roads on startup."""
    for road in ROADS:
        load_history_from_db(road)


if __name__ == "__main__":
    print("=== Traffic Prediction Test ===\n")

    # Seed with some fake history
    fake_history = [20, 25, 35, 45, 60, 70, 75, 68, 55, 40, 30, 22]
    _history_buffer["Road1"] = fake_history
    _history_buffer["Road2"] = [v // 2 for v in fake_history]
    _history_buffer["Road3"] = [v - 5  for v in fake_history]

    current = {"Road1": 25, "Road2": 12, "Road3": 18}
    preds   = get_predictions(current, method="linear")

    print("Linear Regression Predictions:")
    for road, info in preds.items():
        print(f"  {road}: current={info['current']}  predicted={info['predicted']}  trend={info['trend']}")

    print()
    preds2 = get_predictions(current, method="forest")
    print("Random Forest Predictions:")
    for road, info in preds2.items():
        print(f"  {road}: current={info['current']}  predicted={info['predicted']}  trend={info['trend']}")