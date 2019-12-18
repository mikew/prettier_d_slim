declare module 'nanolru' {
  type Key = string

  interface CacheEntry<T> {
    value: T
    modified: number
    next: Key | null
    prev: Key | null
  }

  class LRU<T = unknown> {
    constructor(opts?: number | { max?: number; maxAge?: number })

    /** The number of keys currently in the cache. */
    length: number

    max: number
    maxAge: number
    cache: Record<Key, CacheEntry<T>>
    head: Key | null
    tail: Key | null

    /** Array of all the keys currently in the cache. */
    keys: string[]

    /** Clear the cache. */
    clear: () => void

    /** Remove the value from the cache. */
    remove: (key: Key) => T | undefined

    /** Query the value of the key without marking the key as most recently used. */
    peek: (key: Key) => T | undefined

    /** Set the value of the key and mark the key as most recently used. */
    set: (key: Key, value: T) => T

    /** Query the value of the key and mark the key as most recently used. */
    get: (key: Key) => T | undefined

    evict: () => void
  }

  export default LRU
}
