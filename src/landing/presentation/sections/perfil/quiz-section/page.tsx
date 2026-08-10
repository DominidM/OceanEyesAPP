import React, { useEffect, useRef, useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { Image } from 'expo-image';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AppFonts, BrandColors, MaxWidth, Spacing } from '@landing/config/theme';
import { RolMascot } from '@landing/presentation/components/rol-mascot';
import { RolTypewriter } from '@landing/presentation/components/rol-typewriter';
import { useBreakpoints } from '@landing/presentation/hooks/useBreakpoints';
import {
  emptyRolUserData,
  fetchRolRecommendation,
  fetchRolReply,
  MASCOT_IMAGES,
  MASCOT_NAME,
  ROL_STEPS,
  sendRolEmail,
} from '@shared/rol';
import type { RolEmailStatus, RolSugerido, RolUserData } from '@shared/rol';

// ============================================================
// Quiz "Descubre tu Rol" · Chat guiado por el zorro Nereo.
// Fases: bienvenida → conversación (preguntas) → resultado con
// envío por correo. Las respuestas se acumulan en un JSON que se
// envía a /api/rol (Gemini con fallback local).
// ============================================================

type Entry =
  | { kind: 'mascot'; text: string; id: number }
  | { kind: 'user'; text: string; id: number };

let entryId = 0;

const MAX_ENTRIES = 30;

const trimEntries = (list: Entry[]) =>
  list.length > MAX_ENTRIES ? list.slice(list.length - MAX_ENTRIES) : list;

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const formatAnswer = (value: string | string[]): string =>
  Array.isArray(value) ? value.join(', ') : value;

