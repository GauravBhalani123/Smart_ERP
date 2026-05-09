import app from "./app.js";
import { env } from "./config/env.js";
import { initCronJobs } from "./services/cron.service.js";
import { verifyEmailTransport } from "./services/email.service.js";

initCronJobs();
app.listen(env.port, async () => {
  console.log(`Backend running on http://localhost:${env.port}`);
  const smtp = await verifyEmailTransport();
  if (!smtp.ok) console.log(`SMTP not ready: ${smtp.reason}`);
});
