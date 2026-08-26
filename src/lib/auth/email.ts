import net from "node:net";
import tls from "node:tls";
import { OTP_EXPIRES_IN_MINUTES } from "./constants";

type SendEmailOtpResult = {
  sent: boolean;
  skipped: boolean;
  error?: string;
};

type SmtpResponse = {
  code: number;
  message: string;
};

const readResponse = (socket: net.Socket): Promise<SmtpResponse> => {
  return new Promise((resolve, reject) => {
    let buffer = "";

    const cleanup = () => {
      socket.off("data", handleData);
      socket.off("error", handleError);
    };
    const handleError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const handleData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines.at(-1);

      if (!lastLine || !/^\d{3} /.test(lastLine)) {
        return;
      }

      cleanup();
      resolve({
        code: Number(lastLine.slice(0, 3)),
        message: buffer,
      });
    };

    socket.on("data", handleData);
    socket.on("error", handleError);
  });
};

const writeCommand = async (socket: net.Socket, command: string) => {
  socket.write(`${command}\r\n`);

  return readResponse(socket);
};

const expectCode = (response: SmtpResponse, codes: number[]) => {
  if (!codes.includes(response.code)) {
    throw new Error(response.message.trim());
  }
};

const encodeBase64 = (value: string) => Buffer.from(value).toString("base64");
const encodeHeader = (value: string) => `=?UTF-8?B?${encodeBase64(value)}?=`;

const createOtpHtml = (code: string) => {
  const digits = code.split("");

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mã xác thực Quỳnh Nhi Store</title>
  </head>
  <body style="margin:0;background:#fff7fa;padding:0;font-family:Inter,Arial,sans-serif;color:#1c1a1b;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fff7fa;margin:0;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #eadde2;border-radius:18px;overflow:hidden;box-shadow:0 22px 70px rgba(122,41,68,0.12);">
            <tr>
              <td style="padding:28px 28px 12px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <div style="font-size:22px;font-weight:800;line-height:1.2;color:#1c1a1b;">Quỳnh Nhi Store</div>
                      <div style="margin-top:6px;font-size:14px;font-weight:600;line-height:1.5;color:#7a7376;">Xác thực tài khoản của bạn</div>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <div style="display:inline-block;border:1px solid #eadde2;border-radius:999px;background:#fff3f6;padding:8px 12px;font-size:12px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;color:#7a2944;">OTP</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px 0 28px;">
                <div style="height:1px;background:#f1e7eb;"></div>
              </td>
            </tr>

            <tr>
              <td style="padding:30px 28px 10px 28px;">
                <h1 style="margin:0;font-size:28px;line-height:1.25;font-weight:800;color:#1c1a1b;">Mã xác thực của bạn</h1>
                <p style="margin:14px 0 0 0;font-size:16px;line-height:1.7;font-weight:600;color:#6f686b;">Nhập mã bên dưới để hoàn tất thao tác đăng nhập hoặc đăng ký tại Quỳnh Nhi Store.</p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:22px 28px 8px 28px;">
                <table role="presentation" cellspacing="0" cellpadding="0">
                  <tr>
                    ${digits
                      .map(
                        (digit) =>
                          `<td style="padding:0 4px;"><div style="width:48px;height:56px;border:1px solid #e5cbd3;border-radius:12px;background:#fffafa;text-align:center;font-size:30px;line-height:56px;font-weight:800;color:#7a2944;box-shadow:0 8px 22px rgba(122,41,68,0.08);">${digit}</div></td>`,
                      )
                      .join("")}
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding:14px 28px 28px 28px;">
                <div style="display:inline-block;border-radius:999px;background:#fff3f6;padding:10px 16px;font-size:14px;font-weight:800;color:#7a2944;">Mã có hiệu lực trong ${OTP_EXPIRES_IN_MINUTES} phút</div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 30px 28px;">
                <div style="border-radius:14px;background:#fffcfa;border:1px solid #f0e4e8;padding:16px 18px;">
                  <p style="margin:0;font-size:14px;line-height:1.65;font-weight:600;color:#6f686b;">Nếu bạn không yêu cầu mã này, hãy bỏ qua email. Không chia sẻ mã OTP cho bất kỳ ai để bảo vệ tài khoản.</p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#7a2944;padding:18px 28px;text-align:center;">
                <p style="margin:0;font-size:13px;line-height:1.6;font-weight:700;color:#ffffff;">Quỳnh Nhi Store</p>
                <p style="margin:4px 0 0 0;font-size:12px;line-height:1.6;color:#f7dee6;">Thời trang nhẹ nhàng mỗi ngày</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

const createMessage = ({
  from,
  to,
  code,
}: {
  from: string;
  to: string;
  code: string;
}) => {
  const subject = "Mã xác thực Quỳnh Nhi Store";
  const fromName = "Quỳnh Nhi Store";
  const boundary = `qns_otp_${Date.now()}`;
  const textBody = [
    "Xin chào,",
    "",
    `Mã xác thực Quỳnh Nhi Store của bạn là: ${code}`,
    `Mã có hiệu lực trong ${OTP_EXPIRES_IN_MINUTES} phút.`,
    "",
    "Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.",
  ].join("\n");
  const htmlBody = createOtpHtml(code);

  return [
    `From: ${encodeHeader(fromName)} <${from}>`,
    `To: ${to}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    textBody,
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    htmlBody,
    "",
    `--${boundary}--`,
    ".",
  ].join("\r\n");
};

export async function sendGmailOtp(
  to: string,
  code: string,
): Promise<SendEmailOtpResult> {
  const user = process.env.GMAIL_SMTP_USER;
  const password = process.env.GMAIL_SMTP_APP_PASSWORD;
  const from = process.env.GMAIL_FROM_EMAIL || user;
  const host = process.env.GMAIL_SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.GMAIL_SMTP_PORT || 465);

  if (!user || !password || !from) {
    return { sent: false, skipped: true };
  }

  const socket = tls.connect({
    host,
    port,
    servername: host,
  });

  try {
    await new Promise<void>((resolve, reject) => {
      socket.once("secureConnect", resolve);
      socket.once("error", reject);
    });

    expectCode(await readResponse(socket), [220]);
    expectCode(await writeCommand(socket, `EHLO ${host}`), [250]);
    expectCode(await writeCommand(socket, "AUTH LOGIN"), [334]);
    expectCode(await writeCommand(socket, encodeBase64(user)), [334]);
    expectCode(await writeCommand(socket, encodeBase64(password)), [235]);
    expectCode(await writeCommand(socket, `MAIL FROM:<${from}>`), [250]);
    expectCode(await writeCommand(socket, `RCPT TO:<${to}>`), [250, 251]);
    expectCode(await writeCommand(socket, "DATA"), [354]);
    expectCode(
      await writeCommand(socket, createMessage({ from, to, code })),
      [250],
    );
    await writeCommand(socket, "QUIT").catch(() => null);

    return { sent: true, skipped: false };
  } catch (error) {
    return {
      sent: false,
      skipped: false,
      error: error instanceof Error ? error.message : "Unable to send email",
    };
  } finally {
    socket.end();
  }
}

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const isValidEmail = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};
