import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS, SIZES } from '../theme/theme';

export const Card = ({ children, style, onPress, noPadding }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card, 
        noPadding && { padding: 0 },
        style
      ]}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOWS.soft,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
});
