"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADDRESS_REGEX = exports.ADDRESS_LENGTH = exports.CHECKSUM_LENGTH = exports.VIEW_KEY_LENGTH = exports.SPEND_KEY_LENGTH = exports.FLAG_LENGTH = exports.TAG_LENGTH = void 0;
exports.TAG_LENGTH = 1;
exports.FLAG_LENGTH = 1;
exports.SPEND_KEY_LENGTH = 32;
exports.VIEW_KEY_LENGTH = 32;
exports.CHECKSUM_LENGTH = 4;
exports.ADDRESS_LENGTH = exports.TAG_LENGTH +
    exports.FLAG_LENGTH +
    exports.SPEND_KEY_LENGTH +
    exports.VIEW_KEY_LENGTH +
    exports.CHECKSUM_LENGTH;
exports.ADDRESS_REGEX = /^Z[a-zA-Z0-9]{96}$/;
//# sourceMappingURL=constants.js.map