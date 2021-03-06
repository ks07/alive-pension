# A-live Pension Tracker

Designed to work with the popular UK pension provider, whose name may or may not rhyme with Geneva.

**Warning:** *Please make sure you have read and understood the Safety & Security section of this document before using this script - it will have full access to your pension!*

This script uses Headless Chrome via Puppeteer to login to a personal pension account to fetch current fund values. This data is saved to a JSON document containing a history of the raw values parsed from the site.

After each run, the historic data is used to produce a simple HTML-based graphical display of fund values over time.

The JSON format used is intended to be a simple store of the raw values parsed from the site. If desired, it should be straightforward to use this data in your own applications.

## Usage

Before running this application, it will need to be configured. The application uses a simple JSON file for configuration. Simply copy or rename the `conf.json.example` file to `conf.json` and replace the placeholders. For best results, you should add definitions of each of your investment funds to the `myFunds` section of the config file:

```
{
    "username": "USERNAME", // Your login username, usually your email address
    "password": "PASSWORD", // Your password
    "headless": false, // If set to true, Chromium will be launched in headless mode
    "chromeArgs": [], // An array of additional argument strings to pass to the chromium executable
    "myFunds": { // Add as many objects to myFunds as you have investment funds
        "FUND FULL NAME": { // The official name of the investment fund - these are usually very long!
            "shortname": "MYNAME", // A shortname to use for this fund when printing and visualising data
            "share": 1.0 // What proportion of future and historic payments are assigned to this fund (see Limitations for some details)
        }
    }
}
```

Once you have configured the application, simply install dependencies and let it run!

```
$ npm install
$ node index.js
```

On exit, the application will print a simple table-based summary of the pension's current value to stdout.

Data will be stored in the current working directory in a `history.json` file. Upon each run, `history.json` will be renamed to `history.json.bkp` before storing the new file as a form of backup.

Running the application will also update the HTML visualisation. To view it, simply open `vis/vis.html` in any modern web browser.

## Visualisations

The visualisations are implemented using chart.js and browserify. If you have made manual changes to `history.json` or the visualisation code, you can manually rebuild the browser code by running:

```
browserify vis/vis.js -o vis/vis.bundle.js
```

This will require browserify to be in your $PATH - you can install it with `npm install -g browserify`.

## Safety & Security

As $PENSION_PROVIDER does not provide an API to access data, it is necessary to supply this script with your full username and password. For this reason:

1. Make sure you understand what the code does before running it.
2. Only run it on a machine that you trust, with strong access controls to prevent compromise of your credentials.

Similarly, the visualisation page is not designed to be publically accessible (as it, hopefully obviously, contains personal information). If for whatever reason you wish to share any graphs, you should be able to export individual graphs to an image file using your web browser (in Firefox and Chrome, simply right-click the desired graph and use the `Save Image As...` option).

## Limitations

0. I am not an accountant, financial advisor, or in any way qualified to discuss investments.
1. The $PENSION_PROVIDER web interface doesn't seem to have anywhere that displays your current investment ratios. Therefore, these must be specified in `config.json` using the `share` property of each element of `myFunds`. If no share is specified, it will be assumed that payments are split evenly between funds.
2. Similarly, there is no way to see historically how much has been paid into each fund. Currently, the assumption is made that all initial payments were split by the current configured ratios into each fund, and that these ratios and funds have never changed. If you do change investments, perhaps the easiest workaround is to simply delete or rename your `history.json`.
