import { CreateMemorySchema } from '@couple/contracts';
import { db, uid } from '../../mocks/db';
import { toMemory } from '../../mocks/map';
import { delay, fail, maybeFail } from '../../mocks/simulate';
import { currentCouple, failRate } from '../../utils/currentUser';
import { parseBody } from '../../utils/validate';
import { nowIso, serverLocalDate } from '../../utils/clock';
import { touchStreak } from '../../utils/streak';

export default defineEventHandler(async (event) => {
  await delay();
  maybeFail(failRate(event));
  const { me, couple } = currentCouple(event);
  const body = parseBody(CreateMemorySchema, await readBody(event));

  // §8 langkah 6: prefix path wajib == coupleId, kalau tidak klien bisa
  // mengklaim objek milik couple lain.
  for (const md of body.media) {
    if (!md.storagePath.startsWith(`${couple.id}/`)) {
      fail(403, 'STORAGE_PATH_FORBIDDEN', 'Path media tidak valid.');
    }
  }

  const row = {
    id: uid(),
    coupleId: couple.id,
    type: body.type,
    caption: body.caption,
    happenedAt: body.happenedAt,
    location: body.location,
    isFavorite: false,
    createdById: me.id,
    createdAt: nowIso(),
    media: body.media.map((md, i) => ({
      id: uid(),
      storagePath: md.storagePath,
      width: md.width,
      height: md.height,
    })),
  };
  db.memories.unshift(row);
  touchStreak(couple, serverLocalDate(couple.timezone));

  setResponseStatus(event, 201);
  return toMemory(row);
});
