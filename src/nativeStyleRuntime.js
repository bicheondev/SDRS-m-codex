import { StyleSheet } from 'react-native';

import { resolveThemeValue } from './theme.js';

const WEB_ONLY_STYLE_KEYS = new Set([
  'backdropFilter',
  'background',
  'backgroundImage',
  'backfaceVisibility',
  'boxShadow',
  'colorScheme',
  'cursor',
  'filter',
  'fontVariationSettings',
  'isolation',
  'maskImage',
  'msOverflowStyle',
  'outlineStyle',
  'overflowAnchor',
  'overflowX',
  'overflowY',
  'scrollPaddingTop',
  'scrollbarWidth',
  'textRendering',
  'touchAction',
  'transformOrigin',
  'transitionDuration',
  'transitionProperty',
  'transitionTimingFunction',
  'userSelect',
  'verticalAlign',
  'WebkitBackdropFilter',
  'WebkitBackfaceVisibility',
  'WebkitFontSmoothing',
  'WebkitMaskImage',
  'WebkitOverflowScrolling',
  'WebkitTapHighlightColor',
  'WebkitTextFillColor',
  'WebkitTouchCallout',
  'WebkitUserSelect',
  'whiteSpace',
  'willChange',
  'wordBreak',
]);

const LENGTH_FALLBACKS = new Map([
  ['100dvh', '100%'],
  ['100vh', '100%'],
  ['auto', undefined],
  ['inherit', undefined],
]);

function parseCssLength(value, propertyName) {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed.endsWith('px')) {
    const parsed = Number(trimmed.slice(0, -2));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (trimmed.startsWith('calc(') || trimmed.startsWith('env(')) {
    if (propertyName === 'height' || propertyName === 'marginBottom') {
      return 64;
    }

    if (propertyName === 'bottom') {
      return 52;
    }

    return 0;
  }

  if (trimmed.startsWith('min(')) {
    return propertyName === 'width' || propertyName === 'maxWidth' ? '100%' : undefined;
  }

  if (trimmed.startsWith('clamp(')) {
    return 16;
  }

  if (LENGTH_FALLBACKS.has(trimmed)) {
    return LENGTH_FALLBACKS.get(trimmed);
  }

  return value;
}

function sanitizeTransform(transform) {
  if (!Array.isArray(transform)) {
    return transform;
  }

  return transform
    .map((entry) => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const [[key, rawValue] = []] = Object.entries(entry);
      if (!key) {
        return null;
      }

      if (typeof rawValue === 'string') {
        const parsed = parseCssLength(rawValue, key);
        if (typeof parsed !== 'number') {
          return null;
        }

        return { [key]: parsed };
      }

      return entry;
    })
    .filter(Boolean);
}

function sanitizeStyle(style) {
  if (!style || typeof style !== 'object' || Array.isArray(style)) {
    return style;
  }

  const nextStyle = {};

  for (const [key, rawValue] of Object.entries(style)) {
    if (WEB_ONLY_STYLE_KEYS.has(key) || key.startsWith('--')) {
      continue;
    }

    if (rawValue === undefined) {
      continue;
    }

    if (key === 'position' && rawValue === 'fixed') {
      nextStyle[key] = 'absolute';
      continue;
    }

    if (key === 'display' && rawValue !== 'none' && rawValue !== 'flex') {
      nextStyle[key] = 'flex';
      continue;
    }

    if (key === 'transform') {
      const transform = sanitizeTransform(rawValue);
      if (transform?.length) {
        nextStyle[key] = transform;
      }
      continue;
    }

    const themedValue = resolveThemeValue(rawValue);
    const value =
      typeof themedValue === 'string' ? parseCssLength(themedValue, key) : themedValue;

    if (value !== undefined) {
      nextStyle[key] = value;
    }
  }

  return nextStyle;
}

function sanitizeStyles(styles) {
  if (!styles || typeof styles !== 'object') {
    return styles;
  }

  return Object.fromEntries(
    Object.entries(styles).map(([name, style]) => [name, sanitizeStyle(style)]),
  );
}

if (!StyleSheet.__sdrsNativePatched) {
  const create = StyleSheet.create.bind(StyleSheet);

  StyleSheet.create = (styles) => create(sanitizeStyles(styles));
  StyleSheet.__sdrsNativePatched = true;
}
