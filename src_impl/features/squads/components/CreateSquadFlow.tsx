import React, { useEffect, useState } from 'react';
import { Share, View } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { z } from 'zod';

import { Input } from '../../../components/Input';
import { Button } from '../../../components/primitives/Button';
import { Text } from '../../../components/primitives/Text';
import { useTheme } from '../../../theme';
import { useCreateSquad } from '../hooks';
import { buildPreviewSquad, createSquadSchema, ELEMENTS, SQUAD_TYPES, toCreatedSquadSummary, type ElementId, type SquadType } from './createSquadFlowData';
import { SquadShareCard } from './SquadShareCard';
type Step = 1 | 2 | 3;

type CreateSquadFlowProps = {
  bottomSheetRef: React.RefObject<BottomSheet | null>;
  userId: string;
};

export function CreateSquadFlow({ bottomSheetRef, userId }: CreateSquadFlowProps): JSX.Element {
  const { theme } = useTheme();
  const createSquad = useCreateSquad(userId);
  const [step, setStep] = useState<Step>(1);
  const [name, setName] = useState('');
  const [elementId, setElementId] = useState<ElementId>('FLAME');
  const [squadType, setSquadType] = useState<SquadType>('STUDY');
  const [formError, setFormError] = useState<string | null>(null);

  const selectedElement = ELEMENTS.find((item) => item.id === elementId) ?? ELEMENTS[0];
  const createdSquad = createSquad.data ? toCreatedSquadSummary(createSquad.data) : null;
  const previewSquad = createdSquad ?? buildPreviewSquad(name, selectedElement.hue);

  useEffect(() => {
    if (!createSquad.isSuccess) {
      return;
    }
    setStep(3);
    setFormError(null);
  }, [createSquad.isSuccess]);

  const handleContinue = async () => {
    try {
      setFormError(null);
      if (step === 1) {
        createSquadSchema.pick({ name: true, elementId: true }).parse({ name, elementId });
        setStep(2);
        return;
      }
      createSquadSchema.parse({ name, elementId, squadType });
      await createSquad.mutateAsync({
        name: name.trim(),
        description: `${selectedElement.emoji} ${squadType} squad`,
        avatarUrl: null,
        isPublic: true,
        joinRequirements: 'OPEN',
        maxMembers: 10,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        setFormError(error.issues[0]?.message ?? 'Please complete this step before continuing.');
      }
    }
  };

  const handleShare = async () => {
    if (!createdSquad) {
      return;
    }
    const squadCode = createdSquad.id.slice(0, 8);
    await Share.share({
      message: `My squad ${createdSquad.name} is live on VEX. Join us 👊 https://vex.app/squad/${squadCode}`,
      url: `https://vex.app/squad/${squadCode}`,
    });
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['90%']}
      enablePanDownToClose
      backdropComponent={(props) => <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} />}
      backgroundStyle={{
        backgroundColor: theme.colors.background.secondary,
        borderWidth: 1,
        borderColor: theme.colors.border.light,
      }}
      handleIndicatorStyle={{ backgroundColor: theme.colors.text.tertiary }}
    >
      <View style={{ flex: 1, padding: theme.spacing[5], gap: theme.spacing[4] }}>
        <View style={{ gap: theme.spacing[1] }}>
          <Text variant="label" color={theme.colors.primary[500]}>
            {`Step ${step} of 3`}
          </Text>
          <Text variant="h3" color={theme.colors.text.primary}>
            {step === 1 ? 'Forge your squad' : step === 2 ? 'Choose its lane' : 'Squad created!'}
          </Text>
        </View>

        {step === 1 ? (
          <View style={{ gap: theme.spacing[4] }}>
            <Input label="Squad name" value={name} onChangeText={setName} placeholder="Night Shift Legends" autoCapitalize="words" autoCorrect={false} />
            <View style={{ gap: theme.spacing[2] }}>
              <Text variant="label" color={theme.colors.text.secondary}>
                Choose your element
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
                {ELEMENTS.map((element) => (
                  <Button key={element.id} variant={elementId === element.id ? 'primary' : 'secondary'} onPress={() => setElementId(element.id)} accessibilityLabel="$ `} button" accessibilityRole="button" accessibilityHint="Activates this control">
                    {`${element.label} ${element.emoji}`}
                  </Button>
                ))}
              </View>
            </View>
            <View style={{ alignItems: 'center' }}>
              <SquadShareCard squad={previewSquad} weeklyStats={{ totalSessions: 0, totalFocusMinutes: 0, activeMemberCount: 0 }} />
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={{ gap: theme.spacing[4] }}>
            <Text variant="bodySmall" color={theme.colors.text.secondary}>
              Pick the vibe your recruits should immediately feel.
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
              {SQUAD_TYPES.map((type) => (
                <Button key={type} variant={squadType === type ? 'primary' : 'secondary'} onPress={() => setSquadType(type)} accessibilityLabel="Action button" accessibilityRole="button" accessibilityHint="Activates this control">
                  {type}
                </Button>
              ))}
            </View>
          </View>
        ) : null}

        {step === 3 && createdSquad ? (
          <View style={{ gap: theme.spacing[4] }}>
            <Text variant="bodySmall" color={theme.colors.text.secondary}>
              Share to recruit members and turn this week into your squad&apos;s first streak.
            </Text>
            <View style={{ alignItems: 'center' }}>
              <SquadShareCard squad={createdSquad} weeklyStats={{ totalSessions: 0, totalFocusMinutes: 0, activeMemberCount: 0 }} />
            </View>
            <Button onPress={() => void handleShare()} accessibilityLabel="Share to recruit members button" accessibilityRole="button" accessibilityHint="Activates this control">
              Share to recruit members
            </Button>
          </View>
        ) : null}

        {formError ? (
          <Text variant="bodySmall" color={theme.colors.error.DEFAULT}>
            {formError}
          </Text>
        ) : null}
        {createSquad.error instanceof Error ? (
          <Text variant="bodySmall" color={theme.colors.error.DEFAULT}>
            {createSquad.error.message}
          </Text>
        ) : null}

        <View style={{ flexDirection: 'row', gap: theme.spacing[3] }}>
          {step < 3 ? (
            <Button variant="ghost" onPress={step === 1 ? () => bottomSheetRef.current?.close() : () => setStep(1)} accessibilityLabel="Action button" accessibilityRole="button" accessibilityHint="Activates this control">
              {step === 1 ? 'Close' : 'Back'}
            </Button>
          ) : null}
          <Button onPress={step < 3 ? () => void handleContinue() : () => bottomSheetRef.current?.close()} isLoading={createSquad.isPending} accessibilityLabel="Action button" accessibilityRole="button" accessibilityHint="Activates this control">
            {step === 1 ? 'Continue' : step === 2 ? 'Create squad' : 'Done'}
          </Button>
        </View>
      </View>
    </BottomSheet>
  );
}
