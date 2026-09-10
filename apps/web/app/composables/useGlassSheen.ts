/**
 * Padanan web dari `.glassEffect(.interactive())`: posisi kilau spekular
 * mengikuti pointer. Nilainya ditulis ke CSS custom property, jadi yang
 * berubah tiap frame hanya satu variabel — bukan layout, bukan style Vue.
 *
 * Elemennya diambil dari event, bukan dari template ref: `<component :is>`
 * bisa merender tag biasa atau komponen, dan ref pada keduanya berperilaku
 * berbeda. currentTarget selalu elemen yang benar.
 *
 * Pointer kasar (sentuh) dan prefers-reduced-motion dilewati: di sana kilau
 * ini tidak menambah apa pun, dan hover pada layar sentuh hanyalah tap.
 */
export function useGlassSheen() {
  let frame = 0;
  let node: HTMLElement | null = null;

  const enabled = () =>
    import.meta.client
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function onPointerMove(event: PointerEvent) {
    if (frame || !enabled()) return;        // satu pembaruan per frame
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;
    node = target;
    const { clientX, clientY } = event;

    frame = requestAnimationFrame(() => {
      frame = 0;
      const r = target.getBoundingClientRect();
      if (!r.width || !r.height) return;
      target.style.setProperty('--gx', `${((clientX - r.left) / r.width) * 100}%`);
      target.style.setProperty('--gy', `${((clientY - r.top) / r.height) * 100}%`);
    });
  }

  function onPointerLeave() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = 0;
    }
    node?.style.removeProperty('--gx');
    node?.style.removeProperty('--gy');
    node = null;
  }

  onBeforeUnmount(() => {
    if (frame) cancelAnimationFrame(frame);
  });

  return { onPointerMove, onPointerLeave };
}
