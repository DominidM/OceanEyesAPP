import React from 'react';
import {StyleSheet, View} from 'react-native';

import { AppText } from '@/shared/components/app-text';
import { AppFonts as Fonts, BrandColors } from '@/constants/theme';
import { AppSymbol } from '@/shared/components/app-symbol';
import { SurfaceColors } from '@/modules/reports/presentation/theme';
import { shadow } from '@/shared/utils/shadows';

export type CampaignItem = {
  id: string;
  title: string;
  description: string;
  location?: string;
  municipalityName?: string;
  startDate?: string;
  endDate?: string;
};

function formatDate(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function CampaignCard({ campaign }: { campaign: CampaignItem }) {
  const start = formatDate(campaign.startDate);
  const end = formatDate(campaign.endDate);

  return (
    <View accessible accessibilityRole="summary" style={styles.card}>
      <View style={styles.iconBox}>
        <AppSymbol
          name={{ ios: 'megaphone.fill', android: 'campaign', web: 'campaign' }}
          color={BrandColors.primary}
          size={22}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <AppText style={styles.title} numberOfLines={2}>
            {campaign.title}
          </AppText>
          {campaign.municipalityName ? (
            <View style={styles.chip}>
              <AppText style={styles.chipLabel}>{campaign.municipalityName}</AppText>
            </View>
          ) : null}
        </View>

        <AppText style={styles.description} numberOfLines={3}>
          {campaign.description}
        </AppText>

        {(campaign.location || start) && (
          <AppText style={styles.meta}>
            {campaign.location ? `📍 ${campaign.location}` : ''}
            {campaign.location && start ? ' · ' : ''}
            {start ? `${start}${end && end !== start ? ` – ${end}` : ''}` : ''}
          </AppText>
        )}
      </View>
    </View>
  );
}

export default CampaignCard;

const styles = StyleSheet.create({
  card: {
    width: '100%',
    maxWidth: 358,
    alignSelf: 'center',
    padding: 16,
    gap: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: SurfaceColors.border,
    backgroundColor: SurfaceColors.card,
    ...shadow('subtle'),
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    color: BrandColors.neutral,
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
    includeFontPadding: false,
  },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(13, 148, 136, 0.12)',
  },
  chipLabel: {
    color: '#0D9488',
    fontFamily: Fonts.label,
    fontSize: 11,
    fontWeight: '700',
    includeFontPadding: false,
  },
  description: {
    color: SurfaceColors.mutedText,
    fontFamily: Fonts.body,
    fontSize: 12,
    lineHeight: 17,
    includeFontPadding: false,
  },
  meta: {
    color: BrandColors.primary,
    fontFamily: Fonts.label,
    fontSize: 12,
    fontWeight: '700',
    includeFontPadding: false,
  },
});