export function RolQuizSection() {
  const { isMobile } = useBreakpoints();

  const [started, setStarted] = useState(false);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [chipSelection, setChipSelection] = useState<string[]>([]);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [result, setResult] = useState<RolSugerido | null>(null);
  const [resultOpen, setResultOpen] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  const runningRef = useRef(false);
  const pendingResolve = useRef<((v: string | string[]) => void) | null>(null);
  const typeResolvers = useRef(new Map<number, () => void>());

  const pushMascot = (text: string) =>
    new Promise<void>((resolve) => {
      const id = ++entryId;
      typeResolvers.current.set(id, resolve);
      setEntries((prev) => trimEntries([...prev, { kind: 'mascot', text, id }]));
    });

  const pushUser = (text: string) =>
    setEntries((prev) => trimEntries([...prev, { kind: 'user', text, id: ++entryId }]));

  const waitForAnswer = (index: number) =>
    new Promise<string | string[]>((resolve) => {
      pendingResolve.current = resolve;
      setActiveStep(index);
    });

  const submitAnswer = (value: string | string[]) => {
    const resolve = pendingResolve.current;
    pendingResolve.current = null;
    setActiveStep(null);
    resolve?.(value);
  };

  const resetConversation = () => {
    entryId = 0;
    pendingResolve.current = null;
    typeResolvers.current.clear();
    setEntries([]);
    setActiveStep(null);
    setChipSelection([]);
    setThinking(false);
    setSpeaking(false);
    setResult(null);
    setResultOpen(false);
  };

  const run = async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    resetConversation();
    await wait(400);

    setSpeaking(true);
    await pushMascot(`¡Hola! Soy ${MASCOT_NAME}, el guardián de OceanEyes.`);
    await wait(300);
    await pushMascot(
      'Te haré unas preguntas para conocerte y descubrir qué rol del océano eres. Vamos paso a paso.',
    );
    setSpeaking(false);

    const data: RolUserData = emptyRolUserData();

    for (let i = 0; i < ROL_STEPS.length; i++) {
      const step = ROL_STEPS[i];
      const question =
        step.id === 'motivacion' && data.nombre
          ? `Última pregunta, ${data.nombre}… ¿por qué te importa el mar?`
          : step.question;
      setSpeaking(true);
      await pushMascot(question);
      setSpeaking(false);
      const answer = await waitForAnswer(i);
      (data as unknown as Record<string, string | string[]>)[step.field] = answer;
      pushUser(formatAnswer(answer));
      if (step.id === 'nombre' && typeof answer === 'string' && answer.trim()) {
        setSpeaking(true);
        await pushMascot(`¡Un gusto conocerte, ${answer.trim()}! Sigamos.`);
        setSpeaking(false);
      }
      await wait(140);
    }

    setThinking(true);
    const reply = await fetchRolReply(data, data.motivacion);
    setThinking(false);
    setSpeaking(true);
    await pushMascot(reply);
    await pushMascot('Gracias por contarme todo. Déjame analizarlo…');
    setSpeaking(false);

    setThinking(true);
    const resultado = await fetchRolRecommendation(data);
    setThinking(false);
    setResult(resultado);

    setSpeaking(true);
    await pushMascot(
      resultado.closing || `¡Listo, ${resultado.nombre}! Tu rol es ${resultado.rol}.`,
    );
    setSpeaking(false);

    runningRef.current = false;
  };

  const handleStart = () => {
    setStarted(true);
    void run();
  };

  const restart = () => {
    runningRef.current = false;
    void run();
  };

  useEffect(() => {
    setChipSelection([]);
  }, [activeStep]);

  const step = activeStep !== null ? ROL_STEPS[activeStep] : null;

  const toggleChip = (label: string, single: boolean) => {
    if (single) {
      submitAnswer(label);
      return;
    }
    setChipSelection((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  };

  const handleTextSubmit = (text: string) => {
    const value = text.trim();
    if (!value) return;
    submitAnswer(value);
  };

  const handleTypedDone = (id: number) => {
    const resolve = typeResolvers.current.get(id);
    if (resolve) {
      typeResolvers.current.delete(id);
      resolve();
    }
  };

  const mascotImage = thinking ? MASCOT_IMAGES.pensativo : MASCOT_IMAGES.charlando;

  const inputArea =
    step && activeStep !== null ? (
      <View style={styles.inputArea} key={step.id}>
        <Text style={styles.inputHint}>{step.prompt}</Text>

        {step.type === 'text' && <TextField onSubmit={handleTextSubmit} />}

        {step.type === 'multi-select' && (
          <>
            <View style={styles.chips}>
              {step.options.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  selected={chipSelection.includes(opt)}
                  onPress={() => toggleChip(opt, false)}
                />
              ))}
            </View>
            <View style={styles.inputActions}>
              <Pressable
                style={[styles.primaryBtn, chipSelection.length === 0 && styles.primaryBtnDisabled]}
                disabled={chipSelection.length === 0}
                onPress={() => submitAnswer(chipSelection)}
                hitSlop={8}
              >
                <Text style={styles.primaryBtnLabel}>Continuar</Text>
              </Pressable>
            </View>
          </>
        )}

        {step.type === 'single-select' && (
          <View style={styles.chips}>
            {step.options.map((opt) => (
              <Chip key={opt} label={opt} onPress={() => toggleChip(opt, true)} />
            ))}
          </View>
        )}
      </View>
    ) : null;

  return (
    <View style={styles.section}>
      <View style={[styles.card, isMobile && styles.cardMobile]}>
        {!started ? (
          <View style={styles.welcome}>
            <Image
              source={MASCOT_IMAGES.bienvenido}
              style={[styles.welcomeImage, isMobile && styles.welcomeImageMobile]}
              contentFit="contain"
            />
            <Text style={[styles.welcomeTitle, isMobile && styles.welcomeTitleMobile]}>Descubre tu Rol</Text>
            <Text style={styles.welcomeText}>
              Soy {MASCOT_NAME}, el guardián de OceanEyes. Respondé unas preguntas y, con la
              ayuda de inteligencia artificial, descubriremos qué personaje del océano eres y
              cómo puedes protegerlo.
            </Text>
            <Pressable style={styles.primaryBtn} onPress={handleStart} hitSlop={8}>
              <Text style={styles.primaryBtnLabel}>Comenzar</Text>
              <FontAwesome5 name="arrow-right" size={13} color="#FFFFFF" />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.mascotZone}>
              <RolMascot source={mascotImage} speaking={speaking} size={isMobile ? 110 : 140} />
              <Text style={styles.mascotName}>{MASCOT_NAME}</Text>
            </View>

            <ScrollView
              ref={scrollRef}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              onContentSizeChange={() =>
                scrollRef.current?.scrollToEnd({ animated: true })
              }
            >
              {entries.map((entry) =>
                entry.kind === 'mascot' ? (
                  <View key={entry.id} style={styles.bubbleMascot}>
                    <Image
                      source={mascotImage}
                      style={styles.avatar}
                      contentFit="contain"
                    />
                    <View style={styles.bubbleMascotBody}>
                      <RolTypewriter
                        text={entry.text}
                        style={styles.bubbleMascotText}
                        onDone={() => handleTypedDone(entry.id)}
                      />
                    </View>
                  </View>
                ) : (
                  <View key={entry.id} style={styles.bubbleUser}>
                    <Text style={styles.bubbleUserText}>{entry.text}</Text>
                  </View>
                ),
              )}

              {thinking && (
                <View style={styles.thinking}>
                  <Text style={styles.thinkingText}>{MASCOT_NAME} está escribiendo…</Text>
                </View>
              )}

              {inputArea}

              {result && !resultOpen && !thinking && activeStep === null && (
                <View style={styles.resultPrompt}>
                  <Pressable
                    style={styles.primaryBtn}
                    onPress={() => setResultOpen(true)}
                    hitSlop={8}
                  >
                    <FontAwesome5 name="water" size={13} color="#FFFFFF" />
                    <Text style={styles.primaryBtnLabel}>Ver mi rol</Text>
                  </Pressable>
                </View>
              )}

              <View style={styles.scrollSpacer} />
            </ScrollView>
          </>
        )}
      </View>

      <ResultModal
        visible={resultOpen && !!result}
        result={result}
        onClose={() => setResultOpen(false)}
        onRestart={() => {
          setResultOpen(false);
          restart();
        }}
      />
    </View>
  );
}

