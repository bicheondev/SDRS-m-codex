import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import {
  getScreenMotionState,
  getScreenTransition,
  getScreenZIndex,
  hiddenScreenState,
  motionTokens,
  visibleScreenState,
} from '../../motion.js';
import { getWindowInnerWidth } from '../../platform/index.js';

function resolveTranslateX(value) {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string' && value.endsWith('%')) {
    const width = getWindowInnerWidth();
    const ratio = Number(value.slice(0, -1)) / 100;
    return Number.isFinite(ratio) ? width * ratio : 0;
  }

  return 0;
}

function setAnimatedState(animatedState, state) {
  animatedState.opacity.setValue(state.opacity ?? 1);
  animatedState.translateX.setValue(resolveTranslateX(state.x));
  animatedState.translateY.setValue(typeof state.y === 'number' ? state.y : 0);
  animatedState.scale.setValue(state.scale ?? 1);
}

function getAnimatedEasing(ease) {
  if (!Array.isArray(ease) || ease.length !== 4) {
    return Easing.linear;
  }

  const [x1, y1, x2, y2] = ease;
  return Easing.bezier(x1, y1, x2, y2);
}

function getTransitionDuration(transition) {
  if (!transition || typeof transition.duration === 'number') {
    return Math.round((transition?.duration ?? motionTokens.duration.fast) * 1000);
  }

  return Math.round(
    Object.values(transition).reduce(
      (duration, current) => Math.max(duration, current?.duration ?? 0),
      motionTokens.duration.fast,
    ) * 1000,
  );
}

function getTransitionEasing(transition) {
  if (!transition || typeof transition.duration === 'number') {
    return getAnimatedEasing(transition?.ease ?? motionTokens.ease.ios);
  }

  return getAnimatedEasing(transition.x?.ease ?? transition.opacity?.ease ?? motionTokens.ease.ios);
}

function buildAnimation(animatedState, targetState, transition) {
  const duration = getTransitionDuration(transition);

  if (duration <= 0) {
    setAnimatedState(animatedState, targetState);
    return null;
  }

  const easing = getTransitionEasing(transition);

  return Animated.parallel(
    [
      Animated.timing(animatedState.opacity, {
        duration,
        easing,
        toValue: targetState.opacity ?? 1,
        useNativeDriver: true,
      }),
      Animated.timing(animatedState.translateX, {
        duration,
        easing,
        toValue: resolveTranslateX(targetState.x),
        useNativeDriver: true,
      }),
      Animated.timing(animatedState.translateY, {
        duration,
        easing,
        toValue: typeof targetState.y === 'number' ? targetState.y : 0,
        useNativeDriver: true,
      }),
      Animated.timing(animatedState.scale, {
        duration,
        easing,
        toValue: targetState.scale ?? 1,
        useNativeDriver: true,
      }),
    ],
    { stopTogether: true },
  );
}

export default function AnimatedScreen({
  children,
  currentScreen,
  navDir,
  reducedMotion = false,
  screenKey,
}) {
  const isActive = currentScreen === screenKey;
  const previousActiveRef = useRef(null);
  const animationRef = useRef(null);
  const frameRef = useRef(null);
  const animatedStateRef = useRef({
    opacity: new Animated.Value(isActive ? visibleScreenState.opacity : hiddenScreenState.opacity),
    translateX: new Animated.Value(0),
    translateY: new Animated.Value(isActive ? visibleScreenState.y : hiddenScreenState.y),
    scale: new Animated.Value(isActive ? visibleScreenState.scale : hiddenScreenState.scale),
  });
  const animatedState = animatedStateRef.current;
  const [isVisible, setIsVisible] = useState(isActive);
  const [zIndex, setZIndex] = useState(isActive ? 1 : 0);

  useEffect(
    () => () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }

      animationRef.current?.stop?.();
    },
    [],
  );

  useLayoutEffect(() => {
    let cancelled = false;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    animationRef.current?.stop?.();
    animationRef.current = null;

    if (previousActiveRef.current === null) {
      previousActiveRef.current = isActive;
      setAnimatedState(animatedState, isActive ? visibleScreenState : hiddenScreenState);
      setIsVisible(isActive);
      setZIndex(isActive ? 1 : 0);
      return undefined;
    }

    if (previousActiveRef.current === isActive) {
      return undefined;
    }

    previousActiveRef.current = isActive;

    if (isActive) {
      const enterState = getScreenMotionState(navDir, 'enter', reducedMotion);
      const transition = getScreenTransition(navDir, reducedMotion, 'enter');

      setIsVisible(true);
      setZIndex(getScreenZIndex(navDir, true));
      setAnimatedState(animatedState, enterState);

      frameRef.current = requestAnimationFrame(() => {
        frameRef.current = null;

        if (cancelled) {
          return;
        }

        const animation = buildAnimation(animatedState, visibleScreenState, transition);

        if (!animation) {
          setZIndex(1);
          return;
        }

        animationRef.current = animation;
        animation.start(({ finished }) => {
          animationRef.current = null;

          if (!finished || cancelled) {
            return;
          }

          setAnimatedState(animatedState, visibleScreenState);
          setZIndex(1);
        });
      });
    } else {
      const exitState = getScreenMotionState(navDir, 'exit', reducedMotion);
      const transition = getScreenTransition(navDir, reducedMotion, 'exit');

      setZIndex(getScreenZIndex(navDir, false));

      const animation = buildAnimation(animatedState, exitState, transition);

      if (!animation) {
        setAnimatedState(animatedState, hiddenScreenState);
        setIsVisible(false);
        setZIndex(0);
        return undefined;
      }

      animationRef.current = animation;
      animation.start(({ finished }) => {
        animationRef.current = null;

        if (!finished || cancelled) {
          return;
        }

        setAnimatedState(animatedState, hiddenScreenState);
        setIsVisible(false);
        setZIndex(0);
      });
    }

    return () => {
      cancelled = true;

      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      animationRef.current?.stop?.();
      animationRef.current = null;
    };
  }, [animatedState, isActive, navDir, reducedMotion]);

  return (
    <Animated.View
      pointerEvents={isActive ? 'auto' : 'none'}
      style={[
        styles.screen,
        !isVisible && styles.screenHidden,
        {
          zIndex,
          opacity: animatedState.opacity,
          transform: [
            { translateX: animatedState.translateX },
            { translateY: animatedState.translateY },
            { scale: animatedState.scale },
          ],
        },
      ]}
    >
      <View style={styles.overlay} pointerEvents="none" />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    overflow: 'hidden',
  },
  screenHidden: {
    opacity: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
});
