const fs = require("fs");
const path = require("path");

const root = "c:/Users/ADMIN/Desktop/Underlap";

const files = ["src/app/dm/page.tsx", "src/app/dm/[conversationId]/page.tsx"];

files.forEach((f) => {
  const fullPath = path.join(root, f);
  let content = fs.readFileSync(fullPath, "utf8");

  // Fix: "import { \nimport { getAuthHeaders }..." -> proper imports
  const brokenPattern =
    /import \{ \r?\nimport \{ getAuthHeaders \} from '(@\/lib\/authFetch)';\r?\n/g;
  const replacement = "import { getAuthHeaders } from '$1';\r\nimport {\r\n";

  const newContent = content.replace(brokenPattern, replacement);

  if (newContent !== content) {
    fs.writeFileSync(fullPath, newContent, "utf8");
    console.log("FIXED:", f);
  } else {
    console.log("NO CHANGE:", f);
  }
});
