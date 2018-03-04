const puppeteer = require('puppeteer');
const fs = require('fs');
const Table = require('cli-table2');
const browserify = require('browserify');

const store = require('./store.js');

// Ensure that unhandled rejections aren't just ignored
process.on('unhandledRejection', up => { console.log(up.stack || up); });

function parseDisplayNumber(dispNum) {
    return parseFloat(dispNum.replace(/[£,]|\s/g, ""));
}

async function main() {
    const config = JSON.parse(fs.readFileSync('./conf.json', 'utf8'));

    let histP = store.load();

    const browser = await puppeteer.launch({
        headless: false,
    });

    let page = await browser.newPage();

    await page.goto('https://www.direct.aviva.co.uk/MyAccount/login');

    await page.waitForSelector('#username', {visible: true, timeout: 5000});

    await page.type('#username', config.username);
    await page.type('#password', config.password);

    await page.click('#loginButton');

    await page.waitForSelector('div.icon-pension', {visible: true, timeout: 15001});

    await page.waitFor(2003);

    await page.click('div.icon-pension');

    await page.waitForSelector('div.icon-pension div.completePolicyDetails', {visible: true, timeout: 15002});

    let navWait = page.waitForNavigation();

    await page.click('div.icon-pension div.completePolicyDetails a[href*="ViewDetail"]');

    await navWait;

    console.log('Ready to fetch details');

    let summarytable = await page.$('#featureTable');

    let regPayment = await page.evaluate(table => table.querySelector('tr.grossSummary td').textContent, summarytable);

    let totalPaid = await page.evaluate(table => table.querySelector('#totalPaymentsLabel').textContent, summarytable);

    let totalValue = await page.evaluate(table => table.querySelector('tr.totalValue td').textContent, summarytable);

    let summary = {
        regPayment: parseDisplayNumber(regPayment),
        paid: parseDisplayNumber(totalPaid),
        value: parseDisplayNumber(totalValue),
    }

    let growth = summary.value / summary.paid;

    console.log(`Reg payment: ${regPayment} Paid: ${totalPaid} Value: ${totalValue} Growth: ${growth * 100 - 1}%`);

    // Grabs the fund breakdown
    let rawFundBreakdown = await page.$$eval('section.investmentOption article.fund', funds => {
        console.log("toplevel");
        console.log(funds.length);
        return Array.from(funds).map(fund => {
            let fundName = fund.querySelector('h4.fundName a').textContent;
            return Array.from(fund.querySelectorAll('table.fundTable tr th')).map(fth => {
                console.log("innermost");
                console.log(fth.outerHTML);
                return { fund: fundName, header: fth.textContent, value: fth.nextElementSibling.textContent };
            })
        });
    })

    console.dir(rawFundBreakdown);

    // Interpret the human readable names and restructure the fund breakdown.
    let funds = {};
    rawFundBreakdown.forEach(rawFund => {
        let fund = {};
        rawFund.forEach(detail => {
            fund.name = detail.fund;
            if (/Units\s+Held/i.test(detail.header)) {
                fund.units = parseDisplayNumber(detail.value);
            } else if (/Unit\s+Price/i.test(detail.header)) {
                fund.price = parseDisplayNumber(detail.value);
            } else if (/Fund\s+value/i.test(detail.header)) {
                // This value is rounded to the nearest penny
                fund.value = parseDisplayNumber(detail.value);
            } else {
                console.warn(`Recovered an unrecognised value from the page: ${detail.header}`);
            }
        });

        fund.fullname = fund.name;

        let fundConfig = config.myFunds[fund.name];
        if (fundConfig) {
            fund.name = fundConfig.shortname || fund.name;
            fund.share = fundConfig.share || 1 / rawFund.length;
        }

        funds[fund.name] = fund;
    });

    console.dir(funds);

    console.log(JSON.stringify(funds));

    let hist = await histP;

    display(summary, funds);

    await store.store(hist, summary, funds);

    updateVis();

    await page.close();
    await browser.close();
}

function display(summary, funds) {
    let sTable = new Table({
        head: ['Paid In (£)', 'Current Value (£)', 'Growth (£)', 'Growth (%)', 'Regular Payments (£)'],
    })

    sTable.push(
        [summary.paid, summary.value, summary.value - summary.paid, ((summary.value / summary.paid) - 1) * 100, summary.regPayment]
    );

    let dTable = new Table({
        head: ['#', 'Units Held', 'Unit Price (£)', 'Value (£)', '% of Portfolio', '% Paid', 'Name'],
    })

    Object.entries(funds).forEach(([name, fund], i) => {
        let proportion = fund.value * 100 / summary.value;
        dTable.push(
            [i, fund.units, fund.price, fund.value, proportion, fund.share * 100, name]
        );
    })

    console.log(sTable.toString());
    console.log(dTable.toString());
}

function updateVis() {
    let b = browserify();
    b.add('./vis/vis.js');

    let bundleFile = fs.createWriteStream('./vis/vis.bundle.js');

    b.bundle().pipe(bundleFile);
}

main();