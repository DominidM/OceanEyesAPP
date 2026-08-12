import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useMemo } from 'react';
import {Pressable, ScrollView, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';

import { CaptureColors as C } from '../theme';

export type CaptureMedia = { type: 'photo' | 'video'; uri: string };

type MediaPreviewProps = {
  media: CaptureMedia[];
  current: number;
  onSelect: (index: number) => void;
  onRemove: (index: number) => void;
  onAddMore: () => void;
  onContinue: () => void;
  onClose: () => void;
};

export function MediaPreview({
  media,
  current,
  onSelect,
  onRemove,
  onAddMore,
  onContinue,
  onClose,
}: MediaPreviewProps) {
  const insets = useSafeAreaInsets();
  const selected = media[current];

  return (
    <View style={styles.screen}>
      <View style={styles.mediaArea}>
        {selected ? (
          selected.type === 'photo' ? (
            <Image source={{ uri: selected.uri }} style={styles.media} contentFit="contain" />
          ) : (
            <VideoPreview uri={selected.uri} />
          )
        ) : null}
      </View>

      <LinearGradient
        colors={C.controlsGradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.scrim}
        pointerEvents="none"
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 16 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onClose}
          style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
          <AppSymbol name={{ ios: 'xmark', android: 'close', web: 'close' }} color={C.whiteText} size={20} />
        </Pressable>
        <AppText style={styles.counter}>
          {media.length > 0 ? `${current + 1} de ${media.length}` : ''}
        </AppText>
      </View>

      {media.length > 1 ? (
        <ScrollView
          horizontal
          style={styles.thumbnails}
          contentContainerStyle={styles.thumbnailsContent}
          showsHorizontalScrollIndicator={false}>
          {media.map((item, index) => (
            <View key={`${item.uri}-${index}`} style={styles.thumbWrap}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Ver medio ${index + 1}`}
                onPress={() => onSelect(index)}
                style={[styles.thumb, index === current && styles.thumbSelected]}>
                {item.type === 'photo' ? (
                  <Image source={{ uri: item.uri }} style={styles.thumbImage} contentFit="cover" />
                ) : (
                  <View style={styles.thumbVideo}>
                    <AppSymbol
                      name={{ ios: 'play.fill', android: 'play-arrow', web: 'play-arrow' }}
                      color={C.whiteText}
                      size={18}
                    />
                  </View>
                )}
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Quitar medio"
                onPress={() => onRemove(index)}
                style={styles.removeBadge}>
                <AppSymbol name={{ ios: 'xmark', android: 'close', web: 'close' }} color="#FFFFFF" size={10} />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View style={[styles.bottomBar, { paddingBottom: 24 + insets.bottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Agregar más"
          onPress={onAddMore}
          style={({ pressed }) => [styles.addMoreButton, pressed && styles.pressed]}>
          <AppSymbol
            name={{ ios: 'plus', android: 'add', web: 'add' }}
            color={C.whiteText}
            size={22}
          />
          <AppText style={styles.addMoreLabel}>Agregar</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={onContinue}
          style={({ pressed }) => [styles.continueButton, pressed && styles.pressed]}>
          <AppText style={styles.continueLabel}>Continuar</AppText>
        </Pressable>
      </View>
    </View>
  );
}

function VideoPreview({ uri }: { uri: string }) {
  const source = useMemo(() => ({ uri }), [uri]);
  const player = useVideoPlayer(source, (current) => {
    current.loop = true;
    current.play();
  });

  return <VideoView player={player} style={styles.media} contentFit="cover" nativeControls />;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#000000',
  },
  mediaArea: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  media: {
    flex: 1,
    width: '100%',
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 180,
  },
  topBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  closeButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 9999,
  },
  counter: {
    color: C.whiteText,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '700',
    includeFontPadding: false,
  },
  thumbnails: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 108,
    flexGrow: 0,
  },
  thumbnailsContent: {
    paddingHorizontal: 24,
    gap: 10,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  thumbSelected: {
    borderColor: C.accent,
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbVideo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  removeBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 9999,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  addMoreButton: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 9999,
  },
  addMoreLabel: {
    color: C.whiteText,
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '600',
    includeFontPadding: false,
  },
  continueButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
    backgroundColor: C.accent,
    borderRadius: 9999,
  },
  continueLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    includeFontPadding: false,
  },
  pressed: {
    opacity: 0.78,
  },
});