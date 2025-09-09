export function textureUrl(rel: string) {
  const base = (import.meta as any).env?.BASE_URL || '/';
  const normBase = base.endsWith('/') ? base : base + '/';
  const normRel = rel.startsWith('/') ? rel.slice(1) : rel;
  return normBase + normRel;
}

