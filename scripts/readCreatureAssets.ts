import { readdirSync } from "fs";
import { join } from "path";

const assetsPath = join(__dirname, "../public/assets/creatures");

function readCreatureAssets() {
  const creatureAssets = {};

  const topLevelFolders = readdirSync(assetsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  topLevelFolders.forEach((folder) => {
    const subFolders = readdirSync(join(assetsPath, folder), {
      withFileTypes: true,
    })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    creatureAssets[folder] = subFolders;
  });

  return creatureAssets;
}

const creatureAssets = readCreatureAssets();
console.log(creatureAssets);

