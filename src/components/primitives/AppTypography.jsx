import { forwardRef } from 'react';
import { StyleSheet, Text as ReactNativeText, TextInput as ReactNativeTextInput } from 'react-native';

export const APP_FONT_FAMILY = 'Pretendard GOV';

export const AppText = forwardRef(function AppText({ style, ...props }, ref) {
  return <ReactNativeText ref={ref} style={[styles.text, style]} {...props} />;
});

export const AppTextInput = forwardRef(function AppTextInput({ style, ...props }, ref) {
  return <ReactNativeTextInput ref={ref} style={[styles.textInput, style]} {...props} />;
});

const styles = StyleSheet.create({
  text: {
    fontFamily: APP_FONT_FAMILY,
  },
  textInput: {
    fontFamily: APP_FONT_FAMILY,
  },
});
