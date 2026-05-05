import * as FileSystem from 'expo-file-system';

function getBase64Encoding() {
  return FileSystem.EncodingType?.Base64 ?? 'base64';
}

export function base64ToUint8Array(base64) {
  const normalizedBase64 = String(base64 ?? '').replace(/\s/g, '');

  if (typeof globalThis.atob === 'function') {
    const binary = globalThis.atob(normalizedBase64);
    const bytes = new Uint8Array(binary.length);

    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }

    return bytes;
  }

  if (typeof globalThis.Buffer?.from === 'function') {
    return new Uint8Array(globalThis.Buffer.from(normalizedBase64, 'base64'));
  }

  throw new Error('Base64 decoding is not available in this native runtime.');
}

export function uint8ArrayToBase64(bytes) {
  if (typeof globalThis.btoa === 'function') {
    let binary = '';
    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }
    return globalThis.btoa(binary);
  }

  if (typeof globalThis.Buffer?.from === 'function') {
    return globalThis.Buffer.from(bytes).toString('base64');
  }

  throw new Error('Base64 encoding is not available in this native runtime.');
}

export async function readUriAsBase64(uri) {
  return FileSystem.readAsStringAsync(uri, {
    encoding: getBase64Encoding(),
  });
}

export async function readUriAsArrayBuffer(uri) {
  const bytes = base64ToUint8Array(await readUriAsBase64(uri));
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

export function createNativeFile({ name, type = '', uri }) {
  return {
    name,
    type,
    uri,
    async arrayBuffer() {
      return readUriAsArrayBuffer(uri);
    },
  };
}

export function createNativeFileFromBytes({ bytes, name, type = '' }) {
  const typedBytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);

  return {
    name,
    type,
    async arrayBuffer() {
      return typedBytes.buffer.slice(
        typedBytes.byteOffset,
        typedBytes.byteOffset + typedBytes.byteLength,
      );
    },
  };
}
