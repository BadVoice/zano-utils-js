"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ACCOUNT_KEY_REGEX = exports.PAYMENT_ID_REGEX = exports.BUFFER_INTEGRATED_ADDRESS_LENGTH = exports.ADDRESS_TAG_PREFIX = exports.ADDRESS_FLAG_PREFIX = exports.INTEGRATED_ADDRESS_TAG_PREFIX = exports.INTEGRATED_ADDRESS_FLAG_PREFIX = exports.PAYMENT_ID_LENGTH = exports.INTEGRATED_ADDRESS_REGEX = exports.ADDRESS_REGEX = exports.BUFFER_ADDRESS_LENGTH = exports.CHECKSUM_LENGTH = exports.VIEW_KEY_LENGTH = exports.SPEND_KEY_LENGTH = exports.FLAG_LENGTH = exports.TAG_LENGTH = void 0;
exports.TAG_LENGTH = 1;
exports.FLAG_LENGTH = 1;
exports.SPEND_KEY_LENGTH = 32;
exports.VIEW_KEY_LENGTH = 32;
exports.CHECKSUM_LENGTH = 4;
exports.BUFFER_ADDRESS_LENGTH = exports.TAG_LENGTH +
    exports.FLAG_LENGTH +
    exports.SPEND_KEY_LENGTH +
    exports.VIEW_KEY_LENGTH +
    exports.CHECKSUM_LENGTH;
exports.ADDRESS_REGEX = /^Z[a-zA-Z0-9]{96}$/;
exports.INTEGRATED_ADDRESS_REGEX = /^iZ[a-zA-Z0-9]{106}$/;
exports.PAYMENT_ID_LENGTH = 8;
exports.INTEGRATED_ADDRESS_FLAG_PREFIX = 0x6c;
exports.INTEGRATED_ADDRESS_TAG_PREFIX = 0xf8;
exports.ADDRESS_FLAG_PREFIX = 0x01;
exports.ADDRESS_TAG_PREFIX = 0xC5;
exports.BUFFER_INTEGRATED_ADDRESS_LENGTH = exports.BUFFER_ADDRESS_LENGTH +
    exports.PAYMENT_ID_LENGTH;
exports.PAYMENT_ID_REGEX = /^[a-fA-F0-9]{16}$/;
exports.ACCOUNT_KEY_REGEX = /^([0-9a-fA-F]{2})+$/;
//# sourceMappingURL=constants.js.map