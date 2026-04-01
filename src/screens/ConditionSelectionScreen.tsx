import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton, ScreenContainer } from '../components';
import { RootStackParamList } from '../navigation/types';
import { colors, radii, spacing, typography } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'ConditionSelection'>;

interface ConditionOption {
  id: string;
  label: string;
  description: string;
}

const CONDITION_OPTIONS: ConditionOption[] = [
  {
    id: 'c-acne',
    label: 'Acné',
    description: 'Espinillas, puntos negros o granos inflamados.',
  },
  {
    id: 'c-dermatitis',
    label: 'Dermatitis',
    description: 'Zonas con descamación, picor o eccema.',
  },
  {
    id: 'c-rosacea',
    label: 'Rosácea / Enrojecimiento',
    description: 'Rojeces difusas o capilares visibles en mejillas.',
  },
  {
    id: 'c-pigment',
    label: 'Manchas / Hiperpigmentación',
    description: 'Zonas oscurecidas por el sol o marcas previas.',
  },
  {
    id: 'c-pores',
    label: 'Poros dilatados',
    description: 'Textura irregular y poros abiertos en zona T.',
  },
  {
    id: 'c-lines',
    label: 'Líneas de expresión',
    description: 'Pequeñas arrugas en frente o contorno de ojos.',
  },
];

export function ConditionSelectionScreen({ navigation }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleContinue = () => {
    navigation.navigate('Processing', { selectedConditionIds: selectedIds });
  };

  const renderItem = ({ item }: { item: ConditionOption }) => {
    const isSelected = selectedIds.includes(item.id);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => toggleSelection(item.id)}
        style={[styles.optionCard, isSelected && styles.optionCardSelected]}
      >
        <View style={styles.optionContent}>
          <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
            {item.label}
          </Text>
          <Text style={styles.optionDescription}>{item.description}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <View style={styles.checkboxInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Evaluación del especialista</Text>
        <Text style={styles.subtitle}>
          Selecciona las afecciones observadas en el paciente para generar el informe y las recomendaciones.
        </Text>
      </View>

      <FlatList
        data={CONDITION_OPTIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <PrimaryButton
          label={selectedIds.length > 0 ? `Analizar ${selectedIds.length} hallazgos` : 'Continuar con análisis general'}
          onPress={handleContinue}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.display,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  optionCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionLabel: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: 2,
  },
  optionLabelSelected: {
    color: colors.primary,
    fontWeight: '700',
  },
  optionDescription: {
    ...typography.caption,
    color: colors.textMuted,
    lineHeight: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: colors.surface,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  hint: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
