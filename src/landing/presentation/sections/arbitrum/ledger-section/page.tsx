import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AppFonts as Fonts, BrandColors, Spacing } from '@landing/config/theme';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';

const netImg =
  'https://res.cloudinary.com/dp1vgjhsq/image/upload/v1786552390/7fd2b170-3647-43e6-8eb5-ce7d99600c62_vsqmov.png';

const ARB_LOGO = 'https://cryptologos.cc/logos/arbitrum-arb-logo.png';

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

export function LedgerSection() {
  const { isMobile } = useBreakpoints();

  return (
    <View style={styles.section}>
      <View style={[styles.wrap, isMobile && styles.wrapMobile]}>
        <View style={[styles.netMedia, isMobile && styles.netMediaMobile]}>
          <Image source={netImg} style={styles.netMediaImage} contentFit="cover" />
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
                Registro Verificable
              </Text>
              <Text style={styles.codeCardDescription}>
                Cada recompensa queda registrada en una red descentralizada y transparente,
                garantizando una prueba innegable de impacto.
              </Text>
            </View>

            <View style={styles.codeBlock}>
              <View style={styles.codeBlockHeader}>
                <View style={styles.codeDots}>
                  <View style={[styles.codeDot, styles.codeDotRed]} />
                  <View style={[styles.codeDot, styles.codeDotYellow]} />
                  <View style={[styles.codeDot, styles.codeDotGreen]} />
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
    paddingBottom: Spacing.six,
    paddingHorizontal: Spacing.five,
    maxWidth: 1600,
    alignSelf: 'center',
    width: '100%',
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.five,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  wrapMobile: {
    flexDirection: 'column',
    gap: Spacing.four,
  },
  codeSection: {
    flex: 1,
    backgroundColor: '#0C1C2B',
    borderRadius: 20,
    padding: 40,
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
  },
  codeDotRed: {
    backgroundColor: '#FF5F57',
  },
  codeDotYellow: {
    backgroundColor: '#FEBC2E',
  },
  codeDotGreen: {
    backgroundColor: '#28C840',
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
