import { browser } from "$app/environment";
import { ANIMATION } from "$lib/constants";
import { soundService } from "$lib/services/sound";

// Must match --rr-modal-close-ms in app.css (180ms). This is how long we wait
// before dialog.close() removes the element from the top layer.
const MODAL_CLOSE_DURATION = ANIMATION.MODAL.CLOSE_DURATION;

export class ModalService {
  constructor() {
    this.modalOpen = false;
    this.scrollPosition = 0;
    this.activeModal = null;
    this.handleNativeClose = null;
    this.handleCancel = null;
    this.isClosing = false;
    this.closeTimer = null;
  }

  openModal(modalId) {
    if (!browser) return;

    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Save scroll position and lock body
    this.scrollPosition = window.scrollY;
    const width = document.body.clientWidth;
    this.modalOpen = true;
    this.activeModal = modal;

    document.documentElement.classList.add("modal-active");
    document.body.classList.add("modal-active");
    document.body.style.position = "fixed";
    document.body.style.top = `-${this.scrollPosition}px`;
    document.body.style.width = `${width}px`;
    document.body.style.overflow = "hidden";

    this.handleNativeClose = () => {
      this.unlockScroll();
    };
    modal.addEventListener("close", this.handleNativeClose, { once: true });

    // Esc: route through the animated close instead of vanishing instantly.
    this.handleCancel = (event) => {
      event.preventDefault();
      this.closeModal();
    };
    modal.addEventListener("cancel", this.handleCancel);

    // Play popup sound
    soundService.playPopupSound();

    // Show the modal
    if (typeof modal.showModal === "function") {
      modal.showModal();
    }

    return modal;
  }

  closeModal() {
    // Proceed even when we didn't open the dialog ourselves (the intro modal
    // is opened raw via showModal() by firstVisitService) — any open dialog
    // still deserves the animated close.
    if (
      !browser ||
      this.isClosing ||
      (!this.modalOpen && !document.querySelector("dialog[open]"))
    ) {
      return;
    }

    this.isClosing = true;

    const openDialogs = Array.from(document.querySelectorAll("dialog[open]"));
    openDialogs.forEach((dialog) => {
      dialog.classList.add("rr-modal-closing");
    });

    const closeDelay = window.matchMedia?.("(prefers-reduced-motion: reduce)")
      .matches
      ? 0
      : MODAL_CLOSE_DURATION;

    this.closeTimer = window.setTimeout(() => {
      this.closeTimer = null;
      this.detachNativeCloseHandler();

      openDialogs.forEach((dialog) => {
        // Close (leave the top layer) BEFORE stripping the closing class, so
        // the entrance animation can never reappear for a frame.
        if (dialog && typeof dialog.close === "function" && dialog.open) {
          dialog.close();
        }
        dialog.classList.remove("rr-modal-closing");
      });

      this.isClosing = false;
      this.unlockScroll();
    }, closeDelay);
  }

  detachNativeCloseHandler() {
    if (this.activeModal && this.handleNativeClose) {
      this.activeModal.removeEventListener("close", this.handleNativeClose);
    }
    if (this.activeModal && this.handleCancel) {
      this.activeModal.removeEventListener("cancel", this.handleCancel);
    }
    this.handleNativeClose = null;
    this.handleCancel = null;
  }

  unlockScroll() {
    if (!browser) return;

    this.detachNativeCloseHandler();

    // Only restore scroll if we were the ones who locked it — a dialog opened
    // raw (outside the service) never moved the body, and scrolling to a stale
    // position would jump the page.
    const wasLocked = document.body.style.position === "fixed";

    // Restore body styles
    document.documentElement.classList.remove("modal-active");
    document.body.classList.remove("modal-active");
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.width = "";
    document.body.style.overflow = "";
    document.body.style.height = "";

    // Restore scroll position
    if (wasLocked) {
      window.scrollTo(0, this.scrollPosition);
    }

    this.modalOpen = false;
    this.activeModal = null;
  }

  isModalOpen() {
    return this.modalOpen;
  }
}

export const modalService = new ModalService();
