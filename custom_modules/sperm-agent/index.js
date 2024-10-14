'use strict';

/**
 * Module dependencies.
 */

// None.

/**
 * SpermAgent class.
 */

class SpermAgent {
    #randomVersion(min, max) {
        return (Math.random() * (max - min) + min).toFixed(1);
    }
    
    #getRandomElement(arr) {
        return arr[(Math.random() * arr.length) | 0];
    }

    #generate() {
        const platform = this.#getRandomElement(this.platforms);
        const architecture = this.#getRandomElement(this.architectures);
        const engine = this.#getRandomElement(this.engines);
        const engineVersion = this.#randomVersion(engine.minVersion, engine.maxVersion);
        const browser = this.#getRandomElement(this.browsers);
        const browserVersion = this.#randomVersion(browser.minVersion, browser.maxVersion);
        const safariVersion = this.#getRandomElement(this.safariVersions);

        return `Mozilla/5.0 (${platform}; ${architecture}) ${engine.name}/${engineVersion} (KHTML, like Gecko) ${browser.name}/${browserVersion} Safari/${safariVersion}`;
    }

    constructor(req) {
        if (!(this instanceof SpermAgent)) return new SpermAgent(req);

        this.platforms = [
            "Windows NT 10.0", "Windows NT 6.1", "Windows NT 6.3", "X11; Linux x86_64",
            "Macintosh; Intel Mac OS X 10_" + this.#randomVersion(8, 15),
            "iPhone; CPU iPhone OS " + this.#randomVersion(12, 15) + " like Mac OS X",
            "Linux; Android " + this.#randomVersion(4, 12),
            "iPad; CPU OS " + this.#randomVersion(10, 15) + " like Mac OS X"
        ];

        this.architectures = [
            "Win64; x64", "x86_64", "ARM", "WOW64", "KFASWI Build/KTU84M",
            "Mobile/15E148", "Tablet/12H321"
        ];

        this.engines = [
            { name: "AppleWebKit", minVersion: 534, maxVersion: 605 },
            { name: "Gecko", minVersion: 60, maxVersion: 90 }
        ];

        this.browsers = [
            { name: "Chrome", minVersion: 50, maxVersion: 115 },
            { name: "Firefox", minVersion: 40, maxVersion: 120 },
            { name: "Safari", minVersion: 10, maxVersion: 16 },
            { name: "Opera", minVersion: 30, maxVersion: 90 },
            { name: "Edge", minVersion: 80, maxVersion: 115 },
            { name: "SamsungBrowser", minVersion: 7, maxVersion: 18 },
            { name: "Silk", minVersion: 3, maxVersion: 70 }
        ];

        this.safariVersions = [
            "537.36", "600.1.4", "605.1.15", "534.30"
        ];
    }

    birth(a = 1) {
        const userAgents = new Array(a); // Pre-allocate array to avoid resizing

        for (let i = 0; i < a; i++) {
            userAgents[i] = this.#generate(); // Directly assign to the array index
        }

        return userAgents;
    }
}

/**
 * Module exports.
 */

module.exports = SpermAgent;