import * as path from "node:path";
import { fileURLToPath } from "node:url";

type Level = "debug" | "info" | "warn" | "error";

const levelOrder: Record<Level, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

function nowISO() {
    return new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" });
}

function normalizeModuleName(moduleUrl: string) {
    try {
        const file = fileURLToPath(moduleUrl);
        const rel = path.relative(process.cwd(), file);
        return rel || path.basename(file);
    } catch {
        return moduleUrl;
    }
}

function stringifyArg(arg: unknown) {
    if (typeof arg === "string") return arg;
    try {
        return JSON.stringify(arg);
    } catch {
        return String(arg);
    }
}

export class Logger {
    readonly name: string;
    readonly minLevel: Level;

    static here(minLevel?: Level) {
        const err = new Error();
        const stack = err.stack?.split("\n") ?? [];
        // on prend la ligne appelante (après Error + Logger.here)
        const stackLine = stack[2] ?? "";

        // Forme la plus courante : "at Object.<anonymous> (/abs/path/file.js:4:23)"
        let filePath: string | undefined;
        const matchWithParens = stackLine.match(/\((.*):\d+:\d+\)/);
        if (matchWithParens?.[1]) {
            filePath = matchWithParens[1];
        } else {
            // Autre forme possible : "at /abs/path/file.js:4:23"
            const matchNoParens = stackLine.match(/at (.*):\d+:\d+/);
            if (matchNoParens?.[1]) {
                filePath = matchNoParens[1];
            }
        }

        const absPath = filePath ?? "unknown";
        const rel = path.relative(process.cwd(), absPath) || absPath;
        return new Logger(rel, minLevel);
    }

    constructor(name: string, minLevel?: Level) {
        const envLevel = (process.env.LOG_LEVEL as Level) || "debug";
        this.name = name;
        this.minLevel = minLevel ?? envLevel;
    }

    static for(moduleUrl: string, minLevel?: Level) {
        return new Logger(normalizeModuleName(moduleUrl), minLevel);
    }

    child(suffix: string) {
        return new Logger(`${this.name}:${suffix}`, this.minLevel);
    }

    private shouldLog(level: Level) {
        return levelOrder[level] >= levelOrder[this.minLevel];
    }

    private write(level: Level, parts: unknown[]) {
        // Ne rien loguer pendant les tests (Jest)
        if (process.env.NODE_ENV === "test") return;

        if (!this.shouldLog(level)) return;

        const ts = `[${nowISO()}]`;
        const lvl = level.toUpperCase();
        const msg = parts.map(stringifyArg).join(" ");
        const line = `${ts} ${lvl} ${this.name} ${msg}`;

        console.log(line);
    }

    debug(...args: unknown[]) {
        this.write("debug", args);
    }
    info(...args: unknown[]) {
        this.write("info", args);
    }
    warn(...args: unknown[]) {
        this.write("warn", args);
    }
    error(...args: unknown[]) {
        this.write("error", args);
    }
}

export const createLogger = (name: string, minLevel?: Level) => new Logger(name, minLevel);