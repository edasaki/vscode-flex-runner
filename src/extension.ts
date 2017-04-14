'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "flex-runner-vscode" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let flexRunner = new FlexRunner();
    flexRunner.init();
    let disposable = vscode.commands.registerCommand('flex-runner.run.config.1', () => {
        flexRunner.test();
    });
    context.subscriptions.push(disposable);
    disposable = vscode.commands.registerCommand('flex-runner.run.config.last', () => {
        flexRunner.test(); 
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

    private send(command: string) {
        this._terminal.sendText(command);
    }

    public test() {
        this._terminal.sendText("echo test");
    }

    public dispose() {
        this._terminal.dispose(); 
    }

}

// this method is called when your extension is deactivated
export function deactivate() {
}