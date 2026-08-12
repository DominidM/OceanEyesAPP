import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';

type ReportGalleryProps = {
  photoURLs: string[];
};

const THUMB_W = 52;
const THUMB_GAP = 8;

export function ReportGallery({ photoURLs }: ReportGalleryProps) {
  const { colors } = useAdminTheme();
  const [current, setCurrent] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const stripRef = useRef<ScrollView | null>(null);

  useEffect(() => {
    stripRef.current?.scrollTo({ x: current * (THUMB_W + THUMB_GAP), animated: true });
  }, [current]);

  if (!photoURLs || photoURLs.length === 0) return null;

  const count = photoURLs.length;
  const main = photoURLs[current];

  const go = (dir: 1 | -1) => {
    setCurrent((prev) => (prev + dir + count) % count);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mainBox}>
        <Image source={{ uri: main }} style={styles.mainImg} contentFit="contain" />
        {count > 1 && (
          <>
            <Pressable style={[styles.bigArrow, styles.bigArrowLeft]} onPress={() => go(-1)}>
              <MaterialCommunityIcons name="chevron-left" size={26} color="#FFFFFF" />
            </Pressable>
            <Pressable style={[styles.bigArrow, styles.bigArrowRight]} onPress={() => go(1)}>
              <MaterialCommunityIcons name="chevron-right" size={26} color="#FFFFFF" />
            </Pressable>
          </>
        )}
        <View style={styles.counterPill}>
          <Text style={styles.counterText}>{current + 1} / {count}</Text>
        </View>
        <Pressable style={styles.expandBtn} onPress={() => setExpanded(true)}>
          <MaterialCommunityIcons name="fullscreen" size={14} color="#FFFFFF" />
          <Text style={styles.expandLabel}>Agrandar</Text>
        </Pressable>
      </View>

      {count > 1 && (
        <View style={styles.stripRow}>
          <Pressable style={[styles.stripArrow, { backgroundColor: colors.cardBorder }]} onPress={() => go(-1)}>
            <MaterialCommunityIcons name="chevron-left" size={18} color={colors.contentText} />
          </Pressable>
          <ScrollView
            ref={stripRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.stripContent}
          >
            {photoURLs.map((url, i) => (
              <Pressable
                key={url}
                onPress={() => setCurrent(i)}
                style={[
                  styles.thumb,
                  { borderColor: colors.cardBorder },
                  i === current && { borderColor: colors.primary },
                ]}
              >
                <Image source={{ uri: url }} style={styles.thumbImg} contentFit="cover" />
              </Pressable>
            ))}
          </ScrollView>
          <Pressable style={[styles.stripArrow, { backgroundColor: colors.cardBorder }]} onPress={() => go(1)}>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.contentText} />
          </Pressable>
        </View>
      )}

      <Modal
        visible={expanded}
        transparent
        animationType="fade"
        onRequestClose={() => setExpanded(false)}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalClose} onPress={() => setExpanded(false)}>
            <MaterialCommunityIcons name="close" size={30} color="#FFFFFF" />
          </Pressable>
          <Pressable style={[styles.modalNav, styles.modalNavLeft]} onPress={() => go(-1)}>
            <MaterialCommunityIcons name="chevron-left" size={38} color="#FFFFFF" />
          </Pressable>
          <Image source={{ uri: main }} style={styles.modalImg} contentFit="contain" />
          <Pressable style={[styles.modalNav, styles.modalNavRight]} onPress={() => go(1)}>
            <MaterialCommunityIcons name="chevron-right" size={38} color="#FFFFFF" />
          </Pressable>

          <View style={styles.modalFooter}>
            {count > 1 && (
              <View style={styles.modalStripRow}>
                {photoURLs.map((url, i) => (
                  <Pressable
                    key={url}
                    onPress={() => setCurrent(i)}
                    style={[
                      styles.modalThumb,
                      { borderColor: i === current ? '#FFFFFF' : 'transparent' },
                    ]}
                  >
                    <Image source={{ uri: url }} style={styles.modalThumbImg} contentFit="cover" />
                  </Pressable>
                ))}
              </View>
            )}
            <Text style={styles.modalCounter}>{current + 1} / {count}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
    width: '100%',
    flex: 1,
  },
  mainBox: {
    flex: 1,
    minHeight: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(19,78,94,0.08)',
    position: 'relative',
  },
  mainImg: {
    width: '100%',
    height: '100%',
  },
  bigArrow: {
    position: 'absolute',
    top: '50%',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    marginTop: -15,
    cursor: 'pointer',
  },
  bigArrowLeft: { left: 8 },
  bigArrowRight: { right: 8 },
  counterPill: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  counterText: {
    color: '#FFFFFF',
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '700',
  },
  stripRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stripArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  stripContent: {
    gap: THUMB_GAP,
    paddingVertical: 2,
  },
  thumb: {
    width: THUMB_W,
    height: THUMB_W,
    borderRadius: 8,
    borderWidth: 1.5,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  thumbImg: {
    width: '100%',
    height: '100%',
  },
  expandBtn: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.55)',
    cursor: 'pointer',
  },
  expandLabel: {
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    padding: 8,
    cursor: 'pointer',
  },
  modalNav: {
    position: 'absolute',
    top: '50%',
    marginTop: -30,
    zIndex: 10,
    padding: 12,
    cursor: 'pointer',
  },
  modalNavLeft: { left: 8 },
  modalNavRight: { right: 8 },
  modalImg: {
    width: '92%',
    height: '70%',
  },
  modalFooter: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 8,
  },
  modalStripRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    maxWidth: '90%',
  },
  modalThumb: {
    width: 60,
    height: 60,
    borderRadius: 10,
    borderWidth: 2,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  modalThumbImg: {
    width: '100%',
    height: '100%',
  },
  modalCounter: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
