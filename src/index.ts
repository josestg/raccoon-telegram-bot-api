import https from "https";
import http from "http";
import fs from "fs";

import * as rp from "request-promise";
import * as t from "./types";

export class BotApi implements t.BotMethod {
    public static self: BotApi = null;
    private routes = new Map<string, t.Listener<any>>();
    private baseUrl = `https://api.telegram.org/bot`;

    constructor(private token: string, localUrl: string) {
        if (BotApi.self !== null) return BotApi.self;

        this.baseUrl += this.token;
        const webhookUrl = `${this.baseUrl}/setWebhook?url=${localUrl}/webhook`;
        BotApi.initWebhook(webhookUrl);
        BotApi.self = this;
    }

    public static initWebhook(url) {
        return https.request(url).end();
    }

    public startServer(config: t.ServerConfig, cb: () => void) {
        const { key, cert, port } = config;
        const server = http.createServer((req, res) => {
            const url: string = req.url;
            let data: t.Update;
            if (url == "/webhook") {
                req.on("data", chunk => (data = <t.Update>JSON.parse(chunk)));
                req.on("end", () => {
                    this.listen(data);
                });
            }
            res.end();
        });

        https.createServer({
            key: fs.readFileSync(key),
            cert: fs.readFileSync(cert)
        });
        server.listen(port, cb);
    }

    public static getInstance(token: string, localUrl: string) {
        if (BotApi.self == null) BotApi.self = new BotApi(token, localUrl);
        return BotApi.self;
    }

    private isCommand(message: string) {
        return message.match(/\s+/) == null && message.match(/^\/[a-zA-Z]+/) != null;
    }

    private getRoute(key: string) {
        return this.routes.get(key);
    }

    public listen(update: t.Update) {
        if (update.callback_query && this.routes.has("callback_query")) {
            const action = this.getRoute("callback_query");
            return action.call(this, update.callback_query);
        }

        if (update.message && this.isCommand(update.message.text)) {
            const { text } = update.message;
            if (this.routes.has(text)) {
                const action = this.getRoute(text);
                return action.call(this, update.message);
            } else {
                console.log("unregister route");
            }
        } else if (this.routes.has("message")) {
            const action = this.getRoute("message");
            if (action) return action.call(this, update.message);
        }
    }

    onCallbackQuery(fn: t.Listener<t.CallbackQuery>) {
        this.routes.set("callback_query", fn);
    }

    onMessage(fn: t.Listener<t.Message>) {
        this.routes.set("message", fn);
    }

    public onText(route: string, fn: t.Listener<t.Message>) {
        if (this.isCommand(route) && fn) {
            this.routes.set(route, fn);
            return true;
        }

        return false;
    }

    private makeRequest<T>(method: string, body?: any): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            rp.post(`${this.baseUrl}/${method}`, {
                body,
                json: true
            })
                .then(res => resolve(res.result))
                .catch(err => reject(err));
        });
    }

    sendMessage(chatId: string | number, text: string, option?: t.sendMessageOptParam): Promise<t.Message> {
        if (!option) option = {};
        return this.makeRequest<t.Message>("sendMessage", {
            chat_id: chatId,
            text: text,
            ...option
        });
    }
    editMessageText(text: string, option: t.editMessageTextOptParam): Promise<boolean | t.Message> {
        if (!option) option = {};
        return this.makeRequest<t.Message>("editMessageText", {
            text: text,
            ...option
        });
    }

    answerCallbackQuery(param: t.AnswerCallbackQueryParam): Promise<boolean> {
        return this.makeRequest<boolean>("answerCallbackQuery", param);
    }

    deleteMessage(chatId: number | string, messageId: number): Promise<boolean> {
        return this.makeRequest<boolean>("deleteMessage", {
            chat_id: chatId,
            message_id: messageId
        });
    }
}
