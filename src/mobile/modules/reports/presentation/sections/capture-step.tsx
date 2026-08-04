import { CameraView, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { DimensionValue, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFonts as Fonts } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';

import { CaptureColors as C } from '../theme';
import { CaptureMedia, MediaPreview } from './media-preview';

type CaptureMode = 'picture' | 'video';

type CaptureStepProps = {
  onClose: () => void;
  onContinue: () => void;
  onMedia: (media: CaptureMedia) => void;
};

const MAX_DURATION_SECONDS = 60;

export function CaptureStep({ onClose, onContinue, onMedia }: CaptureStepProps) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<React.ComponentRef<typeof CameraView>>(null);
  const [facing, setFacing] = useState<'front' | 'back'>('back');
  const [flash, setFlash] = useState<'off' | 'on'>('off');
  const [mode, setMode] = useState<CaptureMode>('picture');
  const [media, setMedia] = useState<CaptureMedia | null>(null);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!recording) return;
    if (seconds >= MAX_DURATION_SECONDS) {
      cameraRef.current?.stopRecording();
      return;
    }
    const id = setTimeout(() => setSeconds((current) => current + 1), 1000);
    return () => clearTimeout(id);
  }, [recording, seconds]);

  const takePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
      if (photo?.uri) {
        const media: CaptureMedia = { type: 'photo', uri: photo.uri };
        setMedia(media);
        onMedia(media);
      }
    } catch {
      setMedia(null);
    }
  };

  const startRecording = async () => {
    if (!cameraRef.current) return;
    setRecording(true);
    setSeconds(0);
    try {
      const video = await cameraRef.current.recordAsync({ maxDuration: MAX_DURATION_SECONDS });
      if (video?.uri) {
        const media: CaptureMedia = { type: 'video', uri: video.uri };
        setMedia(media);
        onMedia(media);
      }
    } catch {
      setMedia(null);
    } finally {
      setRecording(false);
    }
  };

  const handleCapturePress = () => {
    if (mode === 'video') {
      if (recording) {
        cameraRef.current?.stopRecording();
      } else {
        startRecording();
      }
    } else {
      takePhoto();
    }
  };

  const handleModeChange = (next: CaptureMode) => {
    if (next === mode) return;
    if (recording) {
      cameraRef.current?.stopRecording();
    }
    setMode(next);
  };

  if (media != null && !recording) {
    return (
      <MediaPreview media={media} onRetake={() => setMedia(null)} onContinue={onContinue} onClose={onClose} />
    );
  }

  if (!permission) {
    return <View style={styles.screen} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionScreen}>
        <View style={styles.permissionCard}>
          <Text style={styles.permissionTitle}>Permiso de cámara</Text>
          <Text style={styles.permissionBody}>
            OceanEyes necesita acceso a la cámara para tomar la foto del reporte.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={requestPermission}
            style={({ pressed }) => [styles.permissionPrimary, pressed && styles.pressed]}>
            <Text style={styles.permissionPrimaryLabel}>Permitir acceso</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8} style={styles.permissionSecondary}>
            <Text style={styles.permissionSecondaryLabel}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const timerLabel = (value: number) => String(value).padStart(2, '0');
  const fillPercent = (Math.min(seconds, MAX_DURATION_SECONDS) / MAX_DURATION_SECONDS) * 100;

  const showTimer = mode === 'video';

  return (
    <View style={styles.screen}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        mode={mode}
        mute={true}
      />

      <View pointerEvents="none" style={styles.grid}>
        <View style={[styles.gridLineV, { left: '33.3%' }]} />
        <View style={[styles.gridLineV, { left: '66.6%' }]} />
        <View style={[styles.gridLineH, { top: '33.3%' }]} />
        <View style={[styles.gridLineH, { top: '66.6%' }]} />
      </View>

      <View style={[styles.topNav, { paddingTop: insets.top + 16 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
          onPress={onClose}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
          <AppSymbol name={{ ios: 'xmark', android: 'close', web: 'close' }} color={C.whiteText} size={20} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={flash === 'on' ? 'Desactivar destello' : 'Activar destello'}
          onPress={() => setFlash((current) => (current === 'off' ? 'on' : 'off'))}
          style={({ pressed }) => [styles.navButton, pressed && styles.pressed]}>
          <AppSymbol
            name={
              flash === 'on'
                ? { ios: 'bolt.fill', android: 'flash-on', web: 'flash-on' }
                : { ios: 'bolt.slash', android: 'flash-off', web: 'flash-off' }
            }
            color={C.whiteText}
            size={20}
          />
        </Pressable>
      </View>

      <LinearGradient
        colors={C.controlsGradient}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={[styles.controls, { paddingBottom: 40 + insets.bottom }]}
        pointerEvents="box-none">
        {showTimer ? (
          <View style={styles.timer}>
            <View style={styles.timerRow}>
              <View style={styles.timerBox}>
                <Text style={styles.timerValue}>{timerLabel(Math.floor(seconds / 60))}</Text>
              </View>
              <View style={styles.timerColon}>
                <Text style={styles.timerColonText}>:</Text>
              </View>
              <View style={styles.timerBox}>
                <Text style={styles.timerValue}>{timerLabel(seconds % 60)}</Text>
              </View>
            </View>
            <View style={styles.timerTrack}>
              <View style={[styles.timerFill, { width: `${fillPercent}%` as DimensionValue }]} />
            </View>
          </View>
        ) : (
          <View style={styles.slotSpacer} />
        )}

        <View style={styles.modeToggle}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'picture' }}
            onPress={() => handleModeChange('picture')}
            style={[styles.modeButton, mode === 'picture' && styles.modeButtonActive]}>
            <Text style={[styles.modeLabel, mode === 'picture' && styles.modeLabelActive]}>Foto</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: mode === 'video' }}
            onPress={() => handleModeChange('video')}
            style={[styles.modeButton, mode === 'video' && styles.modeButtonActive]}>
            <Text style={[styles.modeLabel, mode === 'video' && styles.modeLabelActive]}>Video</Text>
          </Pressable>
        </View>

        <View style={styles.captureRow}>
          <View style={styles.gallery}>
            <AppSymbol
              name={{ ios: 'photo.on.rectangle', android: 'collections', web: 'collections' }}
              color={C.whiteDim}
              size={22}
            />
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              recording ? 'Detener grabación' : mode === 'video' ? 'Grabar video' : 'Tomar foto'
            }
            onPress={handleCapturePress}
            style={({ pressed }) => [styles.shutter, pressed && styles.pressed]}>
            <View style={styles.shutterInner}>
              {mode === 'video' ? (
                recording ? (
                  <View style={styles.stopSquare} />
                ) : (
                  <View style={styles.recordDot} />
                )
              ) : null}
            </View>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cambiar cámara"
            onPress={() => setFacing((current) => (current === 'back' ? 'front' : 'back'))}
            style={({ pressed }) => [styles.flipButton, pressed && styles.pressed]}>
            <AppSymbol
              name={{ ios: 'arrow.triangle.2.circlepath', android: 'cameraswitch', web: 'cameraswitch' }}
              color={C.whiteText}
              size={24}
            />
          </Pressable>
        </View>
      </LinearGradient>

      <View pointerEvents="none" style={[styles.homeIndicator, { bottom: insets.bottom + 8 }]}>
        <View style={styles.homeBar} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  grid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: C.gridLine,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: C.gridLine,
  },
  topNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  navButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 9999,
  },
  banner: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
  },
  bannerChip: {
    width: '100%',
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: C.chipBg,
    borderWidth: 1,
    borderColor: C.chipBorder,
    borderRadius: 9999,
  },
  bannerTitle: {
    color: C.whiteText,
    fontFamily: Fonts.body,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  metadata: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  metadataPill: {
    width: '100%',
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: C.pillBg,
    borderRadius: 48,
  },
  metaGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  gpsDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.success,
  },
  metaText: {
    color: C.whiteText,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    includeFontPadding: false,
  },
  divider: {
    width: 1,
    height: 12,
    backgroundColor: C.divider,
  },
  metaAccent: {
    color: C.accent,
    fontFamily: Fonts.body,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  tagChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
  },
  tagText: {
    color: C.whiteFaint,
    fontFamily: Fonts.body,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 32,
  },
  slotSpacer: {
    height: 48,
  },
  timer: {
    alignItems: 'center',
    gap: 8,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timerBox: {
    width: 64,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accentSoft,
    borderWidth: 1,
    borderColor: C.accentBorder,
    borderRadius: 48,
  },
  timerValue: {
    color: C.accent,
    fontFamily: Fonts.body,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: -0.5,
    includeFontPadding: false,
  },
  timerColon: {
    width: 8,
    alignItems: 'center',
  },
  timerColonText: {
    color: C.accent,
    fontFamily: Fonts.body,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    includeFontPadding: false,
  },
  timerTrack: {
    width: 128,
    height: 6,
    backgroundColor: C.progressTrack,
    borderRadius: 9999,
    overflow: 'hidden',
  },
  timerFill: {
    height: 6,
    backgroundColor: C.accent,
    borderRadius: 9999,
  },
  modeToggle: {
    width: 192,
    height: 46,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    backgroundColor: C.pillBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 9999,
  },
  modeButton: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  modeButtonActive: {
    backgroundColor: C.accent,
  },
  modeLabel: {
    color: C.whiteDim,
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    textAlign: 'center',
    includeFontPadding: false,
  },
  modeLabelActive: {
    color: '#FFFFFF',
  },
  captureRow: {
    width: '100%',
    maxWidth: 384,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gallery: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.galleryBg,
    borderWidth: 2,
    borderColor: C.galleryBorder,
    borderRadius: 48,
    overflow: 'hidden',
  },
  shutter: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 5,
    borderColor: '#FFFFFF',
    borderRadius: 9999,
    backgroundColor: 'transparent',
  },
  shutterInner: {
    //Acá no pongan nada
  },
  recordDot: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    backgroundColor: C.record,
  },
  stopSquare: {
    width: 18,
    height: 18,
    borderRadius: 4,
    backgroundColor: C.record,
  },
  flipButton: {
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.flipBg,
    borderWidth: 1,
    borderColor: C.pillBorder,
    borderRadius: 9999,
  },
  homeIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  homeBar: {
    width: 128,
    height: 6,
    backgroundColor: C.homeIndicator,
    borderRadius: 9999,
  },
  pressed: {
    opacity: 0.78,
  },
  permissionScreen: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  permissionCard: {
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 32,
    paddingVertical: 40,
    paddingHorizontal: 28,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
  },
  permissionTitle: {
    color: '#2C2C2C',
    fontFamily: Fonts.headline,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    textAlign: 'center',
    includeFontPadding: false,
  },
  permissionBody: {
    color: 'rgba(44, 44, 44, 0.7)',
    fontFamily: Fonts.body,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    includeFontPadding: false,
  },
  permissionPrimary: {
    width: '100%',
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.accent,
    borderRadius: 24,
  },
  permissionPrimaryLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  permissionSecondary: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionSecondaryLabel: {
    color: '#6B7280',
    fontFamily: Fonts.body,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    includeFontPadding: false,
  },
});
