import type { Task, TeamMember } from '../App';

// Generate iCalendar (.ics) format
export function generateICS(tasks: Task[], teamMembers: TeamMember[]): string {
  const events = tasks.map(task => {
    const member = teamMembers.find(m => m.id === task.assignedTo);
    const dtstart = formatICSDate(task.date, task.time);
    const dtend = task.endDate 
      ? formatICSDate(task.endDate, task.time)
      : formatICSDate(task.date, task.time, true); // Add 1 hour if no end date
    
    const shiftLabels: Record<string, string> = {
      day: '데이 근무 (07:00-15:00)',
      evening: '이브닝 근무 (15:00-23:00)',
      night: '나이트 근무 (23:00-07:00)',
      off: '휴무',
    };

    const title = task.shiftType 
      ? shiftLabels[task.shiftType]
      : task.title;

    const description = [
      task.description,
      member ? `담당자: ${member.name}` : '',
      task.shiftType ? `교대 근무: ${shiftLabels[task.shiftType]}` : '',
    ].filter(Boolean).join('\\n');

    return `BEGIN:VEVENT
UID:${task.id}@nursescheduler.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeICSText(title)}
DESCRIPTION:${escapeICSText(description)}
STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}
END:VEVENT`;
  }).join('\n');

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nurse Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:간호사 근무표
X-WR-TIMEZONE:Asia/Seoul
${events}
END:VCALENDAR`;
}

function formatICSDate(date: Date, time?: string, addHour: boolean = false): string {
  const d = new Date(date);
  
  if (time) {
    const [hours, minutes] = time.split(':');
    d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  } else {
    d.setHours(0, 0, 0, 0);
  }
  
  if (addHour) {
    d.setHours(d.getHours() + 1);
  }
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  const secs = String(d.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}T${hours}${mins}${secs}`;
}

function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

// Download .ics file
export function downloadICS(tasks: Task[], teamMembers: TeamMember[], filename: string = 'nurse-schedule.ics') {
  const icsContent = generateICS(tasks, teamMembers);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}

// Generate Google Calendar URL
export function generateGoogleCalendarURL(task: Task, member?: TeamMember): string {
  const shiftLabels: Record<string, string> = {
    day: '데이 근무 (07:00-15:00)',
    evening: '이브닝 근무 (15:00-23:00)',
    night: '나이트 근무 (23:00-07:00)',
    off: '휴무',
  };

  const title = task.shiftType ? shiftLabels[task.shiftType] : task.title;
  
  const description = [
    task.description,
    member ? `담당자: ${member.name}` : '',
    task.shiftType ? `교대 근무: ${shiftLabels[task.shiftType]}` : '',
  ].filter(Boolean).join('\n');

  const startDate = new Date(task.date);
  if (task.time) {
    const [hours, minutes] = task.time.split(':');
    startDate.setHours(parseInt(hours), parseInt(minutes));
  }

  const endDate = task.endDate ? new Date(task.endDate) : new Date(startDate);
  if (task.time && !task.endDate) {
    endDate.setHours(endDate.getHours() + 1);
  }

  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    dates: `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

// Export single task to .ics
export function exportSingleTaskToICS(task: Task, member?: TeamMember) {
  const shiftLabels: Record<string, string> = {
    day: '데이 근무 (07:00-15:00)',
    evening: '이브닝 근무 (15:00-23:00)',
    night: '나이트 근무 (23:00-07:00)',
    off: '휴무',
  };

  const title = task.shiftType ? shiftLabels[task.shiftType] : task.title;
  const description = [
    task.description,
    member ? `담당자: ${member.name}` : '',
  ].filter(Boolean).join('\\n');

  const dtstart = formatICSDate(task.date, task.time);
  const dtend = task.endDate 
    ? formatICSDate(task.endDate, task.time)
    : formatICSDate(task.date, task.time, true);

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Nurse Scheduler//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:간호사 근무표
X-WR-TIMEZONE:Asia/Seoul
BEGIN:VEVENT
UID:${task.id}@nursescheduler.app
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${escapeICSText(title)}
DESCRIPTION:${escapeICSText(description)}
STATUS:${task.completed ? 'COMPLETED' : 'CONFIRMED'}
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${title.replace(/[^a-zA-Z0-9가-힣]/g, '-')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
}
