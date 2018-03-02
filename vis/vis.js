const Chart = require('chart.js');

var hist = require('../history.json');

var ctx = document.getElementById('fundchart');

// Colour palette courtesy of http://www.colorhunt.co/c/107141
let colors = ['#4a772f', '#ffdd00', '#fa9e05', '#a7095c'];

function getFunds(hist) {
    return Object.keys(hist[0].funds);
}

function unpackFundTrend(hist, name) {
    return hist.map((d,i) => {
        return { x: d.timestamp, y: d.funds[name].value };
    });
}

datasets = getFunds(hist).map((name, i) => {
    return { label: name, data: unpackFundTrend(hist, name), backgroundColor: colors[i], pointBorderColor: '#000000' };
});

var myChart = new Chart(ctx, {
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