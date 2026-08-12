import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";

import { AdminShell } from "@admin/layout/admin-shell";
import { Card, SectionHeader } from "@admin/presentation/components/ui";
import { RealTimeReportsMap } from "@admin/presentation/components/reports/real-time-reports-map";
import { useAdminTheme } from "@admin/theme/context";
import { AppFonts as Fonts, Spacing } from "@admin/config/theme";
import { subscribeAllReports } from "@/shared/firebase/reports";
import type { Report } from "@/shared/firebase/types";

type MapFilter = "todos" | "pendientes" | "clasificados" | "resueltos";

const FILTERS: { key: MapFilter; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendientes", label: "Pendientes" },
  { key: "clasificados", label: "Clasificados" },
  { key: "resueltos", label: "Resueltos" },
];

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentWeekRange(): { start: string; end: string } {
  const now = new Date();
  const diffToMonday = (now.getDay() + 6) % 7;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diffToMonday);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { start: toDateInputValue(monday), end: toDateInputValue(sunday) };
}

export function ReportsMapScreen() {
  const { colors } = useAdminTheme();
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<MapFilter>("todos");
  const [startDate, setStartDate] = useState(getCurrentWeekRange().start);
  const [endDate, setEndDate] = useState(getCurrentWeekRange().end);

  useEffect(() => subscribeAllReports(setReports), []);

  const invalidRange = !!startDate && !!endDate && startDate > endDate;
  const located = useMemo(
    () =>
      reports.filter((report) => {
        if (!report.location) return false;
        const createdAt = report.createdAt?.toDate?.();
        if (
          startDate &&
          (!createdAt || createdAt < new Date(`${startDate}T00:00:00`))
        )
          return false;
        if (
          endDate &&
          (!createdAt || createdAt > new Date(`${endDate}T23:59:59.999`))
        )
          return false;
        if (filter === "pendientes") return report.status === "pendiente";
        if (filter === "clasificados") return report.status === "en_revision";
        if (filter === "resueltos")
          return (
            report.status === "verificado" || report.status === "descartado"
          );
        return true;
      }),
    [reports, filter, startDate, endDate],
  );

  return (
    <AdminShell
      title="Mapa en tiempo real"
      breadcrumb={[{ label: "Mapa en tiempo real" }]}
    >
      <SectionHeader
        title="Mapa de reportes"
        subtitle={`${located.length} de ${reports.filter((report) => report.location).length} reportes con ubicación`}
      />
      <Card style={styles.card}>
        <View style={styles.filterBar}>
          <View style={[styles.filterCol, { flex: 2 }]}>
            <View style={styles.dateFilters}>
              <View style={styles.dateField}>
                <Text
                  style={[styles.dateLabel, { color: colors.contentTextMuted }]}
                >
                  Fecha de inicio
                </Text>
                <input
                  type="date"
                  value={startDate}
                  max={endDate || undefined}
                  onChange={(event) => setStartDate(event.currentTarget.value)}
                  style={{
                    ...dateInputStyle,
                    color: colors.contentText,
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.appBg,
                  }}
                />
              </View>
              <View style={styles.dateField}>
                <Text
                  style={[styles.dateLabel, { color: colors.contentTextMuted }]}
                >
                  Fecha límite
                </Text>
                <input
                  type="date"
                  value={endDate}
                  min={startDate || undefined}
                  onChange={(event) => setEndDate(event.currentTarget.value)}
                  style={{
                    ...dateInputStyle,
                    color: colors.contentText,
                    borderColor: colors.cardBorder,
                    backgroundColor: colors.appBg,
                  }}
                />
              </View>
            </View>
          </View>

          <Text style={[styles.rowSep, { color: colors.cardBorder }]}>|</Text>

          <View style={[styles.filterCol, { flex: 3 }]}>
            <Text
              style={[styles.filterLabel, { color: colors.contentTextMuted }]}
            >
              Estado
            </Text>
            <View style={styles.statusList}>
              {FILTERS.map((item) => {
                const active = filter === item.key;
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => setFilter(item.key)}
                    style={[
                      styles.tag,
                      {
                        borderColor: active
                          ? colors.primary
                          : colors.cardBorder,
                        backgroundColor: active
                          ? colors.primary
                          : "transparent",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        {
                          color: active
                            ? colors.primaryText
                            : colors.contentText,
                        },
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {(startDate || endDate) && (
            <>
              <Text style={[styles.rowSep, { color: colors.cardBorder }]}>
                |
              </Text>
              <View
                style={[
                  styles.filterCol,
                  { flex: 1, justifyContent: "flex-end" },
                ]}
              >
                <Pressable
                  onPress={() => {
                    setStartDate("");
                    setEndDate("");
                  }}
                  style={[styles.clearBtn, { borderColor: colors.cardBorder }]}
                >
                  <Text
                    style={[styles.clearBtnText, { color: colors.primary }]}
                  >
                    Limpiar fechas
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>

        {invalidRange && (
          <Text style={styles.rangeError}>
            La fecha límite no puede ser anterior a la fecha de inicio.
          </Text>
        )}
        <RealTimeReportsMap
          reports={located}
          onSelectReport={(report) =>
            router.push({
              pathname: "/admin/reports/[id]",
              params: { id: report.id },
            })
          }
        />
        <Text style={[styles.help, { color: colors.contentTextMuted }]}>
          Pasá el mouse sobre un marcador para ver el detalle. Hacé clic para
          fijar la vista.
        </Text>
      </Card>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  card: { gap: Spacing.three, overflow: "hidden" },
  filterBar: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: Spacing.three,
  },
  filterCol: { gap: Spacing.two },
  filterLabel: { fontFamily: Fonts.body, fontSize: 13, fontWeight: "700" },
  rowSep: {
    fontFamily: Fonts.body,
    fontSize: 18,
    fontWeight: "300",
    alignSelf: "center",
  },
  statusList: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  tag: {
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 12,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  tagText: { fontFamily: Fonts.body, fontSize: 13, fontWeight: "700" },
  dateFilters: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: Spacing.three,
  },
  dateField: { minWidth: 170, gap: Spacing.one },
  dateLabel: { fontFamily: Fonts.body, fontSize: 13, fontWeight: "600" },
  clearBtn: {
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  clearBtnText: { fontFamily: Fonts.body, fontSize: 13, fontWeight: "700" },
  rangeError: { color: "#DC2626", fontFamily: Fonts.body, fontSize: 13 },
  help: { fontFamily: Fonts.body, fontSize: 13 },
});

const dateInputStyle: React.CSSProperties = {
  height: 42,
  width: "100%",
  borderWidth: 1,
  borderStyle: "solid",
  borderRadius: 10,
  padding: "0 10px",
  fontFamily: Fonts.body,
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
};
