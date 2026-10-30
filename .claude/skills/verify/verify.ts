// Contrôles « Avant de rendre la main » (AGENTS.md racine) sur le diff courant :
// bun .claude/skills/verify/verify.ts [base]   (base par défaut : merge-base avec develop)
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = (await Bun.$`git rev-parse --show-toplevel`.text()).trim();
process.chdir(root);

const git = async (...args: string[]) => (await Bun.$`git ${args}`.quiet().nothrow().text()).trim();
const base = Bun.argv[2] ?? ((await git("merge-base", "HEAD", "develop")) || "HEAD");
// Une base inconnue ferait un diff vide, donc un faux « aucun changement »
if ((await Bun.$`git rev-parse --verify --quiet ${base}^{tree}`.quiet().nothrow()).exitCode !== 0) {
    console.error(`Base inconnue : ${base}`);
    process.exit(2);
}

const changed = [
    ...new Set([
        ...(await git("diff", "--name-only", base)).split("\n"),
        ...(await git("ls-files", "--others", "--exclude-standard")).split("\n"),
    ]),
].filter((file) => file && existsSync(file));

if (changed.length === 0) {
    console.log(`Aucun changement depuis ${base}.`);
    process.exit(0);
}

const failures: string[] = [];
const warnings: string[] = [];
const passes: string[] = [];
const touched = (pattern: RegExp) => changed.some((file) => pattern.test(file));

// --- Workspaces touchés, avec leurs dépendants (un changement de package se propage aux apps qui l'importent)

type Workspace = { dir: string; name: string; deps: string[] };
const workspaces: Workspace[] = (await git("ls-files", "apps/*/package.json", "packages/*/package.json"))
    .split("\n")
    .map((file) => {
        const pkg = JSON.parse(readFileSync(file, "utf8"));
        const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).filter((dep) => dep.startsWith("@trading-plateform/"));
        return { dir: dirname(file), name: pkg.name as string, deps };
    });

const toCheck = new Set(workspaces.filter((ws) => touched(new RegExp(`^${ws.dir}/`))).map((ws) => ws.name));
for (let grew = true; grew; ) {
    grew = false;
    for (const ws of workspaces) {
        if (!toCheck.has(ws.name) && ws.deps.some((dep) => toCheck.has(dep))) {
            toCheck.add(ws.name);
            grew = true;
        }
    }
}

const run = async (label: string, cwd: string, cmd: string[]) => {
    const proc = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe" });
    const output = (await new Response(proc.stdout).text()) + (await new Response(proc.stderr).text());
    if ((await proc.exited) === 0) passes.push(label);
    else failures.push(`${label}\n${output.trim().split("\n").slice(-25).join("\n")}`);
};

