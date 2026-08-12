import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { useAdminTheme } from '@admin/theme/context';

type AdminLoadingProps = {
  variant?: 'list' | 'form' | 'detail';
};

type WidthHeight = number | `${number}%`;

function Shimmer({ width, height, radius = 8 }: { width: WidthHeight; height: number; radius?: number }) {
  const { colors } = useAdminTheme();
  const [blockW, setBlockW] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, { toValue: 1, duration: 1400, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  const dist = blockW > 0 ? blockW : 320;
  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-dist, dist],
  });

  return (
    <View
      onLayout={(e) => setBlockW(e.nativeEvent.layout.width)}
      style={[
        styles.skeleton,
        { width, height, borderRadius: radius, backgroundColor: colors.cardBorder },
      ]}
    >
      <Animated.View style={[styles.shimmerStripe, { transform: [{ translateX }] }]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

function HeaderSkeleton({ isForm }: { isForm: boolean }) {
  const { colors } = useAdminTheme();
  const button = (width: number) => <Shimmer width={width} height={36} radius={12} />;
  return (
    <View
      style={[
        styles.headerCard,
        styles.sectionHeaderBar,
        { backgroundColor: colors.cardBg, borderColor: colors.cardBorder },
      ]}
    >
      <View style={styles.headerTop}>
        <View style={styles.headerText}>
          <Shimmer width={224} height={20} />
          <View style={styles.spaceY_2}>
            <Shimmer width={288} height={12} />
          </View>
        </View>
        {isForm ? (
          <View style={styles.headerButtons}>
            {button(144)}
            {button(128)}
          </View>
        ) : (
          button(112)
        )}
      </View>
    </View>
  );
}

function AdminListLoader() {
  const { colors } = useAdminTheme();
  const ping = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pingLoop = Animated.loop(
      Animated.timing(ping, { toValue: 1, duration: 1500, useNativeDriver: true }),
    );
    const spinLoop = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 900, useNativeDriver: true }),
    );
    pingLoop.start();
    spinLoop.start();
    return () => {
      pingLoop.stop();
      spinLoop.stop();
    };
  }, [ping, rotate]);

  const pingScale = ping.interpolate({ inputRange: [0, 1], outputRange: [1, 1.6] });
  const pingOpacity = ping.interpolate({ inputRange: [0, 0.75, 1], outputRange: [0.35, 0.15, 0] });
  const rotateDeg = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const primary = colors.primary;

  return (
    <View style={styles.loaderWrap}>
      <View style={styles.pingWrap}>
        <Animated.View
          style={[
            styles.pingOuter,
            { backgroundColor: primary, transform: [{ scale: pingScale }], opacity: pingOpacity },
          ]}
        />
        <View style={[styles.pingInner, { backgroundColor: colors.cardBg }]} />
        <Animated.View
          style={[styles.spinner, { borderTopColor: primary, borderRightColor: primary, transform: [{ rotate: rotateDeg }] }]}
        />
      </View>
      <Text style={[styles.loaderTitle, { color: colors.contentText }]}>Cargando datos…</Text>
      <Text style={[styles.loaderSub, { color: colors.contentTextMuted }]}>
        Espere un momento por favor
      </Text>
    </View>
  );
}

export function AdminInlineLoader({ label = 'Cargando…' }: { label?: string }) {
  const { colors } = useAdminTheme();
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spinLoop = Animated.loop(
      Animated.timing(rotate, { toValue: 1, duration: 900, useNativeDriver: true }),
    );
    spinLoop.start();
    return () => spinLoop.stop();
  }, [rotate]);

  const rotateDeg = rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.inlineLoader}>
      <Animated.View
        style={[styles.spinnerSmall, { borderTopColor: colors.primary, borderRightColor: colors.primary, transform: [{ rotate: rotateDeg }] }]}
      />
      <Text style={[styles.inlineLabel, { color: colors.contentTextMuted }]}>{label}</Text>
    </View>
  );
}

