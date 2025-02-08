// Import dependencies
const { jStat } = require('jstat');

// Utility function to round numbers
function roundToPrecision(value, precision = 2) {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}

// Utility function for calculating empirical CDF
function empiricalCDF(data, x) {
  const n = data.length;
  const count = data.filter(value => value <= x).length;
  return count / n;
}

// Function to calculate critical value for KS test
function calculateCriticalValue(alpha, n) {
  const cAlpha = 1.36;  // Approximate critical value for alpha = 0.05
  return cAlpha / Math.sqrt(n);
}

// Kolmogorov-Smirnov Test Class
class KolmogorovSmirnovTest {
  constructor(data, mean, stdDev, alpha = 0.05) {
    this.data = data;
    this.mean = mean;
    this.stdDev = stdDev;
    this.alpha = alpha;
  }

  // Perform the Kolmogorov-Smirnov test
  performTest() {
    const sortedData = this.data.slice().sort((a, b) => a - b);
    let maxDifference = 0;

    sortedData.forEach(value => {
      const empirical = empiricalCDF(sortedData, value);
      const theoretical = jStat.normal.cdf(value, this.mean, this.stdDev);
      const difference = Math.abs(empirical - theoretical);
      maxDifference = Math.max(maxDifference, difference);
    });

    const criticalValue = calculateCriticalValue(this.alpha, this.data.length);
    const rejectH0 = maxDifference > criticalValue;

    return {
      D: roundToPrecision(maxDifference),
      criticalValue: roundToPrecision(criticalValue),
      rejectH0,
      conclusion: rejectH0
        ? `Reject H0: The data does not follow a normal distribution.`
        : `Fail to reject H0: The data follows a normal distribution.`
    };
  }
}

module.exports = KolmogorovSmirnovTest;
