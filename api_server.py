from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time
import random
import os

from signal_control import get_signal_plan
from ambulance_detection import (
    trigger_emergency,
    clear_emergency,
    get_emergency_state,
    simulate_random_emergency,
)

from traffic_database import (
    init_db,
    log_full_cycle,
    get_recent_traffic,
    get_recent_events,
    log_event
)

from traffic_prediction import (
    get_predictions,
    init_predictions
)


# ─── App Setup ────────────────────────────────────────────────

app = Flask(__name__)
CORS(app)


ROADS = ["Road1", "Road2", "Road3"]


# ─── Shared State ─────────────────────────────────────────────

state = {
    "roads_data": {
        "Road1": 45,
        "Road2": 20,
        "Road3": 60
    },
    "signal_plan": {},
    "predictions": {},
    "last_updated": None,
}


# ─── Traffic Simulation ───────────────────────────────────────

def simulate_vehicle_count(current):

    delta = random.randint(-8, 8)

    hour = time.localtime().tm_hour

    if 7 <= hour <= 9 or 17 <= hour <= 19:
        delta += random.randint(0, 6)

    elif 22 <= hour or hour <= 5:
        delta -= random.randint(0, 5)

    return max(5, min(100, current + delta))


def classify_traffic(count):

    if count > 50:
        return "HIGH"

    elif count > 20:
        return "MEDIUM"

    return "LOW"



# ─── Background Simulation Loop ───────────────────────────────

def traffic_loop():

    print("[Loop] Traffic simulation started.")

    while True:

        try:

            for road in ROADS:

                state["roads_data"][road] = simulate_vehicle_count(
                    state["roads_data"][road]
                )


            emergency = get_emergency_state()

            ambulance_road = (
                emergency["road"]
                if emergency["active"]
                else None
            )


            state["signal_plan"] = get_signal_plan(
                state["roads_data"],
                ambulance_road=ambulance_road
            )


            state["predictions"] = get_predictions(
                state["roads_data"]
            )


            state["last_updated"] = time.strftime(
                "%Y-%m-%d %H:%M:%S"
            )


            log_full_cycle(
                state["roads_data"],
                state["signal_plan"]
            )


            simulate_random_emergency(
                probability=0.05
            )


        except Exception as e:

            print(
                f"[Loop ERROR] {e}"
            )


        time.sleep(4)

<<<<<<< HEAD
# ─── API Endpoints ────────────────────────────────────────────────────────────

# Home route
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "🚦 Smart Traffic Management System API is running",
        "status": "success",
        "mode": "simulation",
        "available_endpoints": [
=======


# ─── API Endpoints ────────────────────────────────────────────


@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "message":
        "🚦 Smart Traffic Management System API is running",

        "status":
        "success",

        "mode":
        "simulation",

        "endpoints": [

>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8
            "/api/traffic",
            "/api/signals",
            "/api/predictions",
            "/api/emergency/status",
            "/api/history",
            "/api/events",
            "/api/status"
<<<<<<< HEAD
        ]
    })


# Traffic data endpoint
=======

        ]

    })



>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8
@app.route("/api/traffic", methods=["GET"])
def api_traffic():

    result = {}
<<<<<<< HEAD
=======

    for road, count in state["roads_data"].items():

        result[road] = {

            "vehicles": count,

            "state": classify_traffic(count)

        }


    return jsonify({

        "data": result,

        "last_updated":
        state["last_updated"]

    })


>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8

    for road, count in state["roads_data"].items():
        result[road] = {
            "vehicles": count,
            "state": classify_traffic(count)
        }

    return jsonify({
        "data": result,
        "last_updated": state["last_updated"]
    })


# Traffic signal timing endpoint
@app.route("/api/signals", methods=["GET"])
def api_signals():

    return jsonify({
<<<<<<< HEAD
        "signals": state["signal_plan"],
        "emergency": get_emergency_state(),
        "last_updated": state["last_updated"]
    })


# Traffic prediction endpoint
@app.route("/api/predictions", methods=["GET"])
def api_predictions():
    return jsonify({
        "predictions": state["predictions"],
        "last_updated": state["last_updated"]
    })
=======

        "signals":
        state["signal_plan"],

        "emergency":
        get_emergency_state(),

        "last_updated":
        state["last_updated"]

    })



