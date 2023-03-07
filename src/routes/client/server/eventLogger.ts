/** 
    ALL RIGHTS RESERVED Codetoil (c) 2021-2023 
*/

interface FormatSpecifierSearcher {
    foundSymbol: boolean;
    hasFormatSpecifiers: boolean;
    specifierEnd: number;
}

export class EventLogger implements Console {
    private oldConsole: Console;
    public ports!: readonly MessagePort[];

    public get Console(): console.ConsoleConstructor {
        throw new Error("Do not use, use `new EventLogger()`, instead");
    }

    constructor(oldConsole: Console) {
        this.oldConsole = oldConsole;
    }

    private hasFormatSpecifiers(formatString: string): boolean {
        return Object.values(formatString).reduce(
            (previousValue: FormatSpecifierSearcher, currentCharacter: string) => {
                return {
                    foundSymbol: currentCharacter === "%",
                    hasFormatSpecifiers:
                        previousValue.hasFormatSpecifiers ||
                        (previousValue.foundSymbol &&
                            (currentCharacter === "s" ||
                                currentCharacter === "d" ||
                                currentCharacter === "i" ||
                                currentCharacter === "f" ||
                                currentCharacter === "o" ||
                                currentCharacter === "0")),
                    specifierEnd: 0,
                };
            },
            {
                foundSymbol: false,
                hasFormatSpecifiers: false,
                specifierEnd: 0,
            }
        ).hasFormatSpecifiers;
    }

    private printer(logLevel: string, args: any[]): void {
        let argsStr = Object.values(args).reduce(
            (previousValue, currentCharacter) => {
                return previousValue + " " + currentCharacter;
            },
            ""
        );

        this.ports.forEach(port => port.postMessage("log" + "[" + logLevel + "] " + argsStr));
    }

    private formatter(args: any[]): any[] {
        let target: string = args[0];
        let current: any = args[1];
        let result = args.filter((_e: any, i: number) => {
            return i > 1;
        });

        let specifierPos =
            Object.values(target).reduce(
                (previousValue: FormatSpecifierSearcher, currentCharacter: string) => {
                    return {
                        foundSymbol: currentCharacter === "%",
                        hasFormatSpecifiers:
                            previousValue.hasFormatSpecifiers ||
                            (previousValue.foundSymbol &&
                                (currentCharacter === "s" ||
                                    currentCharacter === "d" ||
                                    currentCharacter === "i" ||
                                    currentCharacter === "f" ||
                                    currentCharacter === "o" ||
                                    currentCharacter === "0")),
                        specifierEnd:
                            previousValue.specifierEnd +
                            (previousValue.hasFormatSpecifiers ? 0 : 1),
                    };
                },
                {
                    foundSymbol: false,
                    hasFormatSpecifiers: false,
                    specifierEnd: 0,
                }
            ).specifierEnd - 2;
        let specifier = Object.values(target)
            .splice(specifierPos, 2)
            .reduce((previousValue, currentCharacter) => {
                return previousValue + currentCharacter;
            }, "");
        let converted: any;
        switch (specifier) {
            case "%s":
                converted = String(current);
                break;
            case "%d":
            case "%i":
                if (typeof current === "symbol") {
                    converted = NaN;
                } else {
                    converted = parseInt(current, 10);
                }
                break;
            case "%f":
                if (typeof current === "symbol") {
                    converted = NaN;
                } else {
                    converted = parseFloat(current);
                }
                break;
            case "%o":
                converted = current;
                break;
            case "%0":
                converted = current;
                break;
            default:
                converted = current;
                break;
        }
        target =
            Object.values(target)
                .splice(0, specifierPos)
                .reduce((previousValue, currentCharacter) => {
                    return previousValue + currentCharacter;
                }, "") +
            converted +
            Object.values(target)
                .splice(specifierPos + 2)
                .reduce((previousValue, currentCharacter) => {
                    return previousValue + currentCharacter;
                }, "");
        result.unshift(target);
        if (!this.hasFormatSpecifiers(target)) return result;
        if (result.length === 1) return result;
        return this.formatter(result);
    }

    private logger(logLevel: string, formatString?: string, rest?: any[]): void {
        if (!!rest) {
            this.printer(logLevel, [formatString]);
        } else {
            if (!!formatString && !this.hasFormatSpecifiers(formatString)) {
                this.printer(logLevel, [formatString, ...(rest as unknown as any[])]);
            } else {
                this.printer(logLevel, this.formatter([formatString, ...(rest as unknown as any[])]));
            }
        }
    }

    public assert(
        value: boolean = false,
        message: string = "Assertion failed",
        ...optionalParams: any[]
    ): void {
        if (value) return;
        this.logger("assert", message, optionalParams);
        this.oldConsole.assert(value, message, optionalParams);
    }

    public clear(): void {
        this.oldConsole.clear();
    }
    public debug(message?: string, ...optionalParams: any[]): void {
        this.logger("debug", message, optionalParams);
        this.oldConsole.debug(message, optionalParams);
    }
    public error(message?: string, ...optionalParams: any[]): void {
        this.logger("error", message, optionalParams);
        this.oldConsole.error(message, optionalParams);
    }
    public info(message?: string, ...optionalParams: any[]): void {
        this.logger("info", message, optionalParams);
        this.oldConsole.info(message, optionalParams);
    }
    public log(message?: string, ...optionalParams: any[]): void {
        this.logger("log", message, optionalParams);
        this.oldConsole.log(message, optionalParams);
    }
    public table(tabularData: any, properties?: readonly string[]): void {
        this.oldConsole.table(tabularData, properties);
    }
    public trace(message?: string, ...optionalParams: any[]): void {
        this.oldConsole.trace(message, optionalParams);
    }
    public warn(message?: string, ...optionalParams: any[]): void {
        this.logger("warn", message, optionalParams);
        this.oldConsole.warn(message, optionalParams);
    }
    public dir(item?: any, options: any = {}): void {
        this.oldConsole.dir(item, options);
    }
    public dirxml(...data: any[]): void {
        this.oldConsole.dirxml(data);
    }

    public count(label: string = "default"): void {
        this.oldConsole.count(label);
    }
    public countReset(label: string = "default"): void {
        this.oldConsole.countReset(label);
    }

    public group(...label: any[]): void {
        this.oldConsole.group(label);
    }
    public groupCollapsed(...label: any[]): void {
        this.oldConsole.groupCollapsed(label);
    }
    public groupEnd(): void {
        this.oldConsole.groupEnd();
    }

    public time(label: string = "default"): void {
        this.oldConsole.time(label);
    }
    public timeLog(label: string = "default", ...data: any[]): void {
        this.oldConsole.timeLog(label, data);
    }
    public timeStamp(label: string = "default"): void {
        this.oldConsole.timeStamp(label);
    }
    public timeEnd(label: string = "default"): void {
        this.oldConsole.timeEnd(label);
    }

    public profile(label: string = "default"): void {
        this.oldConsole.profile(label);
    }
    public profileEnd(label: string = "default"): void {
        this.oldConsole.profileEnd(label);
    }
}