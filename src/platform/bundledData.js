import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

import { loadBundledDatabaseStateFromFiles } from '../domain/importExport/bundledData.js';
import { createImportError } from '../domain/importExport/shared.js';
import { createNativeFile } from './nativeFile.js';

export const DEFAULT_BUNDLED_FILES = {
  ship: {
    asset: require('../../ship.csv'),
    name: 'ship.csv',
    type: 'text/csv',
  },
  images: {
    asset: require('../../images.zip'),
    name: 'images.zip',
    type: 'application/zip',
  },
  noImage: {
    asset: require('../../no-image.svg'),
    name: 'no-image.svg',
    type: 'image/svg+xml',
  },
};

async function resolveBundledAsset(file) {
  const asset = Asset.fromModule(file.asset);
  await asset.downloadAsync();

  const uri = asset.localUri ?? asset.uri;

  if (!uri) {
    throw createImportError(`${file.name} 기본 파일을 불러오지 못했어요.`);
  }

  return {
    ...file,
    uri,
  };
}

async function createBundledFile(file) {
  const resolvedAsset = await resolveBundledAsset(file);

  return createNativeFile({
    name: resolvedAsset.name,
    type: resolvedAsset.type,
    uri: resolvedAsset.uri,
  });
}

export async function loadBundledNoImageSvg(files = DEFAULT_BUNDLED_FILES) {
  const resolvedAsset = await resolveBundledAsset(files.noImage);
  return FileSystem.readAsStringAsync(resolvedAsset.uri);
}

export async function loadBundledDatabaseState(files = DEFAULT_BUNDLED_FILES) {
  const [shipFile, imagesFile] = await Promise.all([
    createBundledFile(files.ship),
    createBundledFile(files.images),
    loadBundledNoImageSvg(files),
  ]);

  return loadBundledDatabaseStateFromFiles({ imagesFile, shipFile });
}
