export function mapMessage(m: any) {
  const authorData = m.author && typeof m.author === 'object' ? m.author : null;

  return {
    id: String(m._id ?? m.id),
    createdAt: m.createdAt?.toISOString?.() ?? m.createdAt ?? null,
    text: m.text ?? '',
    readAt: m.readAt ? (m.readAt.toISOString?.() ?? m.readAt) : null,
    author: {
      id: authorData ? String(authorData._id) : String(m.author),
      name: authorData?.name ?? '',
    },
  };
}

export function hasNewMessagesForUser(sr: any, userId: string): boolean {
  return sr.messages?.some(
    (m) => !m.readAt && String(m.author) !== String(userId),
  ) ?? false;
}

export function hasNewMessagesForEmployee(sr: any): boolean {
  return sr.messages?.some(
    (m) => !m.readAt && String(m.author) === String(sr.user),
  ) ?? false;
}

export function mapChatForClientList(sr: any, clientId: string) {
  return {
    id: String(sr._id),
    createdAt: sr.createdAt?.toISOString?.() ?? sr.createdAt ?? null,
    isActive: !!sr.isActive,
    hasNewMessages: hasNewMessagesForUser(sr, clientId),
  };
}

export function mapChatForManagerList(sr: any) {
  const userData = sr.user && typeof sr.user === 'object' ? sr.user : null;

  return {
    id: String(sr._id),
    createdAt: sr.createdAt?.toISOString?.() ?? sr.createdAt ?? null,
    isActive: !!sr.isActive,
    hasNewMessages: hasNewMessagesForEmployee(sr),
    client: {
      id: String(userData?._id ?? sr.user),
      name: userData?.name ?? '',
      email: userData?.email ?? '',
      contactPhone: userData?.contactPhone ?? '',
    },
  };
}
