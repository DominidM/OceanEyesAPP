import React from 'react';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { headingProps } from '@landing/presentation/components/heading';
import { Reveal } from '@landing/presentation/components/reveal';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const barco1 =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/f_auto,q_auto,w_900/v1786166241/barco-1_isp4pb.jpg';
const barco2 =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/f_auto,q_auto,w_900/v1786166242/barco-2_yynxi8.jpg';
const barco3 =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/f_auto,q_auto,w_900/v1786166243/barco-3_j28orm.jpg';
const barco4 =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/f_auto,q_auto,w_900/v1786166246/barco-4_kwf6hl.jpg';

const helpActions = [
  { id: 1, image: barco1, icon: 'exclamation-circle', title: 'Reporta Actividades', cta: 'Reportar ahora', description: 'Si observas embarcaciones, redes ilegales o cualquier actividad sospechosa en zonas marinas protegidas, repórtalas de inmediato a las autoridades competentes.' },
  { id: 2, image: barco2, icon: 'share-alt', title: 'Difunde Información', cta: 'Compartir información', description: 'Comparte datos verificados sobre la pesca ilegal en redes sociales y educa a tu comunidad sobre el impacto de esta práctica en nuestros ecosistemas.' },
  { id: 3, image: barco3, icon: 'seedling', title: 'Reduce tu Huella Marina', cta: 'Conoce más', description: 'Evita plásticos de un solo uso, consume especies de pesca sostenible y reduce tu huella de carbono para proteger la biodiversidad de nuestros océanos.' },
  { id: 4, image: barco4, icon: 'pen', title: 'Firma Peticiones', cta: 'Firmar ahora', description: 'Apoya y firma iniciativas ciudadanas que promuevan leyes más estrictas, regulación pesquera y sanciones ejemplares contra la pesca ilegal.' },
];

/** Editorial text CTA: no navigation, only hover feedback (color + arrow slide). */
function HelpCta({ label }: { label: string }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <Pressable
      style={styles.action}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Text style={[styles.actionLabel, hovered && styles.actionLabelHovered]}>{label}</Text>
      <View style={[styles.actionArrowBox, hovered && styles.actionArrowBoxHovered]}>
        <Text style={styles.actionArrowText}>→</Text>
      </View>
    </Pressable>
  );
}

export function HelpSection() {
  const { isMobile, isTablet } = useBreakpoints();

  return (
    <View style={[styles.section, isMobile && styles.sectionMobile]}>
      <View style={styles.header}>
        <Reveal delay={0} duration={650}>
          <Text {...headingProps(2)} style={[styles.title, isMobile && styles.titleMobile]}>
            ¿Cómo Puedes Ayudar?
          </Text>
        </Reveal>
        <Reveal delay={90} duration={600}>
          <Text style={[styles.subtitle, isMobile && styles.subtitleMobile]}>
            Cada acción cuenta. Aquí te mostramos cómo puedes hacer la diferencia.
          </Text>
        </Reveal>
      </View>

      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {helpActions.map((action, index) => (
          <Reveal
            key={action.id}
            delay={index * 80}
            duration={650}
            style={[styles.item, isTablet && styles.itemTablet, isMobile && styles.itemMobile]}
          >
            <View style={styles.imageWrap}>
              <Image source={action.image} style={styles.image} contentFit="cover" />
              <View style={styles.imageOverlay} />
            </View>
            <View style={styles.itemContent}>
              <View style={styles.iconCircle}>
                <FontAwesome5 name={action.icon} size={15} color={BrandColors.primary} />
              </View>
              <Text style={styles.itemTitle} numberOfLines={2}>
                {action.title}
              </Text>
              <Text style={styles.itemDescription}>{action.description}</Text>
              <HelpCta label={action.cta} />
            </View>
          </Reveal>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.five,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  sectionMobile: {
    paddingVertical: Spacing.five,
    paddingHorizontal: Spacing.three,
  },
  header: {
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
    marginBottom: Spacing.six,
  },
  title: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontStyle: 'italic',
  },
  titleMobile: {
    fontSize: 30,
  },
  subtitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: BrandColors.neutral,
    opacity: 0.72,
    fontStyle: 'italic',
  },
  subtitleMobile: {
    fontSize: 16,
    lineHeight: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 28,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  gridMobile: {
    flexDirection: 'column',
    flexWrap: 'nowrap',
    gap: 40,
  },
  item: {
    flexDirection: 'column',
    flexGrow: 1,
    flexShrink: 1,
    // Small basis so 4 items + 3×28px gaps always fit one row; flexGrow
    // distributes the remaining space into 4 exactly equal columns.
    flexBasis: '22%',
    gap: Spacing.three,
  },
  itemTablet: {
    // 2 columns: two 46% bases + 28px gap fit, the third wraps to the next row,
    // then flexGrow equalizes both columns.
    flexBasis: '46%',
  },
  itemMobile: {
    flexGrow: 0,
    flexShrink: 0,
    flexBasis: 'auto',
    width: '100%',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  itemContent: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: Spacing.two + 4,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19,78,94,0.06)',
  },
  itemTitle: {
    fontSize: 21,
    lineHeight: 28,
    fontWeight: '700',
    color: BrandColors.primary,
    fontFamily: Fonts.body,
  },
  itemDescription: {
    fontSize: 15,
    lineHeight: 24,
    color: '#5A7684',
    fontFamily: Fonts.body,
  },
  action: {
    marginTop: 'auto',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingTop: Spacing.two,
    minHeight: 32,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.primary,
    fontFamily: Fonts.body,
    transitionProperty: 'color',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease',
  },
  actionLabelHovered: {
    color: 'rgba(19,78,94,0.62)',
  },
  actionArrowBox: {
    transitionProperty: 'transform',
    transitionDuration: '200ms',
    transitionTimingFunction: 'ease',
  },
  actionArrowBoxHovered: {
    transform: [{ translateX: 4 }],
  },
  actionArrowText: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.primary,
    fontFamily: Fonts.body,
  },
});
