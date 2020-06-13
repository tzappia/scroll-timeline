const promise = require("selenium-webdriver");
const webdriver = require("selenium-webdriver");
const path = require("path");
const {browsers} = require("../tests.config.json");

const driversBinaries = {
    // TODO: selenium-webdriver package does not know Edge can run on Mac yet, driver for Mac in the path below is valid.
    // Error: The WebDriver for Edge could not be found on the current PATH. Please download the latest version of MicrosoftWebDriver.exe
    "edge": path.join(__dirname, '../local-drivers/mac/msedgedriver'),
    "chrome": path.join(__dirname, '../local-drivers/mac/chromedriver')
}

promise.USE_PROMISE_MANAGER = false;

function createSeleniumDrivers ({sauceName, sauceKey, tunnelId, testEnv}) {
    let drivers = new Map();
    if (testEnv !== 'sauce') {
        browsers.local.forEach(browser => {
            let browserConfig = require("selenium-webdriver/" + browser);
            browserConfig.setDefaultService(new browserConfig.ServiceBuilder(driversBinaries[browser]).build());
            drivers.set(browser, new webdriver.Builder().forBrowser(browser).withCapabilities(webdriver.Capabilities[browser]()))
        })
        return drivers;
    }
    Object.keys(browsers.sauce).forEach(browser => {
        let currentBrowser = browsers.sauce[browser];
        drivers.set(browser, new webdriver.Builder()
            .withCapabilities({
                browserName: currentBrowser.browserName,
                platformName: currentBrowser.platformName,
                browserVersion: currentBrowser.browserVersion,
                "sauce:options": {
                    username: sauceName,
                    accessKey: sauceKey,
                    build: `WPT Harness Tests for ScrollTimeline ${currentBrowser.browserName} : ${currentBrowser.browserVersion} for ${currentBrowser.platformName}`,
                    name: "WPT Harness Tests for ScrollTimeline",
                    maxDuration: 3600,
                    idleTimeout: 1000,
                    tags: ["scroll-animations", "polyfill", "scroll-timeline", "wpt-harness-tests", "mocha"],
                    'tunnelIdentifier': tunnelId
                },
            })
            .usingServer("https://ondemand.saucelabs.com/wd/hub")
        )
    });
    return drivers;
}

module.exports = createSeleniumDrivers