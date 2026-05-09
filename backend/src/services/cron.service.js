import cron from "node-cron";
import { ingestMarketPrices } from "./market.service.js";
import { generatePredictions } from "./prediction.service.js";
import { generateBusinessInsights, sendDailyInsightEmail } from "./insight.service.js";

let started = false;

export function initCronJobs() {
  if (started) return;
  started = true;

  cron.schedule("0 */6 * * *", async () => {
    try {
      await ingestMarketPrices();
      await generatePredictions();
      await generateBusinessInsights();
      console.log("Cron: market prices, predictions and insights refreshed.");
    } catch (error) {
      console.error("Cron failure:", error.message);
    }
  });

  cron.schedule("30 20 * * *", async () => {
    try {
      const reportRecipient = process.env.EMAIL_USER || "";
      await sendDailyInsightEmail(reportRecipient);
      console.log("Cron: daily insight report processed.");
    } catch (error) {
      console.error("Daily report cron failure:", error.message);
    }
  });
}
