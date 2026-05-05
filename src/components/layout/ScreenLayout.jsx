import { StyleSheet, useWindowDimensions, View } from 'react-native';

export function useCompactViewport() {
  return useWindowDimensions().width <= 480;
}

export function AppScreenShell({ children, shellStyle, screenStyle }) {
  const isCompactViewport = useCompactViewport();

  return (
    <View
      style={[
        screenLayoutStyles.appShell,
        isCompactViewport && screenLayoutStyles.appShellCompact,
        shellStyle,
      ]}
    >
      <View
        style={[
          screenLayoutStyles.phoneScreen,
          isCompactViewport && screenLayoutStyles.phoneScreenCompact,
          screenStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
}

export const screenLayoutStyles = StyleSheet.create({
  appShell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'var(--color-bg-app)',
    backgroundImage: 'var(--gradient-app-shell)',
  },
  appShellCompact: {
    height: '100%',
    padding: 0,
  },
  phoneScreen: {
    position: 'relative',
    width: '100%',
    maxWidth: 390,
    height: '100%',
    maxHeight: 844,
    backgroundColor: 'var(--color-bg-screen)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-screen)',
  },
  phoneScreenCompact: {
    width: '100%',
    height: '100%',
    boxShadow: 'none',
  },
  screenColumn: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--color-bg-screen)',
  },
  title: {
    margin: 0,
    paddingTop: 77,
    paddingHorizontal: 18,
    color: 'var(--slate-700)',
    fontSize: 26,
    lineHeight: 33.8,
    fontWeight: '600',
    letterSpacing: -0.78,
  },
  subpageTitle: {
    paddingTop: 77,
  },
});
