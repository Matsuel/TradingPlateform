import { afterEach, expect, spyOn, test } from "bun:test"
import { Logger } from "@azimut/utils"
import { kafkaLogCreator } from "@azimut/kafka"

// Niveaux de kafkajs : ERROR 1, WARN 2, INFO 4, DEBUG 5
const entry = (level: number, message: string, extra: object = {}) =>
    ({ namespace: "Consumer", level, label: "INFO", log: { message, timestamp: "2026-11-12T10:00:00.000Z", ...extra } }) as Parameters<ReturnType<typeof kafkaLogCreator>>[0]

const spies = {
    error: spyOn(Logger.prototype, "error").mockImplementation(() => {}),
    warn: spyOn(Logger.prototype, "warn").mockImplementation(() => {}),
    info: spyOn(Logger.prototype, "info").mockImplementation(() => {}),
    debug: spyOn(Logger.prototype, "debug").mockImplementation(() => {}),
}
afterEach(() => Object.values(spies).forEach((spy) => spy.mockClear()))

test("chaque niveau de kafkajs est écrit au niveau correspondant du Logger partagé", () => {
    const write = kafkaLogCreator()
    write(entry(1, "e"))
    write(entry(2, "w"))
    write(entry(4, "i"))
    write(entry(5, "d"))

    expect(spies.error).toHaveBeenCalledWith("e")
    expect(spies.warn).toHaveBeenCalledWith("w")
    expect(spies.info).toHaveBeenCalledWith("i")
    expect(spies.debug).toHaveBeenCalledWith("d")
})

test("les données du journal suivent le message, sans l'horodatage de kafkajs", () => {
    kafkaLogCreator()(entry(4, "[Consumer] Starting", { groupId: "core-backend-events" }))

    expect(spies.info).toHaveBeenCalledWith("[Consumer] Starting", { groupId: "core-backend-events" })
})

test("le composant kafkajs devient le nom du logger", () => {
    const names: string[] = []
    spies.info.mockImplementation(function (this: Logger) {
        names.push(this.name)
    })

    kafkaLogCreator()(entry(4, "x"))

    expect(names).toEqual(["kafkajs:Consumer"])
    spies.info.mockImplementation(() => {})
})
