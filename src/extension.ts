'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let flexRunner = null;
let last = null;

export function activate(context: vscode.ExtensionContext) {
    interface KeyValPair {
        key: string,
        value: string
    }
    let actions: KeyValPair[] = [];
    let strings: string[] = [];

    flexRunner = new FlexRunner();
    flexRunner.init();
    for (var k = 1; k < 10; k++) {
        const index = k;
        const commandName = "flex-runner.run.config." + index;
        let disposable = vscode.commands.registerCommand(commandName, () => {
            let config = vscode.workspace.getConfiguration("flex-runner.config." + index);
            let command = config.get("command");
            if (command == null) {
                vscode.window.showErrorMessage("You don't have any command set for configuration " + index + "!");
            } else {
                flexRunner.send(command);
                flexRunner.space();
            }
        });
        context.subscriptions.push(disposable);

        let key = index + " - Run Configuration " + index;
        strings.push(key);
        actions[key] = { key: key, value: "flex-runner.run.config." + index };
    }

    let disposable = vscode.commands.registerCommand('flex-runner.run.config.last', () => {
    });
    context.subscriptions.push(disposable);
    let key = "0 - Run Last Configuration";
    strings.unshift(key);
    actions[key] = { key: key, value: "flex-runner.run.config.last" };

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

class FlexRunner {

    private _terminal: vscode.Terminal;

    constructor() {
        this._terminal = vscode.window.createTerminal("Flex Runner");
    }

    public init() {
        this.send("echo off");
        this.send("cls");
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