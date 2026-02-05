import { ChannelMessageContent, IInteractiveMessageProps } from 'mezon-sdk';
import { LOADING_EMOJI_ID } from '@/constants';

export const getTextMessage = (text: string): ChannelMessageContent => {
    return {
        t: text,
    };
};

export const getEmbedMessage = (embed: IInteractiveMessageProps): ChannelMessageContent => {
    return {
        embed: [embed],
    };
};

export const getLoadingMessage = (): ChannelMessageContent => {
    return {
        t: '    Chờ xíu nha... 🌸',
        ej: [
            {
                emojiid: LOADING_EMOJI_ID,
                s: 0,
                e: 1,
            },
        ],
    };
};

export const getInteralErrorMessage = (): ChannelMessageContent => {
    return {
        t: '❌ Đã có lỗi xảy ra! Vui lòng liên hệ admin (thang.thieuquang) để được hỗ trợ!',
    };
};