for (const ws of workspaces.filter((ws) => toCheck.has(ws.name))) {
    // contracts n'a pas de tsconfig : il est vérifié à travers les apps qui l'importent
    if (existsSync(join(ws.dir, "tsconfig.json"))) await run(`tsc ${ws.dir}`, ws.dir, ["bunx", "tsc", "--noEmit"]);
}
if (toCheck.has("backtest-engine")) await run("bun test apps/backtest-engine", "apps/backtest-engine", ["bun", "test"]);
if (touched(/^apps\/web\//)) await run("lint apps/web", "apps/web", ["bun", "run", "lint"]);

// --- Lignes ajoutées par le diff (fichiers non suivis : tout leur contenu)

const added = new Map<string, string[]>();
let current = "";
for (const line of (await git("diff", "-U0", base)).split("\n")) {
    if (line.startsWith("+++ ")) current = line.replace(/^\+\+\+ (b\/)?/, "");
    else if (line.startsWith("+") && current) added.set(current, [...(added.get(current) ?? []), line.slice(1)]);
}
for (const file of (await git("ls-files", "--others", "--exclude-standard")).split("\n").filter(Boolean)) {
    if (/\.(ts|tsx|js|mjs|sql|prisma|md|json)$/.test(file)) added.set(file, readFileSync(file, "utf8").split("\n"));
}
const codeFiles = [...added.keys()].filter((file) => /\.(ts|tsx)$/.test(file) && !file.startsWith(".claude/"));
const addedIn = (pattern: RegExp, files = codeFiles) =>
    files.flatMap((file) => (added.get(file) ?? []).filter((line) => pattern.test(line)).map((line) => `${file} : ${line.trim()}`));

// --- Règles strictes du dépôt

const envFiles = changed.filter((file) => /(^|\/)\.env(\.|$)/.test(file));
if (envFiles.length > 0) failures.push(`Fichier .env dans le diff : ${envFiles.join(", ")}`);

const rawSql = addedIn(/\$queryRaw|\$executeRaw|Prisma\.sql|Unsafe\(/, codeFiles.filter((file) => !file.includes("prisma/migrations/")));
if (rawSql.length > 0) failures.push(`SQL écrit à la main hors migration (règle « Base de données ») :\n${rawSql.join("\n")}`);

if (touched(/(^|\/)generated\//)) failures.push("Fichier de `generated/` modifié : il ne s'édite jamais, régénère-le.");

if (touched(/^apps\/core-backend\/prisma\/schema\.prisma$/)) {
    if (!touched(/^apps\/core-backend\/prisma\/migrations\//)) failures.push("`schema.prisma` modifié sans nouvelle migration dans `prisma/migrations/`.");
    warnings.push("Schéma Prisma modifié : lance `bun run db:generate` et vérifie qu'une colonne ajoutée à une table non vide est nullable ou a une `@default`.");
}

// --- Points à juger (avertissements)

const anys = addedIn(/:\s*any\b|as any\b|<any>/);
if (anys.length > 0) warnings.push(`\`any\` ajouté :\n${anys.join("\n")}`);

const consoles = addedIn(/console\.(log|debug|info)\(/);
if (consoles.length > 0) warnings.push(`console.* ajouté (logs via Logger.here()) ou reste de debug :\n${consoles.join("\n")}`);

const catalogs = [
    { code: /^apps\/core-backend\/(routes|controller)\//, catalog: "apps/core-backend/API.md" },
    { code: /^apps\/market-service\/(routes|controller)\//, catalog: "apps/market-service/API.md" },
    {
        code: /^apps\/web\/src\/(components\/(?!ui\/)|lib\/|features\/[^/]+\/(api|hook|constants|utils|types)\.ts$)/,
        catalog: "apps/web/COMPONENTS.md",
    },
];
for (const { code, catalog } of catalogs) {
    if (touched(code) && !changed.includes(catalog)) {
        warnings.push(`${catalog} inchangé alors que ${changed.filter((file) => code.test(file)).join(", ")} a changé : mets l'entrée à jour si une route ou un élément catalogué a changé.`);
    }
}

if (touched(/^packages\/contracts\//)) {
    const sides = ["apps/backtest-engine/", "apps/core-backend/"].filter((dir) => !changed.some((file) => file.startsWith(dir)));
    warnings.push(
        `Contrat modifié : producteur et consommateur dans le même diff${sides.length ? ` (aucun changement dans ${sides.join(", ")})` : ""}, unité commentée sur chaque champ numérique, services concernés à redémarrer.`,
    );
}

// Déclaration exportée ajoutée dont le nom existe déjà ailleurs : doublon probable (règle « Rangement »)
const declared = addedIn(/^\s*export\s+(default\s+)?(const|function|type|interface|class|enum)\s+\w+/).map((entry) => {
    const [file] = entry.split(" : ");
    const name = entry.match(/(?:const|function|type|interface|class|enum)\s+(\w+)/)![1]!;
    return { file: file!, name };
});
// Exports imposés par Next.js : un par page ou layout, par convention du framework
const FRAMEWORK_EXPORTS = new Set(["metadata", "config", "proxy", "generateMetadata", "dynamic", "revalidate"]);
for (const { file, name } of declared.filter(({ name }) => !FRAMEWORK_EXPORTS.has(name))) {
    // Déclarations exportées seulement (pas les imports ni les variables locales) ; git grep -E est en POSIX ERE : pas de \s ni de \b
    const pattern = `^[[:space:]]*export[[:space:]]+(default[[:space:]]+)?(declare[[:space:]]+)?(const|function|type|interface|class|enum)[[:space:]]+${name}([^[:alnum:]_]|$)`;
    const others = (await git("grep", "-lE", "--untracked", pattern, "--", "apps/*.ts", "apps/*.tsx", "packages/*.ts", "packages/*.tsx"))
        .split("\n")
        .filter((other) => other && other !== file && !other.includes("/generated/"));
    if (others.length > 0) warnings.push(`\`${name}\` (${file}) est aussi déclaré dans ${others.join(", ")} : réutilise ou dérive au lieu de dupliquer.`);
}

// --- Rapport

console.log(`Base : ${base} · ${changed.length} fichiers · workspaces vérifiés : ${[...toCheck].join(", ") || "aucun"}\n`);
for (const pass of passes) console.log(`✓ ${pass}`);
for (const warning of warnings) console.log(`\n⚠ ${warning}`);
for (const failure of failures) console.log(`\n✗ ${failure}`);
console.log(`\n${failures.length} échec(s), ${warnings.length} avertissement(s).`);
process.exit(failures.length > 0 ? 1 : 0);
