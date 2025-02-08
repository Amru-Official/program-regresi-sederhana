// BreuschPaganTest.js

const LinearRegression = require('./regresi-linier-sederhana');
const { jStat } = require('jstat');

class BreuschPaganTest {
  constructor(data, residuals) {
    this.data = data;
    this.residuals = residuals;
  }

  roundToPrecision(value, precision = 4) {
    return Number(value.toFixed(precision));
  }

  performTest() {
    const squaredResiduals = this.residuals.map(e => Math.pow(e, 2));

    const regression = new LinearRegression(this.data.map((d, i) => [d[0], squaredResiduals[i]]));
    regression.calculateRegression();

    const rSquared = regression.calculateRSquared();
    const bpStatistic = this.roundToPrecision(rSquared * this.data.length);

    const pValue = this.roundToPrecision(1 - jStat.chisquare.cdf(bpStatistic, 1));
    const conclusion = pValue < 0.05
      ? 'Reject H0: Evidence of heteroskedasticity.'
      : 'Fail to reject H0: No evidence of heteroskedasticity.';

    return { bpStatistic, pValue, conclusion };
  }
}

module.exports = BreuschPaganTest;
