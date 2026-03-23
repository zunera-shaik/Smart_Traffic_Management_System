# Smart Traffic Management System for Urban Congestion

A comprehensive intelligent traffic management system designed to optimize urban traffic flow by combining computer vision, machine learning, and real-time signal control.

## Features

✨ **Core Capabilities:**
- **Real-time Traffic Detection**: Computer vision-based vehicle detection using OpenCV
- **Ambulance Detection & Emergency Response**: Automatic traffic signal priority for emergency vehicles
- **Intelligent Signal Control**: Adaptive traffic light management based on traffic density
- **Traffic Prediction**: ML-powered prediction of traffic patterns and congestion
- **Traffic Database**: Persistent logging of traffic events and patterns
- **RESTful API**: Comprehensive backend API for all traffic management operations
- **Interactive Dashboard**: React-based web interface for real-time monitoring and control

## Project Structure

```
Smart Traffic Management/
├── api_server.py               # Main Flask API server
├── traffic_detection.py        # Vehicle detection using computer vision
├── ambulance_detection.py      # Emergency vehicle detection & handling
├── signal_control.py           # Intelligent traffic signal logic
├── traffic_prediction.py       # ML-based traffic prediction
├── traffic_database.py         # Database operations & logging
├── requirements.txt            # Python dependencies
├── frontend/                   # React dashboard
│   ├── index.html             # HTML entry point
│   ├── package.json           # Node dependencies
│   ├── vite.config.js         # Vite configuration
│   └── src/
│       ├── App.jsx            # Main React component
│       └── main.jsx           # React entry point
└── README.md                   # This file
```

## Installation

### Prerequisites
- Python 3.8+
- Node.js 16+ and npm
- Git

### Backend Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kavinkumar20066/Smart-traffic-management-system-for-urban-congestion.git
   cd Smart-traffic-management-system-for-urban-congestion
   ```

2. **Create a virtual environment:**
   ```bash
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

## Usage

### Running the Backend

Start the Flask API server:
```bash
python api_server.py
```
The API will be available at `http://localhost:5000`

### Running the Frontend

1. **Development mode:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Build for production:**
   ```bash
   npm run build
   ```

3. **Preview production build:**
   ```bash
   npm run preview
   ```

## Technology Stack

### Backend
- **Flask**: Web framework for REST API
- **Flask-CORS**: Cross-origin resource sharing
- **OpenCV**: Computer vision for vehicle detection
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning algorithms
- **Pandas**: Data analysis and manipulation
- **Requests**: HTTP client library

### Frontend
- **React 18**: UI library
- **React DOM**: React rendering for web
- **Vite**: Frontend build tool and dev server

## API Endpoints

### Traffic Management
- `GET /api/traffic` - Get current traffic status
- `POST /api/traffic/update` - Update traffic data
- `GET /api/signals` - Get traffic signal states
- `POST /api/signals/control` - Control traffic signals

### Emergency Response
- `POST /api/emergency/activate` - Activate emergency mode
- `POST /api/emergency/clear` - Clear emergency mode
- `GET /api/emergency/status` - Get emergency status

### Predictions
- `GET /api/predictions` - Get traffic predictions
- `POST /api/predictions/analyze` - Analyze traffic patterns

### Database
- `GET /api/logs` - Get traffic logs
- `GET /api/events` - Get recent events

## Key Components

### Traffic Detection
Detects vehicles and classifies traffic density using computer vision:
- LOW: < 20 vehicles
- MEDIUM: 20-50 vehicles
- HIGH: > 50 vehicles

### Signal Control
Implements adaptive signal timing based on:
- Current traffic load on each road
- Time of day patterns
- Emergency vehicle priorities
- Historical traffic data

### Ambulance Detection
Provides priority lanes for emergency vehicles:
- Automatic signal preemption
- Real-time emergency tracking
- Clear emergency protocols

### Traffic Prediction
ML models for:
- Congestion forecasting
- Rush hour prediction
- Optimal signal timing recommendations

## Configuration

Edit the following in respective files:
- **ROADS**: Modify road list in `api_server.py`
- **Signal Timing**: Adjust in `signal_control.py`
- **Detection Parameters**: Update in `traffic_detection.py`

## Development

### Adding New Features

1. Add backend logic in appropriate module
2. Expose via REST endpoint in `api_server.py`
3. Update frontend components in `frontend/src/`
4. Test via API and dashboard

### Code Structure

- Modular design with separate concerns
- Database abstraction layer
- RESTful API architecture
- React component-based UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Authors

- Kavin Kumar

## Support

For support, email or create an issue in the repository.

## Acknowledgments

- Flask documentation
- OpenCV community
- React documentation
- Scikit-learn library
