"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fffb4 = exports.fffb3 = exports.fffb2 = exports.fffb1 = exports.sqrtm1 = exports.A = exports.ec = void 0;
const bn_js_1 = __importDefault(require("bn.js"));
const elliptic_1 = require("elliptic");
exports.ec = new elliptic_1.eddsa('ed25519');
const { red } = exports.ec.curve;
exports.A = new bn_js_1.default(486662, 10).toRed(red);
exports.sqrtm1 = new bn_js_1.default('547cdb7fb03e20f4d4b2ff66c2042858d0bce7f952d01b873b11e4d8b5f15f3d', 'hex').toRed(red);
exports.fffb1 = new bn_js_1.default('7e71fbefdad61b1720a9c53741fb19e3d19404a8b92a738d22a76975321c41ee', 'hex').toRed(red);
exports.fffb2 = new bn_js_1.default('32f9e1f5fba5d3096e2bae483fe9a041ae21fcb9fba908202d219b7c9f83650d', 'hex').toRed(red);
exports.fffb3 = new bn_js_1.default('1a43f3031067dbf926c0f4887ef7432eee46fc08a13f4a49853d1903b6b39186', 'hex').toRed(red);
exports.fffb4 = new bn_js_1.default('674a110d14c208efb89546403f0da2ed4024ff4ea5964229581b7d8717302c66', 'hex').toRed(red);
//# sourceMappingURL=crypto-data.js.map