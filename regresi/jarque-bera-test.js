// Import dependencies
const { jStat } = require('jstat');

// Utility function to round numbers
function roundToPrecision(value, precision = 2) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

// Jarque-Bera Test Class
class JarqueBeraTest {
  constructor(data, mean, stdDev, alpha = 0.05) {
    this.data = data;
    this.mean = mean;
    this.stdDev = stdDev;
    this.alpha = alpha;
  }

  // Calculate skewness of the data
  calculateSkewness() {
    const n = this.data.length;
    let sumCube = 0;
    
    for (let i = 0; i < n; i++) {
      sumCube += Math.pow((this.data[i] - this.mean) / this.stdDev, 3);
    }
    
    return sumCube / n;
  }

  // Calculate kurtosis of the data
  calculateKurtosis() {
    const n = this.data.length;
    let sumQuartic = 0;
    
    for (let i = 0; i < n; i++) {
      sumQuartic += Math.pow((this.data[i] - this.mean) / this.stdDev, 4);
    }
    
    return sumQuartic / n;
  }

  // Perform the Jarque-Bera test
  performTest() {
    const n = this.data.length;
    
    // Calculate skewness and kurtosis
    const skewness = this.calculateSkewness();
    const kurtosis = this.calculateKurtosis();
    
    // Calculate Jarque-Bera statistic
    const JB = n * (Math.pow(skewness, 2) / 6 + Math.pow(kurtosis - 3, 2) / 24);
    
    // Critical value from chi-square distribution with 2 degrees of freedom
    const criticalValue = jStat.chisquare.inv(1 - this.alpha, 2);
    
    // Calculate p-value
    const pValue = 1 - jStat.chisquare.cdf(JB, 2);
    
    // Determine if we reject the null hypothesis
    const rejectH0 = JB > criticalValue || pValue < this.alpha;

    return {
      D: roundToPrecision(JB), // Menggunakan nama yang sama dengan KS test untuk kompatibilitas
      criticalValue: roundToPrecision(criticalValue),
      skewness: roundToPrecision(skewness),
      kurtosis: roundToPrecision(kurtosis),
      pValue: roundToPrecision(pValue),
      rejectH0,
      conclusion: rejectH0
        ? `Reject H0: The data does not follow a normal distribution.`
        : `Fail to reject H0: The data follows a normal distribution.`
    };
  }
}

module.exports = JarqueBeraTest;