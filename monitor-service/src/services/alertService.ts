import nodemailer from "npm:nodemailer";

import type { MonitorConfig } from "../config.ts";
import { toErrorMessage } from "../types.ts";

interface SendAlertInput {
  subject: string;
  text: string;
}

interface SendAlertResult {
  ok: boolean;
  errorMessage?: string;
}

export class AlertService {
  private readonly transporter;

  constructor(private readonly config: MonitorConfig["smtp"]) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });
  }

  async sendAlert(input: SendAlertInput): Promise<SendAlertResult> {
    const retryCount = Math.max(0, this.config.retryCount);
    let lastErrorMessage = "Unknown email sending failure";

    for (let attempt = 0; attempt <= retryCount; attempt += 1) {
      try {
        await this.transporter.sendMail({
          from: this.config.from,
          to: this.config.to,
          subject: input.subject,
          text: input.text,
        });
        return { ok: true };
      } catch (error) {
        lastErrorMessage = toErrorMessage(error);
        if (attempt < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1)));
        }
      }
    }

    return {
      ok: false,
      errorMessage: lastErrorMessage,
    };
  }
}