function ListSkeleton() {
  const { colors } = useAdminTheme();
  return (
    <View
      style={[styles.listCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
    >
      <AdminListLoader />
    </View>
  );
}

type FieldSpec = { label: number; input: number; full: boolean };

function FormSkeleton() {
  const fields: FieldSpec[] = [
    { label: 112, input: 44, full: false },
    { label: 144, input: 44, full: false },
    { label: 96, input: 44, full: true },
    { label: 128, input: 112, full: true },
    { label: 96, input: 44, full: false },
    { label: 80, input: 44, full: false },
  ];

  return (
    <View
      style={[styles.formCard, { backgroundColor: 'transparent', borderColor: 'transparent' }]}
    >
      <View style={styles.formGrid}>
        {fields.map((f, i) => (
          <View key={i} style={f.full ? styles.formFieldFull : styles.formFieldHalf}>
            <Shimmer width={f.label} height={12} />
            <View style={styles.formFieldSpace}>
              <Shimmer width={f.full ? '100%' : 260} height={f.input} radius={12} />
            </View>
          </View>
        ))}
      </View>
      <View style={styles.formActions}>
        <Shimmer width={128} height={40} radius={12} />
        <Shimmer width={160} height={40} radius={12} />
      </View>
    </View>
  );
}

type DetailRowSpec = { label: number; value: number };

function DetailSkeleton() {
  const { colors } = useAdminTheme();
  const dataRows: DetailRowSpec[] = [
    { label: 96, value: 160 },
    { label: 112, value: 140 },
    { label: 80, value: 180 },
  ];
  return (
    <View
      style={[styles.detailCard, { backgroundColor: colors.cardBg, borderColor: colors.cardBorder }]}
    >
      <View style={[styles.detailBlock, { borderColor: colors.cardBorder }]}>
        <Shimmer width={128} height={16} />
        <View style={styles.detailSpace}>
          <Shimmer width={96} height={24} radius={12} />
        </View>
        <View style={styles.detailList}>
          {dataRows.map((r, i) => (
            <View key={i} style={[styles.detailRow, { borderBottomColor: colors.cardBorder }]}>
              <Shimmer width={r.label} height={12} />
              <Shimmer width={r.value} height={14} />
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.detailBlock, { borderColor: colors.cardBorder }]}>
        <Shimmer width={112} height={16} />
        <View style={styles.detailSpace}>
          <Shimmer width="100%" height={14} />
        </View>
        <View style={styles.detailActions}>
          <Shimmer width={120} height={36} radius={12} />
          <Shimmer width={120} height={36} radius={12} />
          <Shimmer width={120} height={36} radius={12} />
        </View>
      </View>
    </View>
  );
}

export function AdminLoading({ variant = 'list' }: AdminLoadingProps) {
  const isForm = variant === 'form';

  return (
    <View style={styles.container} accessible accessibilityLabel="Cargando contenido">
      <HeaderSkeleton isForm={isForm} />
      {variant === 'form' ? <FormSkeleton /> : variant === 'detail' ? <DetailSkeleton /> : <ListSkeleton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  skeleton: {
    overflow: 'hidden',
  },
  shimmerStripe: {
    ...StyleSheet.absoluteFillObject,
  },
  headerCard: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  sectionHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTop: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spaceY_2: {
    marginTop: 8,
  },
  loaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 96,
    paddingHorizontal: 24,
  },
  pingWrap: {
    width: 64,
    height: 64,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingOuter: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  pingInner: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  spinner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: 'transparent',
    position: 'absolute',
  },
  loaderTitle: {
    fontFamily: Fonts.body,
    fontSize: 14,
    fontWeight: '500',
  },
  loaderSub: {
    fontFamily: Fonts.body,
    fontSize: 12,
    marginTop: 4,
  },
  listCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  formFieldHalf: {
    width: '47%',
  },
  formFieldFull: {
    width: '100%',
  },
  formFieldSpace: {
    marginTop: 8,
  },
  formActions: {
    marginTop: 32,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  detailCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  detailBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  detailSpace: {
    marginTop: Spacing.two,
  },
  detailList: {
    marginTop: Spacing.three,
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
  },
  detailActions: {
    marginTop: Spacing.three,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  inlineLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  spinnerSmall: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inlineLabel: {
    fontFamily: Fonts.label,
    fontSize: 13,
    fontWeight: '600',
  },
});

export default AdminLoading;