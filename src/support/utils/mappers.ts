type UserLite = { _id: string; name: string; email?: string; contactPhone?: string };

export function mapMessage(m: any, author?: UserLite) {
  return {
    id: String(m._id ?? m.id),
    createdAt: m.createdAt?.toISOString?.() ?? m.createdAt ?? null,
    text: m.text ?? '',
    readAt: m.readAt ? (m.readAt.toISOString?.() ?? m.readAt) : null,
    author: author
      ? { id: String(author._id), name: author.name }
      : { id: String(m.author), name: '' },
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

export function mapChatForManagerList(sr: any, client?: UserLite) {
  return {
    id: String(sr._id),
    createdAt: sr.createdAt?.toISOString?.() ?? sr.createdAt ?? null,
    isActive: !!sr.isActive,
    hasNewMessages: hasNewMessagesForEmployee(sr),
    client: client
      ? {
        id: String(client._id),
        name: client.name,
        email: client.email ?? '',
        contactPhone: client.contactPhone ?? '',
      }
      : {
        id: String(sr.user),
        name: '',
        email: '',
        contactPhone: '',
      },
  };
}
