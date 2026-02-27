/**
 * Generate a vCard (.vcf) string from profile data
 */
export interface VCardData {
  fullName: string;
  displayName?: string | null;
  designation?: string | null;
  organization?: string | null;
  headline?: string | null;
  location?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  socialLinks?: Record<string, string> | null;
  avatarUrl?: string | null;
  profileUrl: string;
}

export function generateVCard(data: VCardData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.fullName}`,
    `N:${data.fullName};;;;`,
  ];

  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.designation) lines.push(`TITLE:${data.designation}`);
  if (data.headline) lines.push(`NOTE:${data.headline}`);
  if (data.email) lines.push(`EMAIL;TYPE=WORK:${data.email}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.website) lines.push(`URL;TYPE=WORK:${data.website}`);
  if (data.location) lines.push(`ADR;TYPE=WORK:;;${data.location};;;;`);
  if (data.profileUrl) lines.push(`URL;TYPE=FindOO:${data.profileUrl}`);

  if (data.socialLinks) {
    Object.entries(data.socialLinks).forEach(([key, url]) => {
      if (url) lines.push(`URL;TYPE=${key}:${url}`);
    });
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(vcardString: string, fileName: string) {
  const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
