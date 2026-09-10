import { MemoryUploadUrlSchema } from '@couple/contracts';
import { delay } from '../../mocks/simulate';
import { currentCouple } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';

/**
 * Fase 2: supabase.storage.createSignedUploadUrl(`${coupleId}/${uuid}.${ext}`).
 * Bentuk respons sengaja dibuat sama sekarang supaya komponen upload tidak berubah.
 */
export default defineEventHandler(async (event) => {
  await delay(250);
  const { couple } = currentCouple(event);
  const body = parseBody(MemoryUploadUrlSchema, await readBody(event));

  return {
    uploads: body.files.map((f, i) => {
      const ext = f.mimeType.split('/')[1] ?? 'jpg';
      const storagePath = `${couple.id}/${Date.now()}-${i}.${ext}`;
      return {
        uploadUrl: `/api/mock/upload?path=${encodeURIComponent(storagePath)}`,
        storagePath,
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      };
    }),
  };
});
