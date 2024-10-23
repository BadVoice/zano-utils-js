import { ZanoAddressUtils } from '../src';
import { base58Decode, base58Encode } from '../src/core/base58';

const rawAddressBufferHex = 'c5 01 9f 5e 1f a9 36 30 d4 b2 81 b1 8b b6 7a 3d b7 9e 96 22 fc 70 3c c3 ad 4a 45 3a 82 e0 a3 6d 51 fa a3 f2 08 c8 f9 ba 49 ba b2 8e ed 62 b3 5b 0f 6b e0 a2 97 bc d8 5c 2f aa 1e b1 82 05 27 bc f7 e3 e2 38 1c d6';

function dataToEncodeFn(hexString: string): string {
  return hexString.split(' ')
    .map(byte => `\\x${byte}`)
    .join('');
}

function encodeToHex(hexString: string): string {
  return hexString
    .match(/.{1,2}/g)
    .map(byte => byte)
    .join('');
}

export function bufferToHex(buffer: Buffer): string {
  let combinedHexString = '';
  for (let i = 0; i < buffer.length; i++) {
    combinedHexString += buffer[i].toString(16).padStart(2, '0');
    if (i < buffer.length - 1) {
      combinedHexString += ' ';
    }
  }
  return combinedHexString;
}

export function makeBytes(data: string): Uint8Array {
  const byteArray: number[] = data.split('\\x').slice(1).map(byte => parseInt(byte, 16));
  return new Uint8Array(byteArray);
}

function testEncode(expected: string, data: string) {
  const byteData: Uint8Array = makeBytes(data);
  const result: string = base58Encode(byteData);
  console.log(`Expected: '${expected}', Received: '${result}', ByteData:`, byteData);
  console.assert(result === expected, `Expected ${expected} but got ${result}`);
}

function runTests() {
  testEncode('11', '\\x00');
  testEncode('111', '\\x00\\x00');
  testEncode('11111', '\\x00\\x00\\x00');
  testEncode('111111', '\\x00\\x00\\x00\\x00');
  testEncode('1111111', '\\x00\\x00\\x00\\x00\\x00');
  testEncode('111111111', '\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('1111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('11111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('1111111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('11111111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('1111111111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('11111111111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('111111111111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('11111111111111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('111111111111111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('1111111111111111111111', '\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00\\x00');
  testEncode('22222222222VtB5VXc', '\\x06\\x15\\x60\\x13\\x76\\x28\\x79\\xF7\\xFF\\xFF\\xFF\\xFF\\xFF');

  const expectedAddress = 'ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH';
  const dataToAddress: string = dataToEncodeFn(rawAddressBufferHex);
  testEncode(expectedAddress, dataToAddress);
}

function runTestEncodeAddress(address: string, viewPubKey: string, spendPubKey: string) {
  const zanoAddressUtils = new ZanoAddressUtils();
  const addressBufferHex: string = dataToEncodeFn(bufferToHex(base58Decode(address)));
  testEncode(
    'ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH',
    addressBufferHex,
  );

  const serializedViewKey: string = encodeToHex(Buffer.from(viewPubKey, 'hex').toString('hex'));

  if(serializedViewKey !== viewPubKey) {
    throw new Error('PubViewKey not matched.');
  }

  const serializedSpendKey: string = encodeToHex(Buffer.from(spendPubKey, 'hex').toString('hex'));

  if(serializedSpendKey !== spendPubKey) {
    throw new Error('PubSpendKey not matched.');
  }

  const encodedAddress: string = zanoAddressUtils.encodeAddress(197, 1, spendPubKey, viewPubKey);

  if(encodedAddress !== address) {
    throw new Error(`Encoded address not matched. Received ${encodedAddress}, Expected: ${address}`);
  }
}

void (async () => {
  runTests();
  runTestEncodeAddress(
    'ZxD5aoLDPTdcaRx4uCpyW4XiLfEXejepAVz8cSY2fwHNEiJNu6NmpBBDLGTJzCsUvn3acCVDVDPMV8yQXdPooAp338Se7AxeH',
    'a3f208c8f9ba49bab28eed62b35b0f6be0a297bcd85c2faa1eb1820527bcf7e3',
    '9f5e1fa93630d4b281b18bb67a3db79e9622fc703cc3ad4a453a82e0a36d51fa',
  );
})();
