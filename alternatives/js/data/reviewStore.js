// Prototype-only review decisions. Seeded statuses come from data/alternatives.json;
// anything the user changes is kept in localStorage as an override, so "Reset demo data"
// simply forgets the overrides. "approved_for_demo" is a UI state, not a certification.

import { isEligible, pairKey } from '../domain/matching.js';

export const REVIEW_STORAGE_KEY = 'parity.reviews.v1';

function browserStorage() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

export function createReviewStore({ storage = browserStorage(), key = REVIEW_STORAGE_KEY, now = () => new Date().toISOString() } = {}) {
  const listeners = new Set();
  let overrides = read();

  function read() {
    try {
      const parsed = JSON.parse(storage?.getItem(key) ?? '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
      return {};
    }
  }
  function write() {
    try { storage?.setItem(key, JSON.stringify(overrides)); } catch { /* storage full or blocked: keep in memory */ }
    for (const fn of listeners) fn();
  }

  function effective(sourceProductId, candidateProductId, seed = null) {
    const o = overrides[pairKey(sourceProductId, candidateProductId)];
    return {
      sourceProductId,
      candidateProductId,
      reviewStatus: o?.reviewStatus ?? seed?.reviewStatus ?? 'pending',
      reviewNote: o && 'reviewNote' in o ? o.reviewNote : seed?.reviewNote ?? null,
      reviewedAt: o && 'reviewedAt' in o ? o.reviewedAt : seed?.reviewedAt ?? null,
      changedLocally: Boolean(o),
      inQueue: Boolean(o || seed),
    };
  }

  return {
    get: effective,

    setStatus(sourceProductId, candidateProductId, status, { classification, seed = null } = {}) {
      if (!['pending', 'approved_for_demo', 'rejected'].includes(status)) throw new Error(`Unknown review status ${status}`);
      if (status === 'approved_for_demo' && !isEligible(classification)) {
        throw new Error('Only potential or conditional alternatives can be approved for demo review.');
      }
      const k = pairKey(sourceProductId, candidateProductId);
      const prev = effective(sourceProductId, candidateProductId, seed);
      overrides[k] = {
        sourceProductId,
        candidateProductId,
        reviewStatus: status,
        reviewNote: prev.reviewNote,
        reviewedAt: status === 'pending' ? null : now(),
      };
      write();
      return effective(sourceProductId, candidateProductId, seed);
    },

    setNote(sourceProductId, candidateProductId, note, { seed = null } = {}) {
      const k = pairKey(sourceProductId, candidateProductId);
      const prev = effective(sourceProductId, candidateProductId, seed);
      const text = String(note ?? '').trim().slice(0, 600);
      overrides[k] = {
        sourceProductId,
        candidateProductId,
        reviewStatus: prev.reviewStatus,
        reviewNote: text || null,
        reviewedAt: prev.reviewedAt,
      };
      write();
      return effective(sourceProductId, candidateProductId, seed);
    },

    // Pairs that only exist locally (reviewed from a live search, not seeded).
    localPairs() {
      return Object.values(overrides).map((o) => ({ sourceProductId: o.sourceProductId, candidateProductId: o.candidateProductId }));
    },

    reset() {
      overrides = {};
      try { storage?.removeItem(key); } catch { /* ignore */ }
      for (const fn of listeners) fn();
    },

    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
