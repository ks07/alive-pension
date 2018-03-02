const Chart = require('chart.js');

var hist = require('../history.json');

var ctx = document.getElementById('fundchart');

function unpackFundTrend(hist, name) {
    return hist.map((d,i) => {
        return { x: d.timestamp, y: d.funds[name].value };
    });
}

let mydat = unpackFundTrend(hist, 'fundA');

var myChart = new Chart(ctx, {
    type: 'line',
    data: {
        datasets: [{
            label: "fundA",
            data: mydat,
        }]
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
                    labelString: 'Fund Value',
                }
            }]
        }
    },
});