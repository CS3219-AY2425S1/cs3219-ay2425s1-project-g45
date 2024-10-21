const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const directories = fs
  .readdirSync(".", { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

const updatePackage = (dir) => {
  return new Promise((resolve, reject) => {
    exec(
      "npm uninstall peerprep-shared-types && npm install peerprep-shared-types",
      { cwd: dir },
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error in ${dir}: ${error}`);
          reject(error);
          return;
        }
        console.log(`Updated peerprep-shared-types in ${dir}`);
        resolve();
      }
    );
  });
};

const updateAll = async () => {
  for (const dir of directories) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      try {
        if (dir !== "peerprep-shared-types") {
          await updatePackage(dir);
        }
      } catch (error) {
        console.error(`Failed to update ${dir}`);
      }
    }
  }
};

updateAll();
