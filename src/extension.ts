'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let flexRunner = null;
let last = null;
let context = null;

export function activate(contextParam: vscode.ExtensionContext) {
    context = contextParam 
    flexRunner = new FlexRunner()
    flexRunner.init()
}

class FlexRunner {

    private _terminal: vscode.Terminal;
    public configs: FlexConfig[];

    constructor() {
        this._terminal = vscode.window.createTerminal("Flex Runner");
    }

    public init() {
        this.send("echo off");
        this.send("cls");
        this.readConfigs();
        this.registerCommands();
    }

    public tryCommand(configId) {
        let fc = this.configs[configId]
        if(fc) {
           this.send(fc.command) 
        } else {
            vscode.window.showErrorMessage("Tried to execute unknown command: " + configId)
        }
    }

    public readConfigs() {
        this.configs = []
        let config = vscode.workspace.getConfiguration("flex-runner.config")
        let commandArr = config.get("command")
        console.log("Reading configs: " + commandArr)
        for (var x in commandArr) {
            const e = commandArr[x]
            console.log(x + " = " + JSON.stringify(e))
            let fc : FlexConfig = {id : e.id, command : ""}
            this.configs[fc.id] = fc
        }
        console.log("done")
    }

    public registerCommands() {
        for (let k = 1; k < 10; k++) {
            const index = k
            const commandName = "flex-runner.run.config." + index
            let disposable = vscode.commands.registerCommand(commandName, () => {
                this.tryCommand(index)
            })
            context.subscriptions.push(disposable)
        }
        var disposable = vscode.commands.registerCommand('flex-runner.run.config.last', () => {
        });
        context.subscriptions.push(disposable)
        let key = "0 - Run Last Configuration";
        let strings : string[] = []
        strings.unshift(key)
        const options: vscode.QuickPickOptions = {
            placeHolder: 'Choose a configuration to run'
        };
        disposable = vscode.commands.registerCommand('flex-runner.chooser', () => {
            vscode.window.showQuickPick(strings, options).then((resultString) => {
                if (!resultString) {
                    return;
                }
                let command = actions[resultString].value;
                vscode.commands.executeCommand(command);
            });
        });
        context.subscriptions.push(disposable);
    }

    public space() {
        for (var k = 0; k < 2; k++) {
            this._terminal.sendText("");
        }
    }

    public send(command: string) {
        this._terminal.sendText(command);
        this._terminal.show(true);
    }

    public dispose() {
        this._terminal.dispose();
    }

}

export function deactivate() {
    if (flexRunner != null) {
        flexRunner.dispose();
        flexRunner = null;
    }
}