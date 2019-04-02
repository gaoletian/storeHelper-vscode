import * as vscode from "vscode";
import * as fs from "fs";
import { genDts, getStoreFileList } from "./storeHelper";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  console.log("storeHelper has actived!!");

  const fileWatcher = vscode.workspace.createFileSystemWatcher(
    "**/app/store/**/*.ts"
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("storehelper.test", () => {
      let workdir = vscode.workspace.workspaceFolders;
      let workspaceName = (workdir && workdir.length) ? workdir[0].name : '未知工作区';
      vscode.window.showInformationMessage("storeHelper test workdir = ", workspaceName);
    })
  );

  context.subscriptions.push(
    fileWatcher.onDidChange(uri => storeHelperTask(uri))
  );
  context.subscriptions.push(
    fileWatcher.onDidCreate(uri => storeHelperTask(uri))
  );
  context.subscriptions.push(
    fileWatcher.onDidDelete(uri => storeHelperTask(uri))
  );
}

// this method is called when your extension is deactivated
export function deactivate() {}

function storeHelperTask(uri: vscode.Uri) {
  vscode.window.showInformationMessage("正在生成 storeHelper.d.ts ....");
  //   vscode.window.showInformationMessage(uri + "changed");
  let workspaceFolder = vscode.workspace.getWorkspaceFolder(uri);
  if (workspaceFolder && workspaceFolder.uri.fsPath) {
    const workdir = workspaceFolder.uri.path;
    // console.log(relativeUri + " changed");
    // console.log(uri.path, workspaceFolder.uri.path);

    let fileList = getStoreFileList(workdir + "/app/store");
    fileList = fileList.map(it => it.replace(workdir + "/app/", ""));

    let dtsCode = genDts(fileList);

    fs.writeFileSync(workdir + "/types/storeHelper.d.ts", dtsCode);

    vscode.window.showInformationMessage("storeHelper.d.ts has updated!!");
  }
}

// prettier
//   .resolveConfig(projPath('.prettierrc'))
//   .then(config => {
//     // pretter format option
//     config['parser'] = 'typescript';
//     const dtsCode = prettier.format(genDts(changedfile), config);
//     fs.writeFileSync(path.join(process.cwd(), 'types/storeHelper.d.ts'), dtsCode, { encoding: 'utf8' });
//   })
//   .catch(console.error);
