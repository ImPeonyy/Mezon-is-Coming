import { ChannelMessageContent, IInteractiveMessageProps } from 'mezon-sdk';
import { LOADING_EMOJI_ID } from '@/constants';
import { getRandomPastelHexColor } from '@/utils';

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

export const getEmbedLoadingMessage = (title: string): ChannelMessageContent => {
    return {
        embed: [
            {
                color: getRandomPastelHexColor(),
                title: title,
                description: '🌸 Chờ xíu nha... 🌸',
            },
        ],
    };
};

export const getInteralErrorMessage = (): ChannelMessageContent => {
    return {
        t: '❌ Đã có lỗi xảy ra! Vui lòng liên hệ admin (thang.thieuquang) để được hỗ trợ!',
    };
};
