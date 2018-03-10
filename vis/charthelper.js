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