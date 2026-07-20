import { browser } from "$app/environment";
import { writable } from "svelte/store";
import { StorageUtils } from "../infrastructure/storageUtils";
import { STORAGE_KEYS } from "../../constants";

// Store to track first visit status
export const isFirstVisit = writable(false);

export class FirstVisitService {
  constructor() {
    this.debug = false;
  }

  setDebug(value) {
    this.debug = !!value;
  }

  log(message) {
    if (this.debug) {
      console.log(`[FirstVisitService] ${message}`);
    }
  }

  checkFirstVisit() {
    if (!browser) return false;

    const hasSeenIntro = StorageUtils.getItem(STORAGE_KEYS.FIRST_VISIT);
    const firstVisit = !hasSeenIntro;

    this.log(`Checking first visit: ${firstVisit}`);
    isFirstVisit.set(firstVisit);

    return firstVisit;
  }

  markIntroAsSeen() {
    if (!browser) return;

    StorageUtils.setItem(STORAGE_KEYS.FIRST_VISIT, "true");
    isFirstVisit.set(false);
    this.log("Marked intro as seen in localStorage");
  }

}

export const firstVisitService = new FirstVisitService();
