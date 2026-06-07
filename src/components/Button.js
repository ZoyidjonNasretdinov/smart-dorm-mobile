import React from 'react';
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, SIZES, SHADOWS } from '../theme/theme';

export const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  loading = false, 
  style, 
  textStyle,
  icon: Icon
}) => {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  
  return (
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onPress}
      disabled={loading}
      style={[
        styles.button,
        isOutline && styles.buttonOutline,
        isGhost && styles.buttonGhost,
        variant === 'danger' && styles.buttonDanger,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? COLORS.primary : COLORS.white} />
      ) : (
        <>
          {Icon && <Icon size={20} color={isOutline || isGhost ? COLORS.primary : COLORS.white} style={{ marginRight: 8 }} />}
          <Text style={[
            styles.text,
            isOutline && styles.textOutline,
            isGhost && styles.textGhost,
            textStyle
          ]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    height: 52,
    borderRadius: SIZES.radius,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    ...SHADOWS.soft,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonGhost: {
    backgroundColor: 'transparent',
    elevation: 0,
    shadowOpacity: 0,
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
  },
  text: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  textOutline: {
    color: COLORS.primary,
  },
  textGhost: {
    color: COLORS.primary,
  },
});
