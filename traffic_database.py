import sqlite3
import time
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "traffic.db")


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row   # rows behave like dicts
    return conn


def init_db():
    """Create all tables if they don't exist."""
    conn = get_connection()
    c    = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS traffic_logs (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            road      TEXT    NOT NULL,
            vehicles  INTEGER NOT NULL,
            state     TEXT    NOT NULL,
            timestamp TEXT    NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS signal_logs (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            road        TEXT    NOT NULL,
            green_time  INTEGER NOT NULL,
            signal      TEXT    NOT NULL,
            timestamp   TEXT    NOT NULL
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS events (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            type      TEXT NOT NULL,
            road      TEXT NOT NULL,
            detail    TEXT,
            timestamp TEXT NOT NULL
        )
    """)

    conn.commit()
    conn.close()
    print(f"[DB] Initialized: {DB_PATH}")


def log_traffic(road, vehicles, state):
    """Insert a traffic reading into traffic_logs."""
    conn = get_connection()
    conn.execute(
        "INSERT INTO traffic_logs (road, vehicles, state, timestamp) VALUES (?, ?, ?, ?)",
        (road, vehicles, state, time.strftime("%Y-%m-%d %H:%M:%S"))
    )
    conn.commit()
    conn.close()


def log_signal(road, green_time, signal):
    """Insert a signal decision into signal_logs."""
    conn = get_connection()
    conn.execute(
        "INSERT INTO signal_logs (road, green_time, signal, timestamp) VALUES (?, ?, ?, ?)",
        (road, green_time, signal, time.strftime("%Y-%m-%d %H:%M:%S"))
    )
    conn.commit()
    conn.close()


def log_event(event_type, road, detail=""):
    """Log an event (accident, construction, ambulance, etc.)."""
    conn = get_connection()
    conn.execute(
        "INSERT INTO events (type, road, detail, timestamp) VALUES (?, ?, ?, ?)",
        (event_type, road, detail, time.strftime("%Y-%m-%d %H:%M:%S"))
    )
    conn.commit()
    conn.close()


def get_recent_traffic(limit=50):
    """Fetch the most recent traffic log entries."""
    conn  = get_connection()
    rows  = conn.execute(
        "SELECT * FROM traffic_logs ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_traffic_history_for_ml(road, limit=100):
    """
    Fetch timestamped vehicle counts for a road — used by ML prediction.
    Returns list of (index, vehicles) tuples.
    """
    conn = get_connection()
    rows = conn.execute(
        "SELECT vehicles FROM traffic_logs WHERE road=? ORDER BY id ASC LIMIT ?",
        (road, limit)
    ).fetchall()
    conn.close()
    return [(i + 1, row["vehicles"]) for i, row in enumerate(rows)]


def get_recent_events(limit=20):
    conn  = get_connection()
    rows  = conn.execute(
        "SELECT * FROM events ORDER BY id DESC LIMIT ?", (limit,)
    ).fetchall()
    conn.close()
    return [dict(r) for r in rows]


def log_full_cycle(roads_data, signal_plan):
    """Convenience: log traffic + signals for a full cycle."""
    from traffic_detection import classify_traffic
    for road, count in roads_data.items():
        state = classify_traffic(count)
        log_traffic(road, count, state)
    for road, info in signal_plan.items():
        log_signal(road, info["green_time"], info["signal"])


if __name__ == "__main__":
    init_db()
    log_traffic("Road1", 72, "HIGH")
    log_traffic("Road2", 15, "LOW")
    log_traffic("Road3", 38, "MEDIUM")
    log_event("accident", "Road3", "Minor collision reported")

    print("\nRecent traffic logs:")
    for row in get_recent_traffic(5):
        print(" ", row)

    print("\nRecent events:")
    for row in get_recent_events(5):
        print(" ", row)