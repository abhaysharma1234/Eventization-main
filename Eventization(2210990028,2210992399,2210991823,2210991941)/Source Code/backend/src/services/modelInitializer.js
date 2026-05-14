import attendancePredictionService from './attendancePrediction.js';

class ModelInitializer {
  static async initializeModels() {
    try {
      console.log('🤖 Initializing AI prediction models...');
      
      // Train the attendance prediction model
      await attendancePredictionService.trainModel();
      
      const modelStats = await attendancePredictionService.getModelStats();
      console.log('✅ AI Models initialized successfully:', modelStats);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize AI models:', error);
      return false;
    }
  }
  
  static async retrainModels() {
    console.log('🔄 Retraining AI models with latest data...');
    return await this.initializeModels();
  }
}

export default ModelInitializer;
