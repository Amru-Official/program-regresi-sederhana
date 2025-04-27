// BreuschPaganTest.js
const LinearRegression = require('./regresi-linier-sederhana');
const { jStat } = require('jstat');

class BreuschPaganTest {
  constructor(data, residuals) {
    this.data = data;
    this.residuals = residuals;
    // Validasi input untuk membantu debugging
    console.log(`BP Test - Data length: ${data.length}, Residuals length: ${residuals.length}`);
    console.log(`BP Test - Sample data: ${JSON.stringify(data[0])}`);
  }

  roundToPrecision(value, precision = 4) {
    return Number(value.toFixed(precision));
  }

  performTest() {
    // Hitung kuadrat residual
    const squaredResiduals = this.residuals.map(e => Math.pow(e, 2));
    
    // Buat data untuk regresi dalam format yang benar {x, y}
    // x adalah variabel independen asli, y adalah residual kuadrat
    const bpData = this.data.map((point, i) => ({
      x: point.x,  // Variabel independen
      y: squaredResiduals[i]  // Residual kuadrat sebagai variabel dependen
    }));
    
    // Jalankan regresi linier dengan format data yang benar
    const regression = new LinearRegression(bpData);
    regression.calculateRegression();

    // Hitung statistik BP
    const rSquared = regression.calculateRSquared();
    const n = this.data.length;
    const bpStatistic = this.roundToPrecision(n * rSquared);
    
    // Hitung p-value (chi-square dengan df=1)
    const pValue = this.roundToPrecision(1 - jStat.chisquare.cdf(bpStatistic, 1));
    
    // Tentukan apakah menolak H0
    const rejectH0 = pValue < 0.05;
    
    return { 
      statistic: bpStatistic, 
      pValue, 
      rejectH0,
      conclusion: rejectH0
        ? 'Reject H0: Evidence of heteroskedasticity.'
        : 'Fail to reject H0: No evidence of heteroskedasticity.'
    };
  }
}

module.exports = BreuschPaganTest;