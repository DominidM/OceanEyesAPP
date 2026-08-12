import { router, useLocalSearchParams } from 'expo-router';
import { addDoc, collection, doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

import { AppFonts as Fonts, Spacing } from '@admin/config/theme';
import { AdminShell } from '@admin/layout/admin-shell';
import { Badge, Button, Card, EmptyState, AdminLoading, SectionHeader } from '@admin/presentation/components/ui';
import { ReportDataList } from '@admin/presentation/components/reports/report-data-list';
import { ReportGallery } from '@admin/presentation/components/reports/report-gallery';
import { ReportMap } from '@admin/presentation/components/reports/report-map';
import { useWallet } from '@admin/presentation/hooks/useWallet';
import { useAdminTheme } from '@admin/theme/context';
import { buildArbiscanTxUrl } from '@shared/blockchain/ledger';
import { banDevice } from '@/shared/firebase/bans';
import { firebaseAuth, firestore } from '@/shared/firebase/app';
import { onChainNoticeForReport, verifyReport } from '@/shared/firebase/reports';
import { REPORT_CATEGORIES, type Report, type ReportStatus } from '@/shared/firebase/types';

const CATEGORY_LABELS: Record<string, string> = {
  pesca_ilegal: 'Pesca ilegal',
  basura_marina: 'Basura en el mar u orillas',
  variacion_mar: 'Variación del mar',
  derrame_hidrocarburos: 'Derrame de hidrocarburos',
  fauna_herida: 'Fauna marina herida o varada',
  redes_fantasmas: 'Redes o aparejos abandonados',
  embarcacion_sospechosa: 'Embarcación sospechosa',
  marea_roja: 'Marea roja o cambio de color del agua',
  otro: 'Otro incidente',
};

export function ReportDetailScreen({ readOnly = false }: { readOnly?: boolean }) {
  const { colors } = useAdminTheme();
  const { signer, connect, installed } = useWallet();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [banned, setBanned] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [onChainNotice, setOnChainNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getDoc(doc(firestore, 'reports', id))
      .then((snap) => {
        if (snap.exists()) setReport({ id: snap.id, ...snap.data() } as Report);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const changeStatus = async (status: Extract<ReportStatus, 'en_revision' | 'verificado' | 'descartado'>) => {
    if (!report) return;
    setActionError(null);
    setOnChainNotice(null);
    try {
      if (status === 'verificado') {
        let currentSigner = signer;
        if (!currentSigner && installed) {
          currentSigner = await connect();
        }
        if (!currentSigner) {
          throw new Error('Conecta la wallet administradora antes de verificar. El reporte seguirá pendiente.');
        }
        const outcome = await verifyReport(report.id, firebaseAuth?.currentUser?.uid ?? 'admin', currentSigner ?? undefined);
        if (outcome.kind === 'skipped_no_signer') {
          setOnChainNotice(
            installed
              ? 'Reporte verificado en BD. Sin transacción on-chain: conecta tu wallet en la parte superior.'
              : 'Reporte verificado en BD. Sin transacción on-chain: MetaMask no está instalado.',
          );
        } else if (outcome.kind === 'skipped_no_wallet') {
          setOnChainNotice('Reporte verificado en BD. Sin transacción on-chain: el reportante no tiene wallet vinculada.');
        } else if (outcome.kind === 'failed') {
          setOnChainNotice(`Reporte verificado en BD. La transacción on-chain falló: ${outcome.error}`);
        }
      } else {
        await updateDoc(doc(firestore, 'reports', report.id), {
          status,
          reviewedBy: firebaseAuth?.currentUser?.uid,
          reviewedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      await addDoc(collection(firestore, 'reports', report.id, 'statusHistory'), {
        fromStatus: report.status,
        toStatus: status,
        changedBy: firebaseAuth?.currentUser?.uid,
        createdAt: serverTimestamp(),
      });
      const snap = await getDoc(doc(firestore, 'reports', report.id));
      if (snap.exists()) setReport({ id: snap.id, ...snap.data() } as Report);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Error al cambiar el estado del reporte.');
    }
  };

  const handleBanDevice = async () => {
    if (!report?.deviceHash) return;
    await banDevice(report.deviceHash, {
      reason: `Reporte falso/descartado: ${report.id}`,
      bannedBy: firebaseAuth?.currentUser?.uid,
    });
    setBanned(true);
  };

  const statusChip = (status: ReportStatus) => {
    switch (status) {
      case 'verificado': return { label: 'Verificado', color: colors.success, bg: colors.successBg };
      case 'descartado': return { label: 'Descartado', color: colors.danger, bg: colors.dangerBg };
      case 'en_revision': return { label: 'En revisión', color: '#3B82F6', bg: 'rgba(59,130,246,0.12)' };
      default: return { label: 'Pendiente', color: colors.warning, bg: colors.warningBg };
    }
  };

  const dateStr = report?.createdAt?.toDate?.()
    ? report.createdAt.toDate().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

  const rows: { label: string; value: string }[] = report
    ? [
        { label: 'Título', value: report.title },
        { label: 'ID de reporte', value: report.id },
        { label: 'Categoría', value: CATEGORY_LABELS[report.category] ?? report.category },
        { label: 'Fecha', value: dateStr },
        { label: 'Autor', value: report.isAnonymous ? 'Anónimo' : 'Identificado' },
        { label: 'ID de usuario', value: report.userId },
        { label: 'Hash de dispositivo', value: report.deviceHash ?? '—' },
        { label: 'Puntos otorgados', value: String(REPORT_CATEGORIES[report.category]?.points ?? 0) },
        { label: 'Ubicación', value: report.location?.address ?? (report.location ? `${report.location.latitude}, ${report.location.longitude}` : '—') },
      ]
    : [];

  const canReview = report && (report.status === 'pendiente' || report.status === 'en_revision');
  const hasLocation = report?.location?.latitude != null && report.location.longitude != null;
  const hasPhotos = !!report?.photoURLs && report.photoURLs.length > 0;
  const persistentNotice = report?.onChainStatus
    ? onChainNoticeForReport(report.onChainStatus, { installed, error: report.onChainError })
    : null;

  return (
    <AdminShell
      title="Detalle de reporte"
      breadcrumb={[{ label: readOnly ? 'Reportes y auditoría' : 'Reportes', href: readOnly ? '/admin/municipio/reportes' : '/admin/reports' }, { label: 'Detalle' }]}
    >
      {!loading && (
        <SectionHeader
          title="Detalles de reportes"
          actions={[
            <Button key="back" label="Volver" variant="secondary" onPress={() => router.push(readOnly ? '/admin/municipio/reportes' : '/admin/reports')} />,
          ]}
        />
      )}

      {loading && <AdminLoading variant="detail" />}

      {!loading && !report && (
        <EmptyState
          icon="clipboard-alert-outline"
          title="Reporte no encontrado"
          description="El reporte no existe o no tienes acceso a él."
        />
      )}

      {report && (
        <Card style={styles.card}>
          <View style={styles.mediaRow}>
            <View style={[styles.subBlock, styles.mediaCol, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Ubicación</Text>
              {hasLocation ? (
                <ReportMap
                  latitude={report.location!.latitude}
                  longitude={report.location!.longitude}
                  title={report.title}
                />
              ) : (
                <View style={[styles.noMediaBox, { borderColor: colors.cardBorder }]}>
                  <MaterialCommunityIcons name="map-marker-off-outline" size={28} color={colors.contentTextMuted} />
                  <Text style={[styles.emptyHint, { color: colors.contentTextMuted }]}>Sin ubicación registrada.</Text>
                </View>
              )}
            </View>

            <View style={[styles.subBlock, styles.mediaCol, { borderColor: colors.cardBorder }]}>
              <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Galería</Text>
              {hasPhotos ? (
                <ReportGallery photoURLs={report.photoURLs} />
              ) : (
                <View style={[styles.noMediaBox, { borderColor: colors.cardBorder }]}>
                  <MaterialCommunityIcons name="image-off-outline" size={28} color={colors.contentTextMuted} />
                  <Text style={[styles.emptyHint, { color: colors.contentTextMuted }]}>No hay fotos</Text>
                </View>
              )}
            </View>
          </View>

          {report.audioURL ? (
            <View style={[styles.subBlock, { borderColor: colors.cardBorder, marginTop: Spacing.two }]}>
              <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Audio del reporte</Text>
              <AudioPlayer uri={report.audioURL} />
            </View>
          ) : null}

          <View style={[styles.subBlock, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Datos de reporte</Text>

            <View style={styles.headingRow}>
              <Badge label={statusChip(report.status).label} color={statusChip(report.status).color} bg={statusChip(report.status).bg} />
              {report.status === 'verificado' && report.txHash && (
                <Pressable
                  onPress={() => Linking.openURL(buildArbiscanTxUrl(report.txHash!))}
                  style={({ hovered }) => [styles.txLink, hovered && { opacity: 0.7 }]}
                >
                  <Text style={[styles.txLinkText, { color: colors.accent }]}>Ver tx en Arbiscan</Text>
                </Pressable>
              )}
            </View>

            {report.description ? (
              <View style={styles.descriptionBox}>
                <Text style={[styles.descriptionLabel, { color: colors.contentTextMuted }]}>Descripción</Text>
                <Text style={[styles.description, { color: colors.cardText }]}>{report.description}</Text>
              </View>
            ) : null}

            <ReportDataList rows={rows} />
          </View>

          {!readOnly && <View style={[styles.subBlock, { borderColor: colors.cardBorder }]}>
            <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Moderación</Text>

            {onChainNotice && (
              <Text style={[styles.subBlockHint, { color: colors.warning }]}>{onChainNotice}</Text>
            )}
            {actionError && (
              <Text style={[styles.actionError, { color: colors.danger }]}>{actionError}</Text>
            )}
            {persistentNotice && !onChainNotice && (
              <Text style={[styles.subBlockHint, { color: colors.warning }]}>{persistentNotice}</Text>
            )}

            {canReview ? (
              <>
                {!signer && (
                  <Text style={[styles.subBlockHint, { color: colors.warning }]}>
                    Conecta tu wallet en la parte superior para registrar los puntos on-chain.
                  </Text>
                )}
                <Text style={[styles.subBlockHint, { color: colors.contentTextMuted }]}>
                  Mueve el reporte a revisión, aprueba (otorga puntos) o recházalo.
                </Text>
                <View style={styles.actionsRow}>
                  <Button
                    label="En revisión"
                    variant="secondary"
                    disabled={report.status === 'en_revision'}
                    onPress={() => changeStatus('en_revision')}
                  />
                  <Button label="Verificar" onPress={() => changeStatus('verificado')} />
                  <Button label="Rechazar" variant="danger" onPress={() => changeStatus('descartado')} />
                </View>
              </>
            ) : (
              <Text style={[styles.subBlockHint, { color: colors.contentTextMuted }]}>
                Este reporte ya fue moderado.
              </Text>
            )}

            {report.status === 'descartado' && report.deviceHash && (
              <View style={[styles.innerSubBlock, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.subBlockTitle, { color: colors.cardText }]}>Dispositivo</Text>
                <Text style={[styles.subBlockHint, { color: colors.contentTextMuted }]}>
                  El reporte fue rechazado. Puedes banear el dispositivo que lo originó.
                </Text>
                <View style={styles.actionsRow}>
                  <Button
                    label={banned ? 'Dispositivo baneado' : 'Banear dispositivo'}
                    variant="danger"
                    disabled={banned}
                    onPress={handleBanDevice}
                  />
                </View>
              </View>
            )}
          </View>}
        </Card>
      )}
    </AdminShell>
  );
}

export default ReportDetailScreen;

function formatAudioDuration(ms: number): string {
  const total = Math.floor(ms / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = String(total % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function AudioPlayer({ uri }: { uri: string }) {
  const { colors } = useAdminTheme();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const playing = status.playing;

  const toggle = () => {
    try {
      if (playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch {
      /* ignore */
    }
  };

  return (
    <Pressable
      onPress={toggle}
      style={({ hovered }) => [
        styles.audioRow,
        hovered && { opacity: 0.7 },
      ]}>
      <MaterialCommunityIcons
        name={playing ? 'pause-circle' : 'play-circle'}
        size={34}
        color="#0D9488"
      />
      <View style={styles.audioTextBlock}>
        <Text style={[styles.audioActionLabel, { color: colors.accent }]}>
          {playing ? 'Pausar audio' : 'Escuchar audio'}
        </Text>
        {status.duration > 0 ? (
          <Text style={[styles.audioDurationLabel, { color: colors.contentTextMuted }]}>
            {formatAudioDuration(status.duration)}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  audioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  audioTextBlock: {
    gap: 2,
  },
  audioActionLabel: {
    fontFamily: Fonts.label,
    fontSize: 15,
    fontWeight: '700',
  },
  audioDurationLabel: {
    fontFamily: Fonts.body,
    fontSize: 12,
  },
  card: { gap: Spacing.three },
  subBlock: {
    borderWidth: 1,
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  innerSubBlock: {
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  subBlockTitle: { fontFamily: Fonts.label, fontSize: 14, fontWeight: '700' },
  subBlockHint: { fontFamily: Fonts.body, fontSize: 13 },
  mediaRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: Spacing.three,
  },
  mediaCol: { flex: 1, minWidth: 0 },
  noMediaBox: {
    flex: 1,
    width: '100%',
    minHeight: 180,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  emptyHint: { fontFamily: Fonts.body, fontSize: 13, fontStyle: 'italic' },
  headingRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two },
  txLink: { cursor: 'pointer' },
  txLinkText: { fontFamily: Fonts.label, fontSize: 12, fontWeight: '700' },
  descriptionBox: { gap: Spacing.one },
  descriptionLabel: { fontFamily: Fonts.label, fontSize: 13, fontWeight: '600' },
  description: { fontFamily: Fonts.body, fontSize: 14, lineHeight: 21 },
  actionError: { fontFamily: Fonts.body, fontSize: 13 },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.one },
});
