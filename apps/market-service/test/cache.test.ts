import { expect, test } from "bun:test"
import { TtlCache } from "../utils/cache"

test("une valeur en cache n'appelle pas le fournisseur deux fois", async () => {
    const cache = new TtlCache()
    let calls = 0
    const load = async () => ++calls

    expect(await cache.getOrLoad("k", 60_000, load)).toBe(1)
    expect(await cache.getOrLoad("k", 60_000, load)).toBe(1)
    expect(calls).toBe(1)
})

test("deux appels simultanés partagent la même requête", async () => {
    const cache = new TtlCache()
    let calls = 0
    const load = async () => {
        calls++
        await Bun.sleep(10)
        return "v"
    }

    await Promise.all([cache.getOrLoad("k", 60_000, load), cache.getOrLoad("k", 60_000, load)])

    expect(calls).toBe(1)
})

test("une entrée expirée est rechargée", async () => {
    const cache = new TtlCache()
    let calls = 0
    const load = async () => ++calls

    await cache.getOrLoad("k", 1, load)
    await Bun.sleep(5)

    expect(await cache.getOrLoad("k", 1, load)).toBe(2)
})

test("un échec n'est pas gardé : l'appel suivant réessaie", async () => {
    const cache = new TtlCache()
    let calls = 0
    const load = async () => {
        if (++calls === 1) throw new Error("yahoo down")
        return "ok"
    }

    await expect(cache.getOrLoad("k", 60_000, load)).rejects.toThrow("yahoo down")
    expect(await cache.getOrLoad("k", 60_000, load)).toBe("ok")
})

test("l'échec d'un appel ne supprime pas l'entrée plus récente de la même clé", async () => {
    const cache = new TtlCache()
    const failing = cache.getOrLoad("k", 1, async () => {
        await Bun.sleep(5)
        throw new Error("lent puis en échec")
    })
    failing.catch(() => {})
    await Bun.sleep(2)
    // L'entrée a expiré : un second appel la remplace avant l'échec du premier
    let calls = 0
    await cache.getOrLoad("k", 60_000, async () => ++calls)
    await failing.catch(() => {})

    expect(await cache.getOrLoad("k", 60_000, async () => ++calls)).toBe(1)
})

test("delete oublie une entrée", async () => {
    const cache = new TtlCache()
    let calls = 0
    await cache.getOrLoad("k", 60_000, async () => ++calls)

    cache.delete("k")

    expect(await cache.getOrLoad("k", 60_000, async () => ++calls)).toBe(2)
})
