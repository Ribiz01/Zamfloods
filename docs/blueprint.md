# **App Name**: Zambia Flood Watch

## Core Features:

- Multi-Source Data Ingestion: Ingest meteorological, hydrological, disaster, and satellite data from various sources including Zambia Meteorological Department (ZMD) and WARMA.
- Probabilistic Flood Forecasting: Generate 24-72 hour probabilistic flood forecasts using machine learning models.
- Risk Classification: Classify flood risk levels (No Flood, Moderate, High, Extreme) with confidence intervals, leveraging a trained Random Forest, LSTM or ANN.
- GIS-Enabled Risk Maps: Produce GIS-enabled district-level risk maps for pilot districts: Lusaka, Mongu, and Chipata.
- Multi-Channel Alert System: Trigger alerts (SMS, push notifications, dashboard) when flood risk exceeds configurable thresholds using Africa's Talking or Twilio API. Message format will include timestamp and confidence margin.
- Automated Model Retraining: Automatically retrain the flood prediction model weekly or after major flood events using Cloud Scheduler. The models will be versioned with rollback capabilities.
- Data Provenance and Audit Trails: Maintain complete data provenance and audit trails for all ingested data and model predictions, storing raw data in Cloud Storage and processed data in Firestore.

## Style Guidelines:

- Primary color: Black (#000000) for a strong, authoritative feel.
- Background color: White (#FFFFFF) for a clean and neutral backdrop.
- Accent color: Gray (#808080) to highlight critical alerts and interactive elements, providing contrast without being too distracting.
- Headline font: 'Space Grotesk', a proportional sans-serif with a computerized, techy, scientific feel. Body font: 'Inter' a grotesque-style sans-serif with a modern, machined, objective, neutral look.
- Use clear and universally recognizable icons from a library like Font Awesome to represent different data types and risk levels.
- Implement a responsive, grid-based layout to ensure the dashboard is accessible on various devices. The Zambia district map should be prominently displayed.
- Incorporate subtle animations to provide feedback on user interactions and highlight critical alerts. These should be used sparingly to avoid overwhelming the user.