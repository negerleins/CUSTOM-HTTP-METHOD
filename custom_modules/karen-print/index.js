'use strict';

/**
 * Module dependencies.
 */

// None.

/**
 * karenPrint class.
 */

class karenPrint {
    #result(args, key, input) {
        const object = args[key];

        if (!object) {
            return `No validation rule for key: ${key} ${input}`;
        }
        
        return typeof input === object.type ? true : object.reply;
    }

    constructor(req) {
        if (!(this instanceof karenPrint)) return new karenPrint(req);
    }

    /**
     * Checks the provided arguments and logs the result if specified.
     *
     * @param {Object} args - The object of arguments to check.
     * @param {Object} argValues - The object of argument values to check.
     * @param {boolean} log - A flag indicating whether to log the result.
     */
    nag(args, argValues, log) {
        const results = Object.entries(argValues).map(([key, value]) => {
            const output = this.#result(args, key, value); 

            if (log && typeof output === 'string') {
                console.log(output);
            }
        
            return output; 
        });

        return results;
    }
}

/**
 * Module exports.
 */

module.exports = karenPrint;