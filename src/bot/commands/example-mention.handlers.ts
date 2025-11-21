import { Injectable } from "@nestjs/common";
import {
    Args,
    AutoContext,
    Command,
    Mentions,
    SmartMessage,
} from "@n0xgg04/nezon";
import type { Nezon } from "@n0xgg04/nezon";

@Injectable()
export class ExampleMentionHandlers {
    @Command("mention-demo")
    async mentionDemo(
        @AutoContext() [managedMessage]: Nezon.AutoContext,
        @Mentions(0) firstMention?: Nezon.Mention
    ) {
        if (!firstMention?.user_id) {
            await managedMessage.reply(
                SmartMessage.text(
                    "Hãy mention 1 người bạn để bot chào họ bằng placeholder nhé!"
                )
            );
            return;
        }

        await managedMessage.reply(
            SmartMessage.text(
                "Bot gửi lời chào tới {{target_user}}  👋"
            ).addMention({
                target_user: firstMention.user_id,
            })
        );
    }

    @Command("multi-mention")
    async multiMention(
        @AutoContext() [managedMessage]: Nezon.AutoContext,
        @Mentions() mentions: Nezon.Mentions
    ) {
        if (!mentions.length) {
            await managedMessage.reply(
                SmartMessage.text(
                    "Hãy mention vài người bạn rồi thử lại `*multi-mention` nhé!"
                )
            );
            return;
        }

        const placeholderMap = mentions.reduce<
            Record<string, { user_id: string; username?: string }>
        >((acc, mention, index) => {
            const userId = mention.user_id;
            if (userId) {
                acc[`user_${index + 1}`] = {
                    user_id: userId,
                    username: mention.username ?? undefined,
                };
            }
            return acc;
        }, {});

        if (!Object.keys(placeholderMap).length) {
            await managedMessage.reply(
                SmartMessage.text(
                    "Không tìm thấy user_id trong danh sách mentions."
                )
            );
            return;
        }

        const sentence = Object.keys(placeholderMap)
            .map((key) => `{{${key}}}`)
            .join(", ");

        await managedMessage.reply(
            SmartMessage.text(`Xin chào ${sentence}!`).addMention(
                placeholderMap
            )
        );
    }

    @Command("mention-role")
    async mentionRole(
        @Args() args: Nezon.Args,
        @AutoContext() [managedMessage]: Nezon.AutoContext
    ) {
        const [roleKey] = args;
        if (!roleKey) {
            await managedMessage.reply(
                SmartMessage.text(
                    "Nhập tên role hoặc id: `*mention-role Support` hoặc `*mention-role id:1840...`"
                )
            );
            return;
        }
        const trimmed = roleKey.trim();
        const isId = trimmed.toLowerCase().startsWith("id:");
        const payload = isId
            ? trimmed.slice(3).trim()
            : trimmed.replace(/^@+/, "").trim();
        if (!payload) {
            await managedMessage.reply(
                SmartMessage.text(
                    "Role không hợp lệ. Vui lòng nhập `id:ROLE_ID` hoặc tên role hợp lệ."
                )
            );
            return;
        }
        const roleTarget = isId ? { role_id: payload } : { role_name: payload };
        await managedMessage.reply(
            SmartMessage.text(
                "Ping {{target_role}} để cập nhật tiến độ!"
            ).addMention({
                target_role: roleTarget,
            })
        );
    }
}
