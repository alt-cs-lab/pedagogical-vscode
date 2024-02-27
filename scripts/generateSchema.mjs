import { resolve } from "path";
import fs from "fs";
import * as TJS from "typescript-json-schema";

const program = TJS.getProgramFromFiles([resolve("packages/shared/src/rules/schema.ts")]);
const schema = TJS.generateSchema(program, "PedagogicalRulesSchema", { required: true });

if (schema === null) {
  console.error("Failed to generate schema");
  process.exit(1);
}

const schemaString = JSON.stringify(schema, undefined, 2);
fs.writeFileSync("schemas/pedagogical-rules-schema.json", schemaString);
console.log("Generated schemas/pedagogical-rules-schema.json");
