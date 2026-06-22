import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Modal, Pressable, ScrollView, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../../theme/ThemeContext';
import { Box } from '../../../components/primitives/Box'
import { Card } from '../../../components/primitives';
import { useUIStore } from '../../../store/index';

import {
  type CosmeticItem,
  type CosmeticType,
  RARITY_ORDER,
  CosmeticPreviewCard,
} from './CosmeticPreviewCard';
import {
  TYPE_CONFIG,
  CosmeticCategoryHeader,
  CosmeticEquipBar,
} from './CosmeticCategorySelector';
import { cosmeticEquipSheetStyles } from './cosmetic-equip-sheet-styles';

export type { CosmeticType, CosmeticItem } from './CosmeticPreviewCard';

interface CosmeticEquippingSheetProps {
  type: CosmeticType | null;
  items: CosmeticItem[];
  visible: boolean;
  onClose: () => void;
  onEquip: (itemId: string) => void;
  onPreview?: (item: CosmeticItem) => void;
  currentEquippedId?: string | null;
  style?: ViewStyle;
}

export const CosmeticEquippingSheet: React.FC<CosmeticEquippingSheetProps> = ({
  type,
  items,
  visible,
  onClose,
  onEquip,
  onPreview,
  currentEquippedId,
  style,
}) => {
  const { theme } = useTheme();
  const { showToast } = useUIStore();
  const [selectedId, setSelectedId] = useState<string | null>(currentEquippedId ?? null);
  const [isEquipping, setIsEquipping] = useState(false);
  const mountedRef = useRef(true);
  const slideUp = useSharedValue(0);
  const prevVisibleRef = useRef(visible);
  const prevEquippedIdRef = useRef(currentEquippedId);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  if (visible !== prevVisibleRef.current) {
    prevVisibleRef.current = visible;
    if (visible) {
      slideUp.value = withSpring(1, { damping: 15 });
      setSelectedId(currentEquippedId ?? null);
    } else {
      slideUp.value = 0;
      setSelectedId(null);
    }
  } else if (currentEquippedId !== prevEquippedIdRef.current && visible) {
    prevEquippedIdRef.current = currentEquippedId;
    setSelectedId(currentEquippedId ?? null);
  }
  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - slideUp.value) * 400 }],
  }));
  const handleItemPress = useCallback(
    (item: CosmeticItem) => {
      setSelectedId(item.id);
      onPreview?.(item);
    },
    [onPreview],
  );
  const handleEquip = useCallback(async () => {
    if (!selectedId) {
      return;
    }
    setIsEquipping(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!mountedRef.current) {
      return;
    }
    onEquip(selectedId);
    setIsEquipping(false);
    const item = items.find((i) => i.id === selectedId);
    showToast({
      message: `Equipped ${item?.name || 'item'}!`,
      type: 'success',
      duration: 2000,
    });
    onClose();
  }, [selectedId, onEquip, onClose, items, showToast]);
  const sortedItems = [...items].sort((a, b) => {
    if (a.isOwned && !b.isOwned) {
      return -1;
    }
    if (!a.isOwned && b.isOwned) {
      return 1;
    }
    const rarityDiff =
      RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity);
    if (rarityDiff !== 0) {
      return rarityDiff;
    }
    return a.name.localeCompare(b.name);
  });
  const ownedCount = items.filter((i) => i.isOwned).length;
  const config = type ? TYPE_CONFIG[type] : null;
  if (!config || !type) {
    return null;
  }
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Box flex={1} style={cosmeticEquipSheetStyles.overlay}>
        <Pressable
          style={{ flex: 1 }}
          onPress={onClose}
          accessibilityLabel="Cosmetic equip"
          accessibilityRole="button"
          accessibilityHint="Double tap to activate"
        />

        <Animated.View style={[modalStyle, style]}>
          <Card size="lg" style={cosmeticEquipSheetStyles.card}>
            {}
            <Box alignItems="center" mb={16}>
              <Box
                width={40}
                height={4}
                borderRadius={2}
                style={{ backgroundColor: theme.colors.border.DEFAULT }}
              />
            </Box>

            {}
            <CosmeticCategoryHeader
              type={type}
              ownedCount={ownedCount}
              onClose={onClose}
            />

            {}
            <ScrollView showsVerticalScrollIndicator={false}>
              <Box flexDirection="row" flexWrap="wrap" style={{ gap: 10 }}>
                {sortedItems.map((item) => (
                  <CosmeticPreviewCard
                    key={item.id}
                    item={item}
                    isSelected={selectedId === item.id}
                    isEquipped={item.isEquipped}
                    onPress={() => handleItemPress(item)}
                  />
                ))}
              </Box>

              {}
              <Box height={100} />
            </ScrollView>

            {}
            <CosmeticEquipBar
              selectedId={selectedId}
              currentEquippedId={currentEquippedId}
              isEquipping={isEquipping}
              onEquip={handleEquip}
            />
          </Card>
        </Animated.View>
      </Box>
    </Modal>
  );
};