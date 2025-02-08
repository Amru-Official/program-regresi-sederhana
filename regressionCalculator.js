const LinearRegression = require('./regresi/regresi-linier-sederhana');
const KolmogorovSmirnovTest = require('./regresi/kolmogorov-smirnov-test');
const BreuschPaganTest = require('./regresi/breusch-pagan-test');
const { calculateDurbinWatson, interpretDurbinWatson } = require('./regresi/durbin-watson-test');
const { jStat } = require('jstat');

function calculateRegression(data) {
    try {
        if (!Array.isArray(data) || data.length < 2) {
            throw new Error('Minimal diperlukan 2 data untuk analisis regresi');
        }

        const formattedData = data.map(point => {
            const x = Number(point.independent_variable);
            const y = Number(point.dependent_variable);

            if (isNaN(x) || isNaN(y)) {
                throw new Error(`Data tidak valid: { x: ${point.independent_variable}, y: ${point.dependent_variable} }`);
            }

            return { x, y };
        });

        console.log('Formatted Data:', formattedData);

        const regression = new LinearRegression(formattedData);
        regression.calculateRegression();

        const residuals = regression.getResiduals();

        // **Validasi residuals sebelum digunakan**
        if (!residuals || residuals.length === 0 || residuals.some(isNaN)) {
            throw new Error('Residuals tidak valid atau kosong.');
        }

        const mean = jStat.mean(residuals);
        const stdDev = jStat.stdev(residuals, true);

        // **Validasi mean & stdDev sebelum digunakan**
        if (isNaN(mean) || isNaN(stdDev) || stdDev === 0) {
            throw new Error(`Mean atau Standard Deviation tidak valid. Mean: ${mean}, StdDev: ${stdDev}`);
        }

        // **Step 1: Hasil Regresi**
        const regressionResult = {
            equation: regression.getEquation(),
            rSquared: regression.calculateRSquared(),
            residuals
        };

        // **Step 2: Uji Kolmogorov-Smirnov**
        const ksTest = new KolmogorovSmirnovTest(residuals, mean, stdDev);
        const ksResult = ksTest.performTest();

        if (!ksResult) {
            throw new Error('Hasil KS Test tidak valid.');
        }

        regressionResult.ksTest = ksResult;

        // **Step 3: Uji Breusch-Pagan**
        if (!ksResult.rejectH0) {
            try {
                const bpTest = new BreuschPaganTest(formattedData, residuals);
                const bpResult = bpTest.performTest();
                regressionResult.bpTest = {
                    skipped: false,
                    statistic: bpResult.statistic,
                    pValue: bpResult.pValue,
                    rejectH0: bpResult.rejectH0
                };
            } catch (error) {
                regressionResult.bpTest = {
                    skipped: true,
                    reason: 'Tidak dapat melakukan uji Breusch-Pagan'
                };
            }
        } else {
            regressionResult.bpTest = {
                skipped: true,
                reason: 'Uji Breusch-Pagan dilewati (residual tidak berdistribusi normal)'
            };
        }

        // **Step 4: Uji Durbin-Watson**
        if (data.length >= 3) {
            try {
                const dw = calculateDurbinWatson(residuals);
                regressionResult.dwTest = {
                    skipped: false,
                    statistic: dw,
                    interpretation: interpretDurbinWatson(dw)
                };
            } catch (error) {
                regressionResult.dwTest = {
                    skipped: true,
                    reason: 'Tidak dapat melakukan uji Durbin-Watson'
                };
            }
        } else {
            regressionResult.dwTest = {
                skipped: true,
                reason: 'Minimal diperlukan 3 data untuk uji Durbin-Watson'
            };
        }

        return regressionResult;
    } catch (error) {
        console.error(`Gagal menghitung regresi: ${error.message}`);
        return { error: error.message };
    }
}

module.exports = { calculateRegression };
