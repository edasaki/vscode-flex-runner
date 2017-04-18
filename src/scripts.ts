import * as vscode from 'vscode';
import getFlexRunner from './extension'; 

export class FlexScripts {

    private _lastJavaSrcProject : string = null;

    public javaSrcProject() {
        console.log("hello moto");
        let fName = vscode.window.activeTextEditor.document.fileName;
        let hasMain : boolean = vscode.window.activeTextEditor.document.getText().includes("static void main(String[]");
        console.log(fName);
        console.log(hasMain);
        let res : string = null;
        if(hasMain && fName.indexOf("src") != -1) {
            let bin = fName.replace("src", "bin");
            console.log(`bin: ${bin}`);
            this._lastJavaSrcProject = bin;
            res = bin;
        } else if(this._lastJavaSrcProject !== null) {
            res = this._lastJavaSrcProject; 
        } else {
            vscode.window.showErrorMessage("")
            res = null;
        }
        if(res) {
            let binDir = res.substr(0, res.indexOf("bin") + 3);
            let relPath = res.substr(binDir.length + 1).replace("\\", ".");
            relPath = relPath.substr(0, relPath.indexOf(".java"));
            console.log("bindir: " + binDir);
            console.log("relpath: " + relPath);
            let term : vscode.Terminal = getFlexRunner().terminal;                       
            term.sendText(`pushd ${binDir}`);
            let command = `java -cp .;../lib ${relPath}`;
            term.sendText(command); 
            term.sendText(`popd`);
        } else {
            vscode.window.showErrorMessage("Nothing to execute!");
        }
    }

}

/**
 * DO NOT MODIFY BELOW UNLESS YOU'RE DOING IT INTENTIONALLY!
 * To add a script for your own use, you should put it in
 * the FlexScripts class above.
 */

export var instance = new FlexScripts();