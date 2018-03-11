// Returns a new dataset object with some sensible defaults set.
exports.sensibleDataset = function(label, data, extras = {}) {
    return Object.assign(
        {},
        {
            label,
            data,
            cubicInterpolationMode: 'monotone',
        },
        extras
    );
}

// Returns a simple time-series graph Chart object with sensible defaults set.
exports.timeSeriesGraph = function(containerID, yLabel, datasets) {
    return new Chart(document.getElementById(containerID), {
        type: 'line',
        data: {
            datasets,
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
                        labelString: yLabel,
                    }
                }]
            },
            pan: {
                enabled: true,
                mode: 'xy',
            },
            zoom: {
                enabled: true,
                mode: 'xy',
            }
        },
    });
}