// lib/rateLimiter.js
// Sliding-window limiter for the Riot app rate limit.
// Defaults match a dev/personal key (20 req / 1s, 100 req / 120s); the real
// limits are read back from the X-App-Rate-Limit header after the first call.

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Riot counts from its side too, so keep a small safety margin per window
const SAFETY = 1;

export class RateLimiter {
	constructor(limits = [
		{ count: 20, windowMs: 1000 },
		{ count: 100, windowMs: 120 * 1000 },
	]) {
		this.limits = limits;
		this.stamps = [];
		this.pausedUntil = 0;
		this.chain = Promise.resolve();
	}

	// "20:1,100:120" -> [{ count: 20, windowMs: 1000 }, ...]
	update(header) {
		if (!header || this.fromHeader === header) return;
		const parsed = header
			.split(",")
			.map((part) => part.split(":").map(Number))
			.filter(([count, secs]) => count > 0 && secs > 0)
			.map(([count, secs]) => ({ count, windowMs: secs * 1000 }));
		if (parsed.length) {
			this.limits = parsed;
			this.fromHeader = header;
		}
	}

	pause(ms) {
		this.pausedUntil = Math.max(this.pausedUntil, Date.now() + ms);
	}

	// Calls are serialised through a promise chain so concurrent callers queue up
	acquire() {
		const next = this.chain.then(() => this.#waitForSlot());
		this.chain = next.catch(() => {});
		return next;
	}

	async #waitForSlot() {
		for (;;) {
			const now = Date.now();
			if (now < this.pausedUntil) {
				await sleep(this.pausedUntil - now);
				continue;
			}

			const longest = Math.max(...this.limits.map((l) => l.windowMs));
			this.stamps = this.stamps.filter((t) => t > now - longest);

			let wait = 0;
			for (const { count, windowMs } of this.limits) {
				const inWindow = this.stamps.filter((t) => t > now - windowMs);
				if (inWindow.length >= count - SAFETY) {
					wait = Math.max(wait, inWindow[0] + windowMs - now + 50);
				}
			}
			if (wait <= 0) break;
			await sleep(wait);
		}
		this.stamps.push(Date.now());
	}
}
