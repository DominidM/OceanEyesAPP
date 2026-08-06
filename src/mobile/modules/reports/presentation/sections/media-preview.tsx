import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import React, { useMemo } from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import { AppText } from '@/shared/components/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';

import { CaptureColors as C } from '../theme';

export type CaptureMedia = { type: 'photo' | 'video'; uri: string };

type MediaPreviewProps = {
  media: CaptureMedia;
  onRetake: () => void;
  onContinue: () => void;
  onClose: () => void;
};

export function MediaPreview({ media, onRetake, onContinue, onClose }: MediaPreviewProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.screen}>
      <View style={styles.mediaArea}>
        {media.type === 'photo' ? (
          <Image source={{ uri: media.uri }} style={styles.media} contentFit="cover" />
        ) : (
          <VideoPreview uri={media.uri} />
        )}
      </View>

      <LinearGradient
        colors={C.controlsGradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={styles.scrim}
        pointerEvents="none"
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cerrar"
        onPress={onClose}
        style={({ pressed }) => [styles.closeButton, { top: insets.top + 16 }, pressed && styles.pressed]}>
        <AppSymbol name={{ ios: 'xmark', android: 'close', web: 'close' }} color={C.whiteText} size={20} />
      </Pressable>

      <View style={[styles.bottomBar, { paddingBottom: 24 + insets.bottom }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rehacer"
          onPress={onRetake}
          style={({ pressed }) => [styles.retakeButton, pressed && styles.pressed]}>
          <AppSymbol
            name={{ ios: 'arrow.counterclockwise', android: 'replay', web: 'replay' }}
            color={C.whiteText}
            size={22}
          />
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
  closeButton: {
    position: 'absolute',
    left: 24,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
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
  retakeButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 9999,
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
