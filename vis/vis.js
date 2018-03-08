const Chart = require('chart.js');

var hist = require('../history.json');

// Colour palette courtesy of http://www.colorhunt.co/c/107141
let colors = ['#4a772f', '#ffdd00', '#fa9e05', '#a7095c'];

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

datasets = getFunds(hist).map((name, i) => {
    return { label: name, data: unpackFundTrend(hist, name), backgroundColor: colors[i], pointBorderColor: '#000000' };
});

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
            yAxes: [{
                display: true,
                stacked: true,
                scaleLabel: {
                    display: true,
                    labelString: 'Fund Value',
                }
            }]
        }
    },
});

let perfchart = new Chart(document.getElementById('perfchart'), {
    type: 'line',
    data: {
        datasets: [{
            label: 'profit',
            data: unpackPerfTrend(hist),
        }],
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

let pcntchart = new Chart(document.getElementById('pcntchart'), {
    type: 'line',
    data: {
        datasets: [{
            label: 'profit',
            data: unpackPcntTrend(hist),
        }],
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
                }
            }]
        }
    },
});