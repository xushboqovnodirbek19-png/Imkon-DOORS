import "dotenv/config";
import { Bot, InlineKeyboard } from "grammy";

/**
 * IMKON Doors bot (Phase 0).
 *
 * Entry point into the experience: `/start` shows a button that launches the
 * Mini App (a full-screen webview inside Telegram). Runs via long-polling for
 * local development — no public URL needed for the bot itself. (The MINI_APP
 * URL, however, must be public HTTPS so Telegram can load the webview.)
 *
 * Run with:  npm run bot
 */

const token = process.env.TELEGRAM_BOT_TOKEN;
const miniAppUrl = process.env.MINI_APP_URL;

if (!token) {
  console.error("✗ TELEGRAM_BOT_TOKEN is not set. Add it to .env.local");
  process.exit(1);
}
if (!miniAppUrl) {
  console.error(
    "✗ MINI_APP_URL is not set. Add your public HTTPS Mini App URL to .env.local",
  );
  process.exit(1);
}

const bot = new Bot(token);

bot.command("start", async (ctx) => {
  const keyboard = new InlineKeyboard().webApp(
    "🚪 IMKON Doors'ni ochish",
    miniAppUrl,
  );
  await ctx.reply(
    "IMKON Doors'ga xush kelibsiz!\n\n" +
      "Eshiklarimizni 3D'da ko'rish, narxlarni bilish va buyurtma berish " +
      "uchun quyidagi tugmani bosing.",
    { reply_markup: keyboard },
  );
});

bot.catch((err) => {
  console.error("Bot error:", err);
});

bot.start({
  onStart: (info) => {
    console.log(`✓ Bot @${info.username} ishga tushdi (long-polling).`);
    console.log(`  Mini App URL: ${miniAppUrl}`);
  },
});
