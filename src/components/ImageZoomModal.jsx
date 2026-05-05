import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon } from './Icons.jsx';
import { AppImage } from './primitives/AppImage.jsx';
import { InteractivePressable } from './primitives/InteractivePressable.jsx';
import { motionDurationsMs } from '../motion.js';

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export default function ImageZoomModal({ session, onClose }) {
  const insets = useSafeAreaInsets();
  const vessels = useMemo(
    () => (Array.isArray(session?.vessels) && session.vessels.length > 0 ? session.vessels : []),
    [session?.vessels],
  );
  const [currentIndex, setCurrentIndex] = useState(() =>
    clamp(session?.startIndex ?? 0, 0, Math.max(vessels.length - 1, 0)),
  );
  const opacityRef = useRef(new Animated.Value(0));
  const currentVessel = vessels[currentIndex] ?? vessels[0] ?? null;
  const canNavigate = vessels.length > 1;

  useEffect(() => {
    setCurrentIndex(clamp(session?.startIndex ?? 0, 0, Math.max(vessels.length - 1, 0)));
  }, [session?.startIndex, vessels.length]);

  useEffect(() => {
    const animation = Animated.timing(opacityRef.current, {
      duration: motionDurationsMs.image,
      toValue: 1,
      useNativeDriver: true,
    });

    animation.start();
    return () => animation.stop();
  }, []);

  const requestClose = useCallback(() => {
    Animated.timing(opacityRef.current, {
      duration: motionDurationsMs.fast,
      toValue: 0,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  }, [onClose]);

  const showPrevious = useCallback(() => {
    setCurrentIndex((index) => (index <= 0 ? vessels.length - 1 : index - 1));
  }, [vessels.length]);

  const showNext = useCallback(() => {
    setCurrentIndex((index) => (index >= vessels.length - 1 ? 0 : index + 1));
  }, [vessels.length]);

  if (!currentVessel) {
    return null;
  }

  return (
    <Modal animationType="none" transparent visible onRequestClose={requestClose}>
      <Animated.View style={[styles.modal, { opacity: opacityRef.current }]}>
        <Pressable accessibilityRole="button" onPress={requestClose} style={styles.backdrop} />

        <View
          style={[
            styles.frame,
            {
              paddingTop: Math.max(18, insets.top + 10),
              paddingBottom: Math.max(18, insets.bottom + 10),
            },
          ]}
        >
          <InteractivePressable
            accessibilityLabel="이미지 닫기"
            accessibilityRole="button"
            onPress={requestClose}
            pressGuideVariant="icon"
            style={styles.closeButton}
          >
            <AppIcon name="close" preset="modalClose" tone="on-accent" />
          </InteractivePressable>

          <View style={styles.imageWrap}>
            <AppImage
              accessibilityLabel={`${currentVessel.name} 이미지`}
              resizeMode="contain"
              source={currentVessel.imageWide}
              style={styles.image}
            />
          </View>

          {canNavigate ? (
            <View style={styles.navigation}>
              <InteractivePressable
                accessibilityLabel="이전 이미지"
                accessibilityRole="button"
                onPress={showPrevious}
                pressGuideVariant="icon"
                style={styles.navigationButton}
              >
                <AppIcon name="chevron_left" preset="disclosure" tone="on-accent" />
              </InteractivePressable>
              <InteractivePressable
                accessibilityLabel="다음 이미지"
                accessibilityRole="button"
                onPress={showNext}
                pressGuideVariant="icon"
                style={styles.navigationButton}
              >
                <AppIcon name="chevron_right" preset="disclosure" tone="on-accent" />
              </InteractivePressable>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  frame: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 2,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
  },
  imageWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  navigation: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    left: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navigationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
  },
});
