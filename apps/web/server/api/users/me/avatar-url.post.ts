import { AvatarUrlRequestSchema } from '@couple/contracts';
import { delay } from '../../../mocks/simulate';
import { currentUser } from '../../../utils/currentUser';
import { parseBody } from '../../../utils/validate';

/** Bentuk respons sama dengan signed upload URL Supabase di Fase 2. */
export default defineEventHandler(async (event) => {
  await delay(200);
  const me = currentUser(event);
  const body = parseBody(AvatarUrlRequestSchema, await readBody(event));
  const ext = body.mimeType.split('/')[1] ?? 'jpg';
  const storagePath = `avatars/${me.id}-${Date.now()}.${ext}`;

  return {
    uploadUrl: `/api/mock/upload?path=${encodeURIComponent(storagePath)}`,
    storagePath,
    expiresAt: new Date(Date.now() + 3600_000).toISOString(),
  };
});
