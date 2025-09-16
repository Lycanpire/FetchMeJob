"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomInt = void 0;
const randomInt = (min, max) => {
    if (max <= min)
        return min;
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
exports.randomInt = randomInt;
