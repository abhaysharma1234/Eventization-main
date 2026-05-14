import { useState } from 'react';
import axios from 'axios';

export default function AttendancePredictor({ eventData, onPrediction, organizerData }) {
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predictAttendance = async () => {
    if (!eventData.title || !eventData.category || !eventData.date || !eventData.description) {
      setError('Please fill in all required fields first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/api/events/predict', {
        title: eventData.title,
        description: eventData.description,
        category: eventData.category,
        date: eventData.date,
        location: eventData.location || '',
        capacity: eventData.capacity || 100
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const predictionData = response.data.prediction;
      setPrediction(predictionData);
      onPrediction(predictionData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to predict attendance');
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-emerald-600 bg-emerald-50';
    if (confidence >= 0.6) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    return 'Low Confidence';
  };

  const hasRequiredFields = eventData?.title && eventData?.category && eventData?.date && eventData?.description;

  if (!hasRequiredFields) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          Fill in all required fields to enable attendance prediction
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <span className="text-sm text-blue-700">Analyzing event data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-red-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <p className="text-sm text-red-700 font-medium">Prediction failed</p>
            <p className="text-xs text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4 space-y-4">
      {!prediction && (
        <div className="text-center">
          <button
            onClick={predictAttendance}
            disabled={loading}
            className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-sm font-semibold rounded-xl px-6 py-3 hover:from-teal-700 hover:to-emerald-700 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? 'Predicting...' : 'Predict Attendance'}
          </button>
          <p className="text-xs text-gray-500 mt-2">Get AI-powered attendance prediction for your event</p>
        </div>
      )}

      {prediction && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
              </svg>
              <h3 className="font-semibold text-gray-900">AI Attendance Prediction</h3>
            </div>
            <button
              onClick={predictAttendance}
              disabled={loading}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              {loading ? 'Updating...' : 'Update Prediction'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-3 border border-teal-100">
              <div className="text-2xl font-bold text-teal-700">{prediction.predictedAttendance}</div>
              <div className="text-xs text-gray-600">Expected Attendees</div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-teal-100">
              <div className="text-2xl font-bold text-gray-700">
                {eventData.capacity ? Math.round((prediction.predictedAttendance / eventData.capacity) * 100) : 'N/A'}%
              </div>
              <div className="text-xs text-gray-600">Capacity Utilization</div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getConfidenceColor(prediction.confidence)}`}>
                {getConfidenceText(prediction.confidence)}
              </span>
              <span className="text-xs text-gray-500">
                {Math.round(prediction.confidence * 100)}% accuracy
              </span>
            </div>
            
            <div className="text-xs text-gray-500">
              Method: {prediction.methodology === 'ml_regression' ? 'ML Model' : 'Rule-based'}
            </div>
          </div>

          {eventData.capacity && prediction.predictedAttendance > eventData.capacity * 0.9 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
              <div className="flex items-center gap-2 text-xs text-amber-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                High attendance expected - consider increasing capacity
              </div>
            </div>
          )}

          {eventData.capacity && prediction.predictedAttendance < eventData.capacity * 0.3 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
              <div className="flex items-center gap-2 text-xs text-blue-700">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Lower attendance expected - focus on marketing
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
