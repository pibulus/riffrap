/**
 * Pointer-based reordering for the lyrics collection.
 *
 * Replaces the old HTML5 drag-and-drop implementation (dragDropManager.js).
 * Two things were wrong with that one:
 *
 *   1. HTML5 `dragstart`/`dragover`/`drop` events DO NOT FIRE ON TOUCH
 *      DEVICES. Reordering was silently impossible on every phone.
 *   2. Making the whole card `draggable="true"` meant the browser claimed
 *      pointer-down from the card's own click-to-edit handler, so tapping a
 *      lyric to edit it fought with the drag.
 *
 * Pointer Events fix both: one code path for mouse, touch and pen, bound to a
 * dedicated grab handle so the card body is free to mean "edit" and nothing
 * else.
 */

const ITEM_SELECTOR = ".snippet-item";
const DROP_CLASSES = ["drag-over", "drop-above", "drop-below"];

/**
 * @param {Function} findItemById - id -> index, used to decide above/below
 * @param {Function} reorderItems - (sourceId, targetId) => void
 * @param {Function} showNotification - (message) => void
 * @param {Object} [sounds] - { onGrab, onDrop } audio hooks
 */
export function initPointerReorder(
  findItemById,
  reorderItems,
  showNotification,
  sounds = {},
) {
  let sourceId = null;
  let pointerId = null;

  function clearDropMarks() {
    if (typeof document === "undefined") return;
    document
      .querySelectorAll(`${ITEM_SELECTOR}.drag-over`)
      .forEach((element) => element.classList.remove(...DROP_CLASSES));
  }

  function elementFor(id) {
    if (typeof document === "undefined") return null;
    return document.querySelector(`${ITEM_SELECTOR}[data-id="${id}"]`);
  }

  /** Which snippet is under the pointer right now, if any. */
  function targetIdAt(clientX, clientY) {
    if (typeof document === "undefined") return null;
    const element = document.elementFromPoint(clientX, clientY);
    const item = element?.closest?.(ITEM_SELECTOR);
    return item?.dataset?.id ?? null;
  }

  function markTarget(targetId) {
    clearDropMarks();
    if (!targetId || targetId === sourceId) return;

    const element = elementFor(targetId);
    if (!element) return;

    element.classList.add("drag-over");
    element.classList.add(
      findItemById(sourceId) < findItemById(targetId)
        ? "drop-below"
        : "drop-above",
    );
  }

  function handleMove(event) {
    if (event.pointerId !== pointerId) return;
    // Stops the page scrolling underneath a finger that is dragging a card.
    event.preventDefault();
    markTarget(targetIdAt(event.clientX, event.clientY));
  }

  function handleUp(event) {
    if (event.pointerId !== pointerId) return;

    const targetId = targetIdAt(event.clientX, event.clientY);
    const draggedId = sourceId;

    finish();

    if (!draggedId || !targetId || draggedId === targetId) return;

    sounds.onDrop?.();
    reorderItems(draggedId, targetId);
    showNotification("Lyrics reordered");

    // Land with a bump so the eye can follow where the card went.
    requestAnimationFrame(() => {
      const element = elementFor(draggedId);
      if (!element) return;
      element.classList.add("snap-animation");
      setTimeout(() => element.classList.remove("snap-animation"), 500);
    });
  }

  function finish() {
    clearDropMarks();
    elementFor(sourceId)?.classList.remove("dragging");

    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", finish);
    }
    if (typeof document !== "undefined") {
      document.body.classList.remove("snippets-reordering");
    }

    sourceId = null;
    pointerId = null;
  }

  /**
   * Bound to the grab handle's `pointerdown`. This is the ONLY entry point
   * into reordering — nothing else starts a drag.
   *
   * @param {PointerEvent} event
   * @param {string} id - snippet being grabbed
   */
  function handleGrabStart(event, id) {
    if (sourceId) return;
    event.preventDefault();
    event.stopPropagation();

    sourceId = id;
    pointerId = event.pointerId;

    elementFor(id)?.classList.add("dragging");
    if (typeof document !== "undefined") {
      document.body.classList.add("snippets-reordering");
    }
    sounds.onGrab?.();

    // ponytail: no edge auto-scroll — you can only drop onto a card you can
    // see. Add it if collections routinely outgrow one screen on a phone.
    window.addEventListener("pointermove", handleMove, { passive: false });
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", finish);
  }

  return { handleGrabStart, isDragging: () => sourceId !== null };
}
