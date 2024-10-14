/**
 * Module dependencies.
 */

//

/**
 * Module exports.
 */

module.exports = SpermAgent;

function SpermAgent(req) {
    if (!(this instanceof SpermAgent))
        return new SpermAgent(req);
}

/**
 * Decrease number.
 *
 * @param {number} number
 * @return {number}
 * @api public
 */

SpermAgent.birth = function (number) {
    --number;
    return number;
}