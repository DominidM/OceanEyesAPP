import type { User } from 'firebase/auth';

import type { ReportDb } from '@/modules/reports/infrastructure/adapters';
import type { BanVerdict } from '@/shared/identity/ban-context';
import type { UserProfile } from '@/shared/firebase/types';
import { ViewModel } from '@/shared/viewmodels/view-model';

import type { CaptureMedia } from '../sections/media-preview';
import type { ReportLocation } from '../sections/location-step';
import type { IncidentSelection, ReportAudio } from '../sections/incident-step';

export const TOTAL_STEPS = 5;

export type ReportCreateDeps = {
  db: ReportDb;
  online: boolean;
  verdict: BanVerdict;
  profile: UserProfile | null;
  user: User | null;
  isGuest: boolean;
  onExit: () => void;
};

export type ReportCreateState = {
  step: number;
  dni: string;
  consent: boolean;
  anonymous: boolean;
  media: CaptureMedia | null;
  location: ReportLocation | null;
  incident: IncidentSelection['incident'] | null;
  audio: ReportAudio | null;
  sending: boolean;
  sendError: string;
  queued: boolean;
  submitted: boolean;
  createdAt: Date;
};

function createInitialState(): ReportCreateState {
  return {
    step: 1,
    dni: '',
    consent: false,
    anonymous: true,
    media: null,
    location: null,
    incident: null,
    audio: null,
    sending: false,
    sendError: '',
    queued: false,
    submitted: false,
    createdAt: new Date(),
  };
}

export class ReportCreateViewModel extends ViewModel<ReportCreateState, ReportCreateDeps> {
  constructor(deps: ReportCreateDeps) {
    super(createInitialState(), deps);
  }

  get profileDni(): string {
    const dni = this.deps.profile?.dni;
    return dni && /^\d{8}$/.test(dni) ? dni : '';
  }

  get hasDni(): boolean {
    return Boolean(this.profileDni);
  }

  get canContinue(): boolean {
    const { consent, anonymous, dni } = this.state;
    return consent && (anonymous || dni.length === 8);
  }

  get progress(): number {
    return this.state.step * 20;
  }

  goToStep = (step: number) => {
    this.setState({ step: Math.min(Math.max(step, 1), TOTAL_STEPS) });
  };

  next = () => {
    this.goToStep(this.state.step + 1);
  };

  back = () => {
    this.goToStep(this.state.step - 1);
  };

  override sync(): void {
    const { profile, isGuest } = this.deps;
    const profileDni = profile?.dni && /^\d{8}$/.test(profile.dni) ? profile.dni : '';
    if (profileDni && this.state.dni !== profileDni) {
      this.setState({ dni: profileDni });
      return;
    }
    if (isGuest && !this.state.anonymous) {
      this.setState({ anonymous: true });
    }
  }

  setDni = (value: string) => {
    this.setState({ dni: value.replace(/\D/g, '') });
  };

  toggleConsent = () => {
    this.setState({ consent: !this.state.consent });
  };

  toggleAnonymous = () => {
    this.setState({ anonymous: !this.state.anonymous });
  };

  setMedia = (media: CaptureMedia) => {
    this.setState({ media });
  };

  confirmLocation = (location: ReportLocation) => {
    this.setState({ location, step: 4 });
  };

  continueIncident = (selection: IncidentSelection) => {
    this.setState({ incident: selection.incident, audio: selection.audio, step: 5 });
  };

  exit = () => {
    this.deps.onExit();
  };

  send = async () => {
    const { incident, anonymous, location, media, sending } = this.state;
    if (!incident || sending) return;
    if (this.deps.verdict !== 'ok') {
      this.setState({ sendError: 'Tu cuenta o dispositivo está bloqueado para enviar reportes.' });
      return;
    }
    this.setState({ sendError: '', sending: true });
    try {
      const result = await this.deps.db.submit(
        {
          category: incident.id,
          title: incident.label,
          isAnonymous: anonymous,
          location:
            location?.latitude != null && location.longitude != null
              ? { latitude: location.latitude, longitude: location.longitude, address: location.placeName ?? undefined }
              : undefined,
          customIcon: incident.iconKey,
          media: media ? [{ uri: media.uri, kind: media.type }] : [],
        },
        { online: this.deps.online },
      );
      this.setState({ queued: result.queued, submitted: true });
    } catch {
      this.setState({ sendError: 'No se pudo guardar el reporte. Revisa tu conexión e inténtalo nuevamente.' });
    } finally {
      this.setState({ sending: false });
    }
  };

  reset = () => {
    this.setState(createInitialState());
  };
}
