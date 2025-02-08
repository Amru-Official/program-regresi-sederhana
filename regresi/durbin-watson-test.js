// DurbinWatsonTest.js

function roundToPrecision(value, precision = 4) {
  return Number(value.toFixed(precision));
}

function calculateDurbinWatson(residuals) {
  const n = residuals.length;

  const sumSquaredResiduals = residuals.reduce((acc, e) => acc + Math.pow(e, 2), 0);
  let sumSquaredDifferences = 0;

  for (let i = 1; i < n; i++) {
    sumSquaredDifferences += Math.pow(residuals[i] - residuals[i - 1], 2);
  }

  return roundToPrecision(sumSquaredDifferences / sumSquaredResiduals);
}

function interpretDurbinWatson(dw) {
  if (dw < 1.5) {
    return 'Positive autocorrelation (errors are positively correlated)';
  } else if (dw > 2.5) {
    return 'Negative autocorrelation (errors are negatively correlated)';
  } else if (dw >= 1.5 && dw <= 2.5) {
    return 'No autocorrelation (errors are independent)';
  } else {
    return 'Invalid Durbin-Watson value';
  }
}

module.exports = { calculateDurbinWatson, interpretDurbinWatson };
