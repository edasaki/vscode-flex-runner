'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Scripts = require("./scripts")

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

let flexRunner = null;
let last = null;
let context = null;

export default function getFlexRunner() {
    return flexRunner;
}

export function activate(contextParam: vscode.ExtensionContext) {
    context = contextParam
    flexRunner = new FlexRunner()
    flexRunner.init()
}

class FlexRunner {

    public terminal: vscode.Terminal;
    public configs: FlexConfig[];
    private _lastSuccessfulConfig: FlexConfig = null;

    constructor() {
        this.terminal = vscode.window.createTerminal("Flex Runner");
    }

    public init() {
        this.send("echo off");
        this.send("cls");
        this.readConfigs();
        this.registerCommands();
    }

    public tryCommand(configId) {
        console.log("Trying command " + configId);
        for (let x in this.configs) {
            let fc = this.configs[x];
            if (fc && fc.id === configId) {
                console.log(`found ${JSON.stringify(fc)}`)
                if (fc.command !== undefined) {
                    this.send(fc.command)
                    this._lastSuccessfulConfig = fc;
                    return;
                } else if (fc.script !== undefined) {
                    this.script(fc.script)
                    this._lastSuccessfulConfig = fc;
                    return;
                }
            }
        }
        vscode.window.showErrorMessage("Tried to execute unknown command: " + configId)
    }

    private script(s: string) {
        Scripts.instance[s]();
    }

    public readConfigs() {
        this.configs = []
        let config = vscode.workspace.getConfiguration("flex-runner.config")
        let commandArr = config.get("command")
        console.log("Reading configs: " + commandArr)
        for (var x in commandArr) {
            const e = commandArr[x]
            console.log(x + " = " + JSON.stringify(e))
            let fc: FlexConfig = { id: e.id, command: e.command, script: e.script }
            this.configs.push(fc);
        }
        console.log("done " + JSON.stringify(this.configs))
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
        let disposable = vscode.commands.registerCommand('flex-runner.run.config.last', () => {
            console.log(`${JSON.stringify(this._lastSuccessfulConfig)}`)
            if (this._lastSuccessfulConfig) {
                this.tryCommand(this._lastSuccessfulConfig.id);
            } else {
                vscode.window.showErrorMessage("You haven't run any configurations yet this session.");
            }
        });
        context.subscriptions.push(disposable)
        let key;
        let actions: FlexConfig[] = []
        let strings: string[] = []
        this.configs.forEach(fc => {
            let name = fc.id + " - Run Configuration " + fc.id
            strings.push(name);
            actions[name] = fc;
        });
        const last = "0 - Run Last Configuration";
        key = last;
        strings.unshift(key);
        const options: vscode.QuickPickOptions = {
            placeHolder: 'Choose a configuration to run'
        };
        disposable = vscode.commands.registerCommand('flex-runner.chooser', () => {
            vscode.window.showQuickPick(strings, options).then((resultString) => {
                if (!resultString) {
                    return;
                }
                if(resultString === last) {
                    vscode.commands.executeCommand('flex-runner.run.config.last');
                    return;
                }
                let selected = actions[resultString];
                if (!selected || !selected.id) {
                    return;
                }
                this.tryCommand(selected.id);
            });
        });
        context.subscriptions.push(disposable);
    }

    public space() {
        for (var k = 0; k < 2; k++) {
            this.terminal.sendText("");
        }
    }

    public send(command: string) {
        console.log(`Sending ${command}`)
        this.terminal.sendText(command);
        this.terminal.show(true);
    }

    public dispose() {
        this.terminal.dispose();
    }

}

export function deactivate() {
    if (flexRunner != null) {
        flexRunner.dispose();
        flexRunner = null;
    }
}