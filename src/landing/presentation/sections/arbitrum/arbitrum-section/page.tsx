import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const immutableImg =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786552390/7fd2b170-3647-43e6-8eb5-ce7d99600c62_vsqmov.png';

const ARB_LOGO = 'https://cryptologos.cc/logos/arbitrum-arb-logo.png';

const INFRA_CARDS = [
  {
    id: 1,
    icon: 'bolt',
    title: 'Alto Rendimiento',
    description:
      'Procesa grandes volúmenes de telemetría sin latencia, asegurando actualizaciones de vigilancia en tiempo real.',
  },
  {
    id: 2,
    icon: 'shield-alt',
    title: 'Prueba Criptográfica',
    description:
      'Hereda la seguridad de Ethereum para garantizar la autenticidad de cada anomalía marina reportada.',
  },
  {
    id: 3,
    icon: 'leaf',
    title: 'Bajo Impacto',
    description:
      'Consumo energético minimizado, alineado con nuestra misión de preservación ambiental.',
  },
];

function CodeKeyword({ children }: { children: React.ReactNode }) {
  return <Text style={styles.codeKeyword}>{children}</Text>;
}

function CodeString({ children }: { children: React.ReactNode }) {
  return <Text style={styles.codeString}>{children}</Text>;
}

function CodeComment({ children }: { children: React.ReactNode }) {
  return <Text style={styles.codeComment}>{children}</Text>;
}

function CodeFunction({ children }: { children: React.ReactNode }) {
  return <Text style={styles.codeFunction}>{children}</Text>;
}

function CodeLine({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <View style={styles.codeLine}>
      <Text style={styles.codeLineNumber}>{n}</Text>
      <Text style={styles.codeLineContent}>{children}</Text>
    </View>
  );
}

export function ArbitrumSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={styles.section}>
      {/* Procedencia Inmutable */}
      <View style={[styles.immutable, isMobile && styles.immutableMobile]}>
        <View style={[styles.immutableText, isMobile && styles.immutableTextMobile]}>
          <Text style={styles.immutableEyebrow}>Procedencia Inmutable</Text>
          <Text style={[styles.immutableTitle, isMobile && styles.immutableTitleMobile]}>
            Anclando la confianza en aguas profundas.
          </Text>
          <Text style={[styles.immutableSubtitle, isMobile && styles.immutableSubtitleMobile]}>
            Ocean Eyes usa registros descentralizados en Arbitrum Sepolia para garantizar
            que la vigilancia ambiental permanezca intacta. Cada evento marino verificado
            queda sellado criptográficamente, creando un registro incontrovertible de la
            salud de nuestros océanos.
          </Text>
        </View>
        <View style={[styles.immutableMedia, isMobile && styles.immutableMediaMobile]}>
          <Image source={immutableImg} style={styles.immutableImage} contentFit="cover" />
        </View>
      </View>

      {/* Infrastructure */}
      <View style={styles.infraWrap}>
        <View style={[styles.infraHeader, isMobile && styles.infraHeaderMobile]}>
          <Text style={[styles.infraTitle, isMobile && styles.infraTitleMobile]}>
            Infraestructura
          </Text>
          <Text style={[styles.infraSubtitle, isMobile && styles.infraSubtitleMobile]}>
            Construido sobre rollups escalables y de alta eficiencia.
          </Text>
        </View>

        <View style={[styles.infraCards, isMobile && styles.infraCardsMobile]}>
          {INFRA_CARDS.map((item) => (
            <View key={item.id} style={[styles.infraCard, isMobile && styles.infraCardMobile]}>
              <View style={styles.infraCardHeader}>
                <FontAwesome5 name={item.icon} size={30} color={BrandColors.secondary} />
                <Text style={styles.infraCardTitle}>{item.title}</Text>
              </View>
              <Text style={styles.infraCardDescription}>{item.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Code Block */}
      <View style={[styles.codeWrap, isMobile && styles.codeWrapMobile]}>
        <View style={[styles.netMedia, isMobile && styles.netMediaMobile]}>
          <Image source={immutableImg} style={styles.netMediaImage} contentFit="cover" />
          <View style={styles.netMediaOverlay} />
          <View style={styles.netMediaContent}>
            <Image source={ARB_LOGO} style={styles.netLogo} contentFit="contain" />
            <Text style={[styles.netTitle, isMobile && styles.netTitleMobile]}>
              Arbitrum Sepolia
            </Text>
            <View style={styles.netChip}>
              <FontAwesome5 name="link" size={11} color={BrandColors.secondary} />
              <Text style={styles.netChipText}>Chain ID 421614</Text>
            </View>
          </View>
        </View>

        <View style={[styles.codeSection, isMobile && styles.codeSectionMobile]}>
          <View style={styles.codeContent}>
            <View style={styles.codeCardHeader}>
              <View style={styles.codeBadge}>
                <View style={styles.codeBadgeDot} />
                <Text style={styles.codeBadgeText}>Protocolo OceanEyes</Text>
              </View>
              <Text style={[styles.codeCardTitle, isMobile && styles.codeCardTitleMobile]}>
                Ledger Verificable
              </Text>
              <Text style={styles.codeCardDescription}>
                Cada recompensa queda registrada en una red descentralizada y transparente,
                garantizando una prueba innegable de impacto.
              </Text>
            </View>

            <View style={styles.codeBlock}>
              <View style={styles.codeBlockHeader}>
                <View style={styles.codeDots}>
                  <View style={styles.codeDot} />
                  <View style={styles.codeDot} />
                  <View style={styles.codeDot} />
                </View>
                <Text style={styles.codeFilename}>PointLedger.sol</Text>
              </View>

              <View style={styles.codeBlockBody}>
                <CodeLine n="1">
                  <CodeKeyword>import</CodeKeyword>
                  {' { PointLedger } '}
                  <CodeKeyword>from</CodeKeyword>
                  <CodeString>{'"@oceaneyes/contracts"'}</CodeString>;
                </CodeLine>
                <CodeLine n="2">
                  <Text />
                </CodeLine>
                <CodeLine n="3">
                  <CodeKeyword>const</CodeKeyword> networkId <Text style={styles.codePlain}>=</Text>{' '}
                  <CodeString>{'"421614"'}</CodeString>
                  <CodeComment>{' // Arbitrum Sepolia'}</CodeComment>
                </CodeLine>
                <CodeLine n="4">
                  <CodeKeyword>const</CodeKeyword> contractAddr <Text style={styles.codePlain}>=</Text>{' '}
                  <CodeString>{'"0xbA7A...1509"'}</CodeString>;
                </CodeLine>
                <CodeLine n="5">
                  <Text />
                </CodeLine>
                <CodeLine n="6">
                  <CodeKeyword>async function</CodeKeyword>{' '}
                  <CodeFunction>awardPoints</CodeFunction>() {'{'}
                </CodeLine>
                <CodeLine n="7">
                  {'  '}<CodeKeyword>const</CodeKeyword> tx <Text style={styles.codePlain}>=</Text>{' '}
                  <CodeKeyword>await</CodeKeyword> PointLedger.
                  <CodeFunction>award</CodeFunction>(contractAddr);
                </CodeLine>
                <CodeLine n="8">
                  {'  '}<CodeKeyword>return</CodeKeyword> tx.isVerified;
                </CodeLine>
                <CodeLine n="9">
                  {'}'}
                </CodeLine>
              </View>

              <View style={styles.codeBlockFooter}>
                <FontAwesome5
                  name="check-circle"
                  size={16}
                  color={BrandColors.secondary}
                />
                <Text style={styles.codeBlockFooterText}>
                  Estado: Transparente e Inmutable
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingVertical: Spacing.six,
    paddingHorizontal: Spacing.five,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  immutable: {
    flexDirection: 'row',
    gap: Spacing.six,
    alignItems: 'center',
    marginBottom: Spacing.six,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  immutableMobile: {
    flexDirection: 'column',
    gap: Spacing.four,
    marginBottom: Spacing.five,
  },
  immutableText: {
    flex: 1,
    gap: Spacing.three,
  },
  immutableTextMobile: {},
  immutableEyebrow: {
    fontFamily: Fonts.label,
    fontSize: 12,
    color: BrandColors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  immutableTitle: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    fontStyle: 'italic',
    lineHeight: 46,
  },
  immutableTitleMobile: {
    fontSize: 30,
    lineHeight: 36,
  },
  immutableSubtitle: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: BrandColors.neutral,
    opacity: 0.78,
    lineHeight: 26,
  },
  immutableSubtitleMobile: {
    fontSize: 15,
    lineHeight: 24,
  },
  immutableMedia: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  immutableMediaMobile: {
    width: '100%',
  },
  immutableImage: {
    width: '100%',
    height: 280,
  },
  infraWrap: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: -Spacing.five,
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.six,
    marginBottom: Spacing.six,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  infraHeader: {
    alignItems: 'flex-start',
    marginBottom: Spacing.six,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  infraHeaderMobile: {
    marginBottom: Spacing.five,
  },
  infraTitle: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: BrandColors.primary,
    fontWeight: '700',
    marginBottom: Spacing.three,
    fontStyle: 'italic',
    textAlign: 'left',
  },
  infraTitleMobile: {
    fontSize: 30,
  },
  infraSubtitle: {
    fontFamily: Fonts.headline,
    fontSize: 18,
    color: BrandColors.neutral,
    opacity: 0.72,
    fontStyle: 'italic',
    textAlign: 'left',
  },
  infraSubtitleMobile: {
    fontSize: 16,
  },
  infraCards: {
    flexDirection: 'row',
    gap: Spacing.five,
    marginBottom: Spacing.six,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  infraCardsMobile: {
    flexDirection: 'column',
    gap: Spacing.four,
  },
  infraCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192,200,203,0.5)',
    padding: Spacing.five,
    gap: Spacing.three,
  },
  infraCardMobile: {
    padding: Spacing.four,
  },
  infraCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  infraCardTitle: {
    fontFamily: Fonts.headline,
    fontSize: 24,
    color: BrandColors.primary,
    fontWeight: '500',
  },
  infraCardDescription: {
    fontSize: 14,
    color: '#40484B',
    lineHeight: 24,
    fontFamily: Fonts.body,
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.five,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    marginBottom: Spacing.six,
  },
  codeWrapMobile: {
    flexDirection: 'column',
    gap: Spacing.four,
  },
  codeSection: {
    flex: 1,
    backgroundColor: '#0C1C2B',
    borderRadius: 20,
    padding: Spacing.six,
    overflow: 'hidden',
  },
  codeSectionMobile: {
    padding: Spacing.four,
  },
  netMedia: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 380,
  },
  netMediaMobile: {
    minHeight: 240,
  },
  netMediaImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  netMediaOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(4,29,38,0.55)',
  },
  netMediaContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    padding: Spacing.four,
  },
  netLogo: {
    width: 76,
    height: 76,
    borderRadius: 16,
  },
  netTitle: {
    fontFamily: Fonts.headline,
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  netTitleMobile: {
    fontSize: 24,
  },
  netChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: 'rgba(2,19,25,0.78)',
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(152,185,177,0.3)',
  },
  netChipText: {
    fontFamily: Fonts.label,
    fontSize: 12,
    color: '#EFEBE3',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  codeContent: {
    gap: Spacing.five,
  },
  codeCardHeader: {
    gap: Spacing.three,
  },
  codeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(152,185,177,0.12)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(152,185,177,0.35)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  codeBadgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BrandColors.secondary,
  },
  codeBadgeText: {
    fontFamily: Fonts.label,
    fontSize: 11,
    color: BrandColors.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  codeCardTitle: {
    fontFamily: Fonts.headline,
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: '700',
    fontStyle: 'italic',
  },
  codeCardTitleMobile: {
    fontSize: 28,
  },
  codeCardDescription: {
    fontFamily: Fonts.body,
    fontSize: 16,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 26,
    maxWidth: 520,
  },
  codeBlock: {
    backgroundColor: '#041d26',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(152,185,177,0.15)',
    overflow: 'hidden',
  },
  codeBlockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: '#021319',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(152,185,177,0.1)',
  },
  codeDots: {
    flexDirection: 'row',
    gap: 6,
  },
  codeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(152,185,177,0.3)',
  },
  codeFilename: {
    fontFamily: Fonts.body,
    fontSize: 12,
    color: 'rgba(152,185,177,0.6)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  codeBlockBody: {
    padding: Spacing.four,
    gap: 2,
  },
  codeLine: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  codeLineNumber: {
    fontFamily: Fonts.label,
    fontSize: 13,
    color: 'rgba(152,185,177,0.4)',
    width: 24,
    textAlign: 'right',
  },
  codeLineContent: {
    fontFamily: Fonts.label,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    flex: 1,
  },
  codeKeyword: {
    color: '#98B9B1',
    fontWeight: '600',
  },
  codeString: {
    color: '#9AC5C0',
  },
  codeComment: {
    color: 'rgba(152,185,177,0.5)',
    fontStyle: 'italic',
  },
  codePlain: {
    color: '#FFFFFF',
  },
  codeFunction: {
    color: '#EFEBE3',
    fontWeight: '600',
  },
  codeBlockFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: 'rgba(152,185,177,0.1)',
  },
  codeBlockFooterText: {
    fontFamily: Fonts.body,
    fontSize: 14,
    color: BrandColors.secondary,
    fontWeight: '600',
  },
});