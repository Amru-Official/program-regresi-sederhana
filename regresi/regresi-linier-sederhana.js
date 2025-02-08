class LinearRegression {
  constructor(data) {
      // Input validation with detailed error messages
      if (!Array.isArray(data)) {
          throw new Error('Data harus berupa array');
      }
      if (data.length < 2) {
          throw new Error('Minimal diperlukan 2 data point');
      }

      // Transform and validate data points
      // Support both [x,y] array format and {x,y} object format
      this.data = data.map(point => {
          if (Array.isArray(point) && point.length === 2) {
              if (typeof point[0] !== 'number' || typeof point[1] !== 'number' || 
                  isNaN(point[0]) || isNaN(point[1])) {
                  throw new Error(`Data point tidak valid: ${JSON.stringify(point)}`);
              }
              return { x: point[0], y: point[1] };
          } else if (point && typeof point === 'object') {
              if (typeof point.x !== 'number' || typeof point.y !== 'number' || 
                  isNaN(point.x) || isNaN(point.y)) {
                  throw new Error(`Data point tidak valid: ${JSON.stringify(point)}`);
              }
              return { x: point.x, y: point.y };
          }
          throw new Error(`Format data tidak valid: ${JSON.stringify(point)}`);
      });

      this.n = this.data.length;
      this.slope = null;
      this.intercept = null;
      this.residuals = [];
      this.yPred = [];
  }

  // Utility function to round numbers
  roundToPrecision(value, precision = 4) {
      const factor = Math.pow(10, precision);
      return Math.round(value * factor) / factor;
  }

  calculateRegression() {
      // Calculate means
      const sumX = this.data.reduce((sum, point) => sum + point.x, 0);
      const sumY = this.data.reduce((sum, point) => sum + point.y, 0);
      const meanX = sumX / this.n;
      const meanY = sumY / this.n;

      // Calculate slope
      let numerator = 0;
      let denominator = 0;
      this.data.forEach(point => {
          const xDiff = point.x - meanX;
          numerator += xDiff * (point.y - meanY);
          denominator += xDiff * xDiff;
      });

      this.slope = denominator !== 0 ? numerator / denominator : 0;
      this.intercept = meanY - this.slope * meanX;

      // Calculate predictions and residuals
      this.yPred = this.data.map(point => 
          this.roundToPrecision(this.slope * point.x + this.intercept)
      );
      
      this.residuals = this.data.map((point, index) => 
          this.roundToPrecision(point.y - this.yPred[index])
      );

      return this;
  }

  predict(x) {
      if (this.slope === null || this.intercept === null) {
          throw new Error('Model belum dilatih. Panggil calculateRegression() terlebih dahulu.');
      }
      return this.roundToPrecision(this.slope * x + this.intercept);
  }

  getEquation() {
      if (this.slope === null || this.intercept === null) {
          throw new Error('Model belum dilatih. Panggil calculateRegression() terlebih dahulu.');
      }
      const slope = this.roundToPrecision(this.slope);
      const intercept = this.roundToPrecision(this.intercept);
      const sign = intercept >= 0 ? '+' : '';
      return `Y = ${slope}X ${sign} ${intercept}`;
  }

  calculateRSquared() {
      if (this.residuals.length === 0) {
          throw new Error('Model belum dilatih. Panggil calculateRegression() terlebih dahulu.');
      }

      const meanY = this.data.reduce((sum, point) => sum + point.y, 0) / this.n;
      
      const totalSS = this.data.reduce((sum, point) => 
          sum + Math.pow(point.y - meanY, 2), 0);
      const residualSS = this.residuals.reduce((sum, residual) => 
          sum + Math.pow(residual, 2), 0);

      return this.roundToPrecision(1 - (residualSS / totalSS));
  }

  getResiduals() {
      if (this.residuals.length === 0) {
          throw new Error('Model belum dilatih. Panggil calculateRegression() terlebih dahulu.');
      }
      return [...this.residuals];
  }

  getPredictions() {
      if (this.yPred.length === 0) {
          throw new Error('Model belum dilatih. Panggil calculateRegression() terlebih dahulu.');
      }
      return [...this.yPred];
  }
}

module.exports = LinearRegression;