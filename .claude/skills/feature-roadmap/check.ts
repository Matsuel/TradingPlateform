// Contrôle d'un dossier roadmap/<NN>-<slug> : bun .claude/skills/feature-roadmap/check.ts roadmap/<NN>-<slug>
import { join } from "node:path";

const dir = Bun.argv[2];
if (!dir) {
    console.error("Usage : bun .claude/skills/feature-roadmap/check.ts roadmap/<NN>-<slug>");
    process.exit(2);
}

const errors: string[] = [];
const read = async (name: string) => {
    const file = Bun.file(join(dir, name));
    if (!(await file.exists())) {
        errors.push(`${name} manquant`);
        return "";
    }
    return file.text();
};

const [readme, us, tasks] = await Promise.all([read("README.md"), read("US.md"), read("TASKS.md")]);

const cells = (line: string) => line.split("|").slice(1, -1).map((cell) => cell.trim());
const lines = tasks.split("\n");
const headerIndex = lines.findIndex((line) => line.startsWith("| Tâche |"));
if (headerIndex === -1) errors.push("TASKS.md : tableau de synthèse introuvable (en-tête « | Tâche | »)");

const header = headerIndex === -1 ? [] : cells(lines[headerIndex]!);
const column = (name: string) => header.indexOf(name);
const rows = lines
    .slice(headerIndex + 2)
    .filter((line) => line.startsWith("| T-"))
    .map(cells);

const ids = new Set(rows.map((row) => row[0]!));
const deps = new Map<string, string[]>();
let sum = 0;

for (const row of rows) {
    const id = row[0]!;
    const points = Number(row[column("Points")]?.replace(/\D.*$/, ""));
    if (!Number.isInteger(points) || points <= 0) errors.push(`${id} : points invalides`);
    else sum += points;

    const list = (row[column("Dépend de")] ?? "")
        .split(",")
        .map((dep) => dep.trim())
        .filter((dep) => dep && dep !== "—");
    for (const dep of list) if (!ids.has(dep)) errors.push(`${id} : dépendance inconnue ${dep}`);
    deps.set(id, list);

    if (!new RegExp(`^### ${id} `, "m").test(tasks)) errors.push(`${id} : section détaillée « ### ${id} · … » absente`);
}

const total = Number(tasks.match(/\*\*Total\*\*\s*:\s*(\d+)/)?.[1]);
if (total !== sum) errors.push(`Total annoncé ${total} ≠ somme des points ${sum}`);

// Cycle : parcours en profondeur, « visiting » = pile courante
const state = new Map<string, "visiting" | "done">();
const visit = (id: string, path: string[]) => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") {
        errors.push(`Cycle de dépendances : ${[...path, id].join(" → ")}`);
        return;
    }
    state.set(id, "visiting");
    for (const dep of deps.get(id) ?? []) visit(dep, [...path, id]);
    state.set(id, "done");
};
for (const id of ids) visit(id, []);

const usIds = [...us.matchAll(/^#### (US-\d+)/gm)].map((match) => match[1]!);
if (usIds.length === 0) errors.push("US.md : aucune US (« #### US-xx · … »)");
const usColumn = column("US");
const covered = new Set(rows.flatMap((row) => row[usColumn]?.match(/US-\d+/g) ?? []));
for (const id of usIds) if (!covered.has(id)) errors.push(`${id} : aucune tâche ne la couvre`);

if (!/\*\*Statut\*\*/.test(readme)) errors.push("README.md : ligne « **Statut** » absente");

if (errors.length > 0) {
    console.error(errors.map((error) => `✗ ${error}`).join("\n"));
    process.exit(1);
}
console.log(`✓ ${dir} : ${rows.length} tâches, ${sum} points, ${usIds.length} US`);
