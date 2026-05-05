import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { createNativeFile, readUriAsBase64 } from './nativeFile.js';

const ACCEPT_TO_MIME_TYPES = {
  '.csv': ['text/csv', 'text/comma-separated-values', 'application/csv'],
  '.zip': ['application/zip', 'application/x-zip-compressed'],
  'image/*': ['image/*'],
  'text/csv': ['text/csv'],
};

function getDocumentTypes(accept = '') {
  const tokens = String(accept)
    .split(',')
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return '*/*';
  }

  const types = tokens.flatMap((token) => ACCEPT_TO_MIME_TYPES[token] ?? [token]);
  return types.length === 1 ? types[0] : types;
}

function getPickedAsset(result, multiple) {
  if (result.canceled) {
    return multiple ? [] : null;
  }

  const assets = result.assets ?? [];
  const files = assets.map((asset) =>
    createNativeFile({
      name: asset.name ?? 'imported-file',
      type: asset.mimeType ?? '',
      uri: asset.uri,
    }),
  );

  return multiple ? files : files[0] ?? null;
}

export async function pickFile({ accept = '', multiple = false } = {}) {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple,
    type: getDocumentTypes(accept),
  });

  return getPickedAsset(result, multiple);
}

export async function downloadArchive(archive, fileName) {
  const base64 =
    typeof archive === 'string'
      ? archive
      : archive?.base64 ?? archive?.data ?? archive?.content ?? '';
  const outputUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(outputUri, base64, {
    encoding: FileSystem.EncodingType?.Base64 ?? 'base64',
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(outputUri, {
      mimeType: 'application/zip',
      UTI: 'com.pkware.zip-archive',
    });
  }

  return outputUri;
}

export async function readFileAsDataUrl(file) {
  if (!file || !file.type?.startsWith('image/') || !file.uri) {
    return null;
  }

  const base64 = await readUriAsBase64(file.uri);
  return `data:${file.type};base64,${base64}`;
}
