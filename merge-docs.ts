// merge-docs.ts
import fs from "fs";
import path from "path";

const DOCS_DIR = "./"; // Ajustá si tu ruta es distinta
const OUTPUT_FILE = "../../assets/merged-doc.md";

function isMarkdown(file: string) {
  return file.endsWith(".md") || file.endsWith(".mdx");
}

function shouldExcludeLine(line: string) {
  const isImage = /!\[.*\]\(.*\)/.test(line);
  const isImageImport =
    /import .* from ['"].*\.(png|jpg|jpeg|gif|webp)['"]/.test(line);
  const isApiRef = /\/api|['"]api['"]|`api`/.test(line);
  return isImage || isImageImport || isApiRef;
}

function removeFrames(content: string): string {
  return content.replace(/<Frame[\s\S]*?<\/Frame>/g, "");
}

function readMarkdownFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const contents: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (fullPath.includes("api-reference")) continue;

    if (entry.isDirectory()) {
      contents.push(...readMarkdownFiles(fullPath));
    } else if (entry.isFile() && isMarkdown(entry.name)) {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const noFrames = removeFrames(raw);
      const filtered = noFrames
        .split("\n")
        .filter((line) => !shouldExcludeLine(line))
        .join("\n");

      contents.push(`\n\n<!-- ${entry.name} -->\n\n` + filtered);
    }
  }

  return contents;
}

function mergeDocs() {
  const contents = readMarkdownFiles(DOCS_DIR);
  fs.writeFileSync(OUTPUT_FILE, contents.join("\n\n"));
  console.log(`✅ Documentación consolidada creada en ${OUTPUT_FILE}`);
}

mergeDocs();
