export interface UserOpt {
    last_name?: string;
    username?: string;
    language_code?: string;
}

export interface User extends UserOpt {
    id: number;
    is_bot: boolean;
    first_name: string;
}

export interface ChatOpt {
    title?: string;
    username?: string;
    first_name?: string;
    last_name?: string;
}

export interface Chat extends ChatOpt {
    id: number;
    type: string;
}

export interface InlineKeyboardButton {
    text: string;
    callback_data?: string;
}

export interface InlineKeyboardMarkup {
    inline_keyboard: Array<Array<InlineKeyboardButton>>;
}

export interface MessageOpt {
    from?: User;
    reply_markup?: InlineKeyboardMarkup;
}

export interface Message extends MessageOpt {
    message_id: number;
    date: number;
    chat: Chat;
    edit_date: number;
    text: string;
}

export interface CallbackQuery {
    id: string;
    from: User;

    message?: Message;
    data?: string;
}

export interface Update {
    update_id: number;

    message?: Message;
    edited_message?: Message;
    callback_query?: CallbackQuery;
}

export interface sendMessageOptParam {
    parse_mode?: "Markdown" | "HTML";
    reply_markup?: InlineKeyboardMarkup;
}

export interface sendMessageParam {
    chat_id: number | string;
    text: string;
}

export interface editMessageTextOptParam extends sendMessageOptParam {
    message_id?: number;
    chat_id?: number | string;
}

export interface editMessageTextParam extends editMessageTextOptParam {
    text: string;
}

export interface AnswerCallbackQueryParam {
    callback_query_id: string;
    text?: string;
}

export interface ServerConfig {
    port: number;
    key: string;
    cert: string;
}

export interface BotMethod {
    sendMessage(chatId: string | number, text: string, option?: sendMessageOptParam): Promise<Message>;
    editMessageText(text: string, option: editMessageTextOptParam): Promise<boolean | Message>;
    answerCallbackQuery(param: AnswerCallbackQueryParam): Promise<boolean>;
    deleteMessage(chatId: number | string, messageId: number): Promise<boolean>;
}

export type Listener<T> = (context: T) => void;
