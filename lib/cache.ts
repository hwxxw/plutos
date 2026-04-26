/** 모듈 레벨 TTL 인메모리 캐시. 서버 재시작 시 초기화. */
export class TtlCache<V> {
  private readonly map = new Map<string, { v: V; exp: number }>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxSize: number = 500,
  ) {}

  get(key: string): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.exp < Date.now()) { this.map.delete(key); return undefined; }
    return entry.v;
  }

  set(key: string, value: V): void {
    if (this.map.size >= this.maxSize) {
      const first = this.map.keys().next().value;
      if (first !== undefined) this.map.delete(first);
    }
    this.map.set(key, { v: value, exp: Date.now() + this.ttlMs });
  }

  delete(key: string): void { this.map.delete(key); }
  has(key: string): boolean { return this.get(key) !== undefined; }
  get size(): number { return this.map.size; }
}