@app.route("/api/predictions", methods=["GET"])
def api_predictions():

    return jsonify({

        "predictions":
        state["predictions"],

        "last_updated":
        state["last_updated"]

    })


>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8


# Trigger ambulance emergency
@app.route("/api/emergency/trigger", methods=["POST"])
def api_trigger_emergency():
<<<<<<< HEAD
=======

    data = request.get_json()

    road = data.get("road") if data else None


    if not road:

        return jsonify({

            "error":
            "road is required"

        }), 400


    ok, msg = trigger_emergency(road)


    if ok:

        log_event(
            "ambulance",
            road,
            "Emergency trigger via dashboard"
        )


    return jsonify({

        "success":
        ok,

        "message":
        msg

    })


>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8

    data = request.get_json()

    road = data.get("road") if data else None

    if not road:
        return jsonify({
            "error": "road is required"
        }), 400

    ok, msg = trigger_emergency(road)

    if ok:
        log_event(
            "ambulance",
            road,
            "Emergency trigger via dashboard"
        )

    return jsonify({
        "success": ok,
        "message": msg
    })


# Clear emergency
@app.route("/api/emergency/clear", methods=["POST"])
def api_clear_emergency():
<<<<<<< HEAD
=======

    ok, msg = clear_emergency()


    return jsonify({

        "success":
        ok,

        "message":
        msg

    })


>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8

    ok, msg = clear_emergency()

    return jsonify({
        "success": ok,
        "message": msg
    })


# Emergency status
@app.route("/api/emergency/status", methods=["GET"])
def api_emergency_status():
<<<<<<< HEAD
=======

    return jsonify(
        get_emergency_state()
    )


>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8

    return jsonify(
        get_emergency_state()
    )


# Traffic history
@app.route("/api/history", methods=["GET"])
def api_history():
<<<<<<< HEAD
=======

    limit = request.args.get(
        "limit",
        50,
        type=int
    )


    return jsonify(
        get_recent_traffic(limit)
    )


>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8

    limit = request.args.get(
        "limit",
        50,
        type=int
    )

    return jsonify(
        get_recent_traffic(limit)
    )


# Event history
@app.route("/api/events", methods=["GET"])
def api_events():
<<<<<<< HEAD
=======

    return jsonify(
        get_recent_events(20)
    )


>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8

    return jsonify(
        get_recent_events(20)
    )


# Server health check
@app.route("/api/status", methods=["GET"])
def api_status():

    return jsonify({
<<<<<<< HEAD
        "status": "running",
        "mode": "simulation",
        "last_updated": state["last_updated"]
    })
# ─── Startup ──────────────────────────────────────────────────────────────────

if __name__ == "__main__":

=======

        "status":
        "running",

        "mode":
        "simulation",

        "last_updated":
        state["last_updated"]

    })



# ─── Startup ──────────────────────────────────────────────────


if __name__ == "__main__":


>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8
    print("=" * 55)

    print(
        " 🚦 Smart Traffic Management System — API Server"
    )

    print(
        " Mode: Full Simulation"
    )

    print("=" * 55)

<<<<<<< HEAD
    # Initialize database
    init_db()

    # Initialize prediction system
    init_predictions()

    # Start traffic simulation background thread
    traffic_thread = threading.Thread(
        target=traffic_loop,
        daemon=True
    )

    traffic_thread.start()

    PORT = int(os.environ.get("PORT", 5000))

    print("\n" + "=" * 55)
    print(f"  API running on port: {PORT}")
    print("  Endpoint: /api/traffic")
    print("  Endpoint: /api/signals")
    print("  Endpoint: /api/predictions")
    print("=" * 55)

    app.run(
        host="0.0.0.0",
        port=PORT,
        debug=False
    )
=======


    init_db()


    init_predictions()



    traffic_thread = threading.Thread(

        target=traffic_loop,

        daemon=True

    )


    traffic_thread.start()



    PORT = int(
        os.environ.get(
            "PORT",
            5000
        )
    )



    print(
        f"API running on port: {PORT}"
    )



    app.run(

        host="0.0.0.0",

        port=PORT,

        debug=False

    )
>>>>>>> 8edd05266777e01dc90c1800c48060b8532e67d8