// ------------------------------------------------------------

function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      hitSlop={6}
    >
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function TextField({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onSubmit(value);
    setValue('');
  };

  return (
    <View style={styles.textField}>
      <TextInput
        style={styles.textInput}
        value={value}
        placeholder="Escribe aquí…"
        placeholderTextColor="rgba(44,44,44,0.45)"
        onChangeText={setValue}
        onSubmitEditing={submit}
        autoFocus
        autoComplete="off"
      />
      <Pressable
        style={[styles.primaryBtn, !value.trim() && styles.primaryBtnDisabled]}
        disabled={!value.trim()}
        onPress={submit}
        hitSlop={8}
      >
        <Text style={styles.primaryBtnLabel}>Enviar</Text>
      </Pressable>
    </View>
  );
}

function ResultModal({
  visible,
  result,
  onClose,
  onRestart,
}: {
  visible: boolean;
  result: RolSugerido | null;
  onClose: () => void;
  onRestart: () => void;
}) {
  const { isMobile } = useBreakpoints();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<RolEmailStatus | null>(null);

  if (!result) return null;

  const handleSendEmail = async () => {
    if (sending) return;
    setSending(true);
    setStatus(null);
    const emailStatus = await sendRolEmail(email, result);
    setStatus(emailStatus);
    setSending(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View style={[styles.modalCard, isMobile && styles.modalCardMobile]}>
          <Pressable style={styles.modalClose} onPress={onClose} hitSlop={10}>
            <FontAwesome5 name="times" size={14} color={BrandColors.neutral} />
          </Pressable>

          <ScrollView contentContainerStyle={[styles.modalBody, isMobile && styles.modalBodyMobile]}>
            <Image
              source={result.imagen}
              style={[styles.modalImage, isMobile && styles.modalImageMobile]}
              contentFit="contain"
            />
            <Text style={styles.modalKicker}>TU ROL ES</Text>
            <Text style={[styles.modalTitle, isMobile && styles.modalTitleMobile, { color: result.color }]}>{result.rol}</Text>
            <Text style={styles.modalTagline}>&quot;{result.tagline}&quot;</Text>

            <Text style={styles.modalPerfil}>{result.perfil}</Text>
            <Text style={styles.modalText}>{result.descripcion}</Text>

            <Text style={styles.modalLabel}>Primeros pasos</Text>
            <View style={styles.modalSteps}>
              {result.acciones.map((accion, i) => (
                <View key={accion} style={styles.modalStepRow}>
                  <View style={[styles.modalStepNum, { backgroundColor: result.color }]}>
                    <Text style={styles.modalStepNumText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.modalStepText}>{accion}</Text>
                </View>
              ))}
            </View>

            {result.closing ? (
              <>
                <Text style={styles.modalLabel}>Mensaje de {MASCOT_NAME}</Text>
                <Text style={styles.modalClosing}>{result.closing}</Text>
              </>
            ) : null}

            <Text style={styles.modalLabel}>Enviar mi rol al correo</Text>
            <View style={[styles.modalEmailRow, isMobile && styles.modalEmailRowMobile]}>
              <TextInput
                style={styles.modalEmailInput}
                placeholder="tu@correo.com"
                placeholderTextColor="rgba(44,44,44,0.45)"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
                onSubmitEditing={() => void handleSendEmail()}
                editable={!sending}
              />
              <Pressable
                style={[
                  styles.primaryBtn,
                  (sending || !email.trim()) && styles.primaryBtnDisabled,
                ]}
                disabled={sending || !email.trim()}
                onPress={() => void handleSendEmail()}
                hitSlop={8}
              >
                <FontAwesome5 name="paper-plane" size={12} color="#FFFFFF" />
                <Text style={styles.primaryBtnLabel}>
                  {sending ? 'Enviando…' : 'Enviar'}
                </Text>
              </Pressable>
            </View>
            {status && (
              <Text
                style={[styles.modalStatus, status.success ? styles.statusOk : styles.statusError]}
              >
                {status.message}
              </Text>
            )}

            <View style={styles.modalActions}>
              <Pressable style={styles.secondaryBtn} onPress={onRestart} hitSlop={8}>
                <FontAwesome5 name="redo" size={12} color={BrandColors.primary} />
                <Text style={styles.secondaryBtnLabel}>Reiniciar conversación</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ------------------------------------------------------------

const styles = StyleSheet.create({
  section: {
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.six,
    backgroundColor: BrandColors.tertiary,
  },
  card: {
    width: '100%',
    maxWidth: MaxWidth.narrow,
    height: 720,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.12)',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardMobile: {
    height: 620,
    borderRadius: 18,
  },
  welcome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.five,
    gap: Spacing.three,
  },
  welcomeImage: {
    width: 200,
    height: 200,
  },
  welcomeImageMobile: {
    width: 150,
    height: 150,
  },
  welcomeTitle: {
    fontFamily: AppFonts.headline,
    fontSize: 32,
    fontWeight: '700',
    color: BrandColors.primary,
    textAlign: 'center',
  },
  welcomeTitleMobile: {
    fontSize: 26,
  },
  welcomeText: {
    fontFamily: AppFonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: BrandColors.neutral,
    textAlign: 'center',
    maxWidth: 460,
  },
  mascotZone: {
    alignItems: 'center',
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
    gap: Spacing.half,
  },
  mascotName: {
    fontFamily: AppFonts.label,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: BrandColors.secondary,
    textTransform: 'uppercase',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.two + 2,
  },
  bubbleMascot: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
    maxWidth: '88%',
  },
  avatar: {
    width: 34,
    height: 34,
    marginTop: 4,
  },
  bubbleMascotBody: {
    flexShrink: 1,
    backgroundColor: BrandColors.tertiary,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  bubbleMascotText: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: BrandColors.neutral,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    maxWidth: '82%',
    backgroundColor: BrandColors.primary,
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
  },
  bubbleUserText: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    lineHeight: 22,
    color: '#FFFFFF',
  },
  thinking: {
    paddingVertical: Spacing.two,
  },
  thinkingText: {
    fontFamily: AppFonts.body,
    fontSize: 13,
    fontStyle: 'italic',
    color: BrandColors.secondary,
  },
  inputArea: {
    marginTop: Spacing.two,
    gap: Spacing.two + 2,
  },
  inputHint: {
    fontFamily: AppFonts.body,
    fontSize: 13,
    color: BrandColors.secondary,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    maxWidth: '100%',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.3)',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    backgroundColor: '#FFFFFF',
  },
  chipSelected: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  chipLabel: {
    fontFamily: AppFonts.label,
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.primary,
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  inputActions: {
    alignItems: 'flex-end',
  },
  textField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  textInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: AppFonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.3)',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    outlineWidth: 0,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: BrandColors.primary,
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
  },
  primaryBtnDisabled: {
    opacity: 0.45,
  },
  primaryBtnLabel: {
    fontFamily: AppFonts.label,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.3)',
    borderRadius: 999,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two + 2,
  },
  secondaryBtnLabel: {
    fontFamily: AppFonts.label,
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  resultPrompt: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
  },
  scrollSpacer: {
    height: Spacing.four,
  },
  modalOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  modalCardMobile: {
    maxHeight: '96%',
    borderRadius: 18,
  },
  modalClose: {
    position: 'absolute',
    top: Spacing.three,
    right: Spacing.three,
    zIndex: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.tertiary,
  },
  modalBody: {
    alignItems: 'center',
    paddingHorizontal: Spacing.five,
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  modalBodyMobile: {
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.four,
  },
  modalImage: {
    width: 200,
    height: 200,
  },
  modalImageMobile: {
    width: 150,
    height: 150,
  },
  modalKicker: {
    fontFamily: AppFonts.label,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    color: BrandColors.secondary,
  },
  modalTitle: {
    fontFamily: AppFonts.headline,
    fontSize: 34,
    fontWeight: '700',
    textAlign: 'center',
  },
  modalTitleMobile: {
    fontSize: 27,
  },
  modalTagline: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    fontStyle: 'italic',
    color: BrandColors.neutral,
    textAlign: 'center',
  },
  modalPerfil: {
    fontFamily: AppFonts.body,
    fontSize: 15,
    lineHeight: 23,
    color: BrandColors.neutral,
    textAlign: 'center',
    marginTop: Spacing.two,
  },
  modalText: {
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(44,44,44,0.75)',
    textAlign: 'center',
  },
  modalLabel: {
    alignSelf: 'flex-start',
    fontFamily: AppFonts.label,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: BrandColors.secondary,
    marginTop: Spacing.three,
  },
  modalSteps: {
    alignSelf: 'stretch',
    gap: Spacing.two,
  },
  modalStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  modalStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  modalStepNumText: {
    fontFamily: AppFonts.label,
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalStepText: {
    flex: 1,
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    color: BrandColors.neutral,
  },
  modalClosing: {
    alignSelf: 'stretch',
    fontFamily: AppFonts.body,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
    color: BrandColors.primary,
  },
  modalEmailRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  modalEmailRowMobile: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  modalEmailInput: {
    flex: 1,
    minWidth: 0,
    fontFamily: AppFonts.body,
    fontSize: 15,
    color: BrandColors.neutral,
    borderWidth: 1,
    borderColor: 'rgba(19, 78, 94, 0.3)',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two + 2,
    outlineWidth: 0,
  },
  modalStatus: {
    alignSelf: 'stretch',
    fontFamily: AppFonts.body,
    fontSize: 13,
    marginTop: Spacing.two,
  },
  statusOk: {
    color: '#2E8B6F',
  },
  statusError: {
    color: '#C0392B',
  },
  modalActions: {
    alignSelf: 'stretch',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
});
