"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zano_account_utils_1 = require("./account/zano-account-utils");
void (async () => {
    const accUtils = new zano_account_utils_1.ZanoAccountUtils();
    const account = await accUtils.generateAccount();
    console.log(account);
})();
//# sourceMappingURL=test.js.map