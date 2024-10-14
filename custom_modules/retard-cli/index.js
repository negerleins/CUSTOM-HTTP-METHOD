'use strict';

/**
 * Module dependencies.
 */

const karenPrint = require("karen-print");

/**
 * RetardCLI class.
 */

class RetardCLI {
    #validate(expectedArgs) {
        return !(this.sargv.length < expectedArgs.length - 1);
    }

    constructor(req) {
        if (!(this instanceof RetardCLI)) return new RetardCLI(req);

        this.sargv = process.argv.slice(2);
    }

    new(args, callback, log) {
        const karen = new karenPrint();

        const validArgs = this.#validate(args);
        const argValues = Object.keys(args).reduce((acc, key) => {
            const value = this.sargv.shift();

            if (value !== undefined) {
                if (typeof value === 'string' && (value.toLowerCase() === 'true' || value.toLowerCase() === 'false')) {
                    acc[key] = value.toLowerCase() === 'true';  // Convert to boolean
                } else if (!isNaN(value) && value.trim() !== '') {
                    acc[key] = Number(value);  // Convert to number
                } else if (value.trim() !== '') {
                    acc[key] = value;  // Keep as string
                }
            } else {
                acc[key] = undefined;
            }

            return acc;
        }, {});

        karen.nag(args, argValues, log);

        callback(validArgs, argValues);
    }
}


/**
 * Module exports.
 */

module.exports = RetardCLI;

