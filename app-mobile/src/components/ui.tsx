import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewProps,
} from 'react-native';
import type { DimensionValue } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

type IconName = keyof typeof MaterialIcons.glyphMap;

export function Screen({ children, style }: ViewProps) {
  const { colors } = useTheme();
  return <View style={[styles.screen, { backgroundColor: colors.background }, style]}>{children}</View>;
}

export function LoadingState({ label = 'Carregando dados...' }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <Screen style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.stateText, { color: colors.text }]}>{label}</Text>
    </Screen>
  );
}

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: IconName;
  title: string;
  description: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.empty, { borderColor: colors.border }]}>
      <MaterialIcons name={icon} size={36} color={colors.primary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyDescription, { color: colors.muted }]}>{description}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Screen style={styles.center}>
      <MaterialIcons name="error-outline" size={40} color={colors.danger} />
      <Text style={[styles.stateText, { color: colors.text }]}>{message}</Text>
      {onRetry ? (
        <PrimaryButton label="Tentar novamente" icon="refresh" onPress={onRetry} variant="secondary" />
      ) : null}
    </Screen>
  );
}

export function PrimaryButton({
  label,
  icon,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...props
}: TouchableOpacityProps & {
  label: string;
  icon?: IconName;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}) {
  const { colors } = useTheme();
  const isSecondary = variant === 'secondary';
  const backgroundColor =
    variant === 'danger' ? colors.danger : isSecondary ? 'transparent' : colors.primary;
  const foreground = isSecondary ? colors.primary : '#FFFFFF';

  return (
    <TouchableOpacity
      {...props}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor: isSecondary ? colors.primary : backgroundColor,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={foreground} />
      ) : (
        <>
          {icon ? <MaterialIcons name={icon} size={20} color={foreground} /> : null}
          <Text style={[styles.buttonText, { color: foreground }]}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function MetricCard({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string | number;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <MaterialIcons name={icon} size={24} color={colors.primary} />
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
    </View>
  );
}

export function ProgressBar({ value }: { value: number }) {
  const { colors } = useTheme();
  const width = `${Math.max(0, Math.min(100, value))}%` as DimensionValue;

  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
      <View style={[styles.progressFill, { width, backgroundColor: colors.success }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  center: {
    alignItems: 'center',
    gap: 14,
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    fontSize: 16,
    textAlign: 'center',
  },
  empty: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  button: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  metricCard: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minWidth: '46%',
    padding: 14,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  progressTrack: {
    borderRadius: 999,
    height: 8,
    overflow: 'hidden',
  },
  progressFill: {
    borderRadius: 999,
    height: 8,
  },
});
