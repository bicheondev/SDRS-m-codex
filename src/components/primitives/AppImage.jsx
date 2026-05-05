import { Image, StyleSheet, View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { noImagePlaceholder, noImageSvgXml } from '../../assets/noImagePlaceholder.js';

function getSvgXmlFromDataUrl(uri) {
  const prefix = 'data:image/svg+xml';

  if (typeof uri !== 'string' || !uri.startsWith(prefix)) {
    return null;
  }

  const [, payload = ''] = uri.split(',');

  if (uri.includes(';base64,')) {
    return null;
  }

  try {
    return decodeURIComponent(payload);
  } catch {
    return payload;
  }
}

function resolveSvgXml(source) {
  if (source === noImagePlaceholder || source?.uri === noImagePlaceholder) {
    return noImageSvgXml;
  }

  if (typeof source === 'string') {
    return getSvgXmlFromDataUrl(source);
  }

  return getSvgXmlFromDataUrl(source?.uri);
}

function resolveImageSource(source) {
  if (!source || source === noImagePlaceholder) {
    return null;
  }

  if (typeof source === 'string') {
    return { uri: source };
  }

  return source;
}

export function AppImage({ accessibilityLabel, resizeMode = 'cover', source, style }) {
  const svgXml = resolveSvgXml(source);

  if (svgXml) {
    return (
      <View accessibilityLabel={accessibilityLabel} style={[styles.svgShell, style]}>
        <SvgXml height="100%" width="100%" xml={svgXml} />
      </View>
    );
  }

  const imageSource = resolveImageSource(source);

  if (!imageSource) {
    return (
      <View accessibilityLabel={accessibilityLabel} style={[styles.svgShell, style]}>
        <SvgXml height="100%" width="100%" xml={noImageSvgXml} />
      </View>
    );
  }

  return (
    <Image
      accessibilityLabel={accessibilityLabel}
      resizeMode={resizeMode}
      source={imageSource}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  svgShell: {
    overflow: 'hidden',
  },
});
