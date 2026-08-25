/**
 * Composable para calcular de forma reactiva y consistente el estado del ciclo de vida
 * de una actividad: Programada, En curso, Finalizada o Cancelada.
 */

export interface EventStatusInfo {
  code: 'scheduled' | 'ongoing' | 'finished' | 'cancelled';
  label: string;
  className: string;
  badgeClass: string;
  canRegister: boolean;
  isPast: boolean;
}

export function parseEventDateTime(fechaStr?: string, horaStr?: string): { start: Date; end: Date } | null {
  if (!fechaStr) return null;
  const baseDate = new Date(fechaStr);
  if (isNaN(baseDate.getTime())) return null;

  const start = new Date(baseDate);
  const end = new Date(baseDate);

  if (horaStr) {
    const match = horaStr.toLowerCase().trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/);
    if (match) {
      let horas = parseInt(match[1], 10);
      const minutos = parseInt(match[2], 10);
      const meridiano = match[3];

      if (meridiano === 'pm' && horas < 12) horas += 12;
      if (meridiano === 'am' && horas === 12) horas = 0;

      start.setHours(horas, minutos, 0, 0);
      // Por defecto estimamos una duración de 2 horas para eventos comunitarios
      end.setHours(horas + 2, minutos, 0, 0);
      return { start, end };
    }
  }

  // Si no hay hora específica, el evento cubre el día completo
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

export function getEventStatus(
  status?: string,
  date?: string,
  time?: string
): EventStatusInfo {
  if (status === 'cancelled') {
    return {
      code: 'cancelled',
      label: 'Cancelada',
      className: 'status-pill--cancelled',
      badgeClass: 'dossier-status--cancelled',
      canRegister: false,
      isPast: false,
    };
  }

  if (status === 'finished') {
    return {
      code: 'finished',
      label: 'Finalizada',
      className: 'status-pill--finished',
      badgeClass: 'dossier-status--finished',
      canRegister: false,
      isPast: true,
    };
  }

  const times = parseEventDateTime(date, time);
  if (!times) {
    return {
      code: 'scheduled',
      label: 'Programada',
      className: 'status-pill--scheduled',
      badgeClass: 'dossier-status--scheduled',
      canRegister: true,
      isPast: false,
    };
  }

  const now = new Date();

  // 1. Si la fecha y hora de fin ya pasaron -> Finalizada
  if (now > times.end) {
    return {
      code: 'finished',
      label: 'Finalizada',
      className: 'status-pill--finished',
      badgeClass: 'dossier-status--finished',
      canRegister: false,
      isPast: true,
    };
  }

  // 2. Si estamos dentro de la ventana del evento (desde la hora de inicio hasta el fin) -> En curso
  if (now >= times.start && now <= times.end) {
    return {
      code: 'ongoing',
      label: 'En curso',
      className: 'status-pill--ongoing',
      badgeClass: 'dossier-status--ongoing',
      canRegister: false,
      isPast: false,
    };
  }

  // 3. Si aún no ha llegado la hora de inicio -> Programada
  return {
    code: 'scheduled',
    label: 'Programada',
    className: 'status-pill--scheduled',
    badgeClass: 'dossier-status--scheduled',
    canRegister: true,
    isPast: false,
  };
}
