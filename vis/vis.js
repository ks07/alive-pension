const Chart = require('chart.js');
const charthelper = require('./charthelper.js');

const hist = require('../history.json');

// Colour palette courtesy of http://www.colorhunt.co/c/107141
const colors = ['#4a772f', '#ffdd00', '#fa9e05', '#a7095c'];
const color_purple = '#a620db';
const color_red = '#e53d3d';

// An alternative Array.map implementation allowing simultaneous filtering
// If the callback function transform returns undefined, that element will be skipped
function filterMap(arr, transform) {
    return arr.reduce((acc, v, i, a) => {
        let out = transform(v,i,a);
        if (out !== undefined) {
            acc.push(out);
        }
        return acc;
    }, []);
}

function getFunds(hist) {
    return Object.keys(hist[0].funds);
}

function unpackFundTrend(hist, name) {
    return filterMap(hist, d => {
        return d.funds[name] ? { x: d.timestamp, y: d.funds[name].value } : undefined;
    });
}

function unpackPerfTrend(hist) {
    return hist.map(d => {
        return { x: d.timestamp, y: d.summary.value - d.summary.paid };
    });
}

function unpackPcntTrend(hist) {
    return hist.map(d => {
        return { x: d.timestamp, y: (d.summary.value * 100 / d.summary.paid) - 100 };
    });
}

function unpackPaidTrend(hist) {
    return hist.map(d => {
        return { x: d.timestamp, y: d.summary.paid };
    });
}

let datasets = getFunds(hist).map((name, i) => {
    return charthelper.sensibleDataset(name, unpackFundTrend(hist, name), {
        backgroundColor: colors[i],
        pointBorderColor: '#000000',
        yAxisID: 'stackY',
    });
});
// Datasets get z-indexed by the order in which they appear, i.e. earlier datasets are drawn over later ones
datasets.unshift(charthelper.sensibleDataset('Paid In', unpackPaidTrend(hist), {
    yAxisID: 'overlayY',
    fill: false,
    borderColor: color_red,
}));

let fundchart = new Chart(document.getElementById('fundchart'), {
    type: 'line',
    data: {
        datasets: datasets,
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Day',
                }
            }],
            yAxes: [
                {
                    display: false,
                    stacked: false,
                    id: 'overlayY',
                    ticks: {
                        min: 1000.0,
                    },
                },
                {
                    display: true,
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Fund Value',
                    },
                    id: 'stackY',
                    ticks: {
                        min: 0.0,
                    },
                },
            ]
        }
    },
});

// Use the auto-calculated limits of the stacked axis as the limits of the overlayed one, so they share the same scale
fundchart.options.scales.yAxes[0].ticks.min = fundchart.controller.scales.stackY.start;
fundchart.options.scales.yAxes[0].ticks.max = fundchart.controller.scales.stackY.end;
fundchart.update();

function unpackFundPaidValTrend(hist, name) {
    return filterMap(hist, d => {
        return d.funds[name] ? { x: d.timestamp, y: d.funds[name].value - d.funds[name].share * d.summary.paid } : undefined;
    });
}

let perfdatasets = getFunds(hist).map((name, i) => {
    return charthelper.sensibleDataset(name, unpackFundPaidValTrend(hist, name), {
        borderColor: colors[i],
        backgroundColor: colors[i],
        fill: false,
    });
});
perfdatasets.push(charthelper.sensibleDataset('Overall', unpackPerfTrend(hist)));

let perfchart = new Chart(document.getElementById('perfchart'), {
    type: 'line',
    data: {
        datasets: perfdatasets,
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Day',
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Net Gain (£)',
                }
            }]
        }
    },
});

function unpackFundPaidTrend(hist, name) {
    return filterMap(hist, d => {
        return d.funds[name] ? { x: d.timestamp, y: ((d.funds[name].value * 100) / (d.funds[name].share * d.summary.paid)) - 100 } : undefined;
    });
}

let pcntdatasets = getFunds(hist).map((name, i) => {
    return charthelper.sensibleDataset(name, unpackFundPaidTrend(hist, name), {
        borderColor: colors[i],
        backgroundColor: colors[i],
        fill: false,
    });
});
pcntdatasets.push(charthelper.sensibleDataset('Overall', unpackPcntTrend(hist)));

let pcntchart = new Chart(document.getElementById('pcntchart'), {
    type: 'line',
    data: {
        datasets: pcntdatasets,
    },
    options: {
        scales: {
            xAxes: [{
                type: 'time',
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Day',
                }
            }],
            yAxes: [{
                display: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Net Gain (%)',
                },
                ticks: {
                    suggestedMin: 0.0,
                }
            }]
        }
    },
});