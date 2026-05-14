import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import User from '../models/User.js';
import moment from 'moment';
// import { LinearRegression } from 'ml-regression';
import MLR from 'ml-regression-multivariate-linear';

class AttendancePredictionService {
  constructor() {
    this.model = null;
    this.isTrained = false;
    this.features = ['dayOfWeek', 'month', 'daysUntilEvent', 'categoryPopularity', 'organizerReputation', 'capacity', 'priceFactor'];
  }

  async trainModel() {
    try {
      console.log('Training attendance prediction model...');
      
      // Get historical events with attendance data
      const historicalEvents = await Event.aggregate([
        {
          $match: {
            date: { $lt: new Date() },
            status: 'approved'
          }
        },
        {
          $lookup: {
            from: 'registrations',
            localField: '_id',
            foreignField: 'event',
            as: 'registrations'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'organizer',
            foreignField: '_id',
            as: 'organizerData'
          }
        },
        {
          $project: {
            title: 1,
            description: 1,
            category: 1,
            date: 1,
            location: 1,
            capacity: 1,
            createdAt: 1,
            averageRating: 1,
            attendanceCount: {
              $size: {
                $filter: {
                  input: '$registrations',
                  cond: { $ne: ['$$this.status', 'cancelled'] }
                }
              }
            },
            organizerReputation: { $arrayElemAt: ['$organizerData.points', 0] }
          }
        }
      ]);

      if (historicalEvents.length < 10) {
        console.log('Not enough historical data for training. Using rule-based prediction.');
        return;
      }

      // Prepare training data
      const trainingData = [];
      const targets = [];

      for (const event of historicalEvents) {
        const features = this.extractFeatures(event);
        trainingData.push(features);
        targets.push(event.attendanceCount);
      }

      // Train linear regression model
      // this.model = new LinearRegression(trainingData, targets);
      this.model = new MLR(trainingData, targets);
      this.isTrained = true;
      
      console.log(`Model trained with ${historicalEvents.length} events`);
    } catch (error) {
      console.error('Error training prediction model:', error);
    }
  }

  extractFeatures(event) {
    const eventDate = moment(event.date);
    const createdDate = moment(event.createdAt);
    const now = moment();
    
    // Feature extraction
    const dayOfWeek = eventDate.day(); // 0-6 (Sunday-Saturday)
    const month = eventDate.month(); // 0-11
    const daysUntilEvent = eventDate.diff(now, 'days');
    const capacity = event.capacity || 100;
    const organizerReputation = event.organizerReputation || 0;
    
    // Calculate category popularity (simplified)
    const categoryPopularity = this.getCategoryPopularity(event.category);
    
    // Price factor (based on description analysis - simplified)
    const priceFactor = this.extractPriceFactor(event.description);
    
    return [
      dayOfWeek,
      month,
      Math.max(0, daysUntilEvent),
      categoryPopularity,
      organizerReputation / 1000, // Normalize
      capacity / 100, // Normalize
      priceFactor
    ];
  }

  getCategoryPopularity(category) {
    // Static category popularity scores (could be made dynamic)
    const popularityScores = {
      'Technology': 0.9,
      'Business': 0.8,
      'Education': 0.7,
      'Entertainment': 0.85,
      'Sports': 0.75,
      'Music': 0.8,
      'Food': 0.7,
      'Art': 0.6,
      'Health': 0.65,
      'Social': 0.8
    };
    
    return popularityScores[category] || 0.5;
  }

  extractPriceFactor(description) {
    // Simple heuristic to detect if event is free/paid based on description
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('free') || lowerDesc.includes('no charge')) {
      return 1.2; // Free events tend to have higher attendance
    } else if (lowerDesc.includes('paid') || lowerDesc.includes('$') || lowerDesc.includes('ticket')) {
      return 0.8; // Paid events might have lower attendance
    }
    return 1.0; // Neutral
  }

  async predictAttendance(eventData, organizerData) {
    try {
      // If model is not trained, use rule-based prediction
      if (!this.isTrained) {
        return this.ruleBasedPrediction(eventData, organizerData);
      }

      // Extract features for the new event
      const eventWithFeatures = {
        ...eventData,
        organizerReputation: organizerData?.points || 0
      };
      
      const features = this.extractFeatures(eventWithFeatures);
      
      // Make prediction
      const prediction = Math.max(0, Math.round(this.model.predict(features)));
      
      // Apply bounds
      const capacity = eventData.capacity || 100;
      const boundedPrediction = Math.min(prediction, capacity);
      
      // Calculate confidence
      const confidence = this.calculateConfidence(features);
      
      return {
        predictedAttendance: boundedPrediction,
        confidence: confidence,
        methodology: 'ml_regression'
      };
      
    } catch (error) {
      console.error('Error predicting attendance:', error);
      return this.ruleBasedPrediction(eventData, organizerData);
    }
  }

  ruleBasedPrediction(eventData, organizerData) {
    const capacity = eventData.capacity || 100;
    const eventDate = moment(eventData.date);
    const now = moment();
    const daysUntilEvent = Math.max(0, eventDate.diff(now, 'days'));
    
    // Base attendance percentage
    let attendancePercentage = 0.3; // 30% base attendance
    
    // Adjust based on factors
    attendancePercentage += this.getCategoryPopularity(eventData.category) * 0.2;
    
    // Organizer reputation bonus
    if (organizerData?.points > 500) {
      attendancePercentage += 0.1;
    }
    
    // Time-based adjustments
    if (daysUntilEvent < 7) {
      attendancePercentage -= 0.1; // Last minute events
    } else if (daysUntilEvent > 30) {
      attendancePercentage -= 0.05; // Too far in future
    }
    
    // Weekend bonus
    const dayOfWeek = eventDate.day();
    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
      attendancePercentage += 0.1;
    }
    
    // Apply bounds
    attendancePercentage = Math.max(0.1, Math.min(0.9, attendancePercentage));
    
    const predictedAttendance = Math.round(capacity * attendancePercentage);
    
    return {
      predictedAttendance: predictedAttendance,
      confidence: 0.6, // Lower confidence for rule-based
      methodology: 'rule_based'
    };
  }

  calculateConfidence(features) {
    // Simple confidence calculation based on feature values
    let confidence = 0.7; // Base confidence
    
    // Higher confidence for events with more data
    if (features[5] > 0) { // Has capacity
      confidence += 0.1;
    }
    
    // Lower confidence for events too far in future
    if (features[2] > 60) { // More than 60 days away
      confidence -= 0.2;
    }
    
    return Math.max(0.3, Math.min(0.95, confidence));
  }

  async getModelStats() {
    return {
      isTrained: this.isTrained,
      features: this.features,
      methodology: this.isTrained ? 'ml_regression' : 'rule_based'
    };
  }
}

export default new AttendancePredictionService();
