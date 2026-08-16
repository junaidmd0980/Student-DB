import crypto from "crypto";


export function generateOtp() {
  return crypto
    .randomInt(100000, 1000000)
    .toString();
}


export function getOtpHtml(otp) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta
    name="color-scheme"
    content="light"
  />
  <title>Verify your email</title>

  <style>
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
      }

      .email-content {
        padding: 28px 20px !important;
      }

      .otp-code {
        font-size: 30px !important;
        letter-spacing: 8px !important;
      }
    }
  </style>
</head>

<body
  style="
    margin: 0;
    padding: 0;
    background-color: #f1f5f9;
    font-family: Arial, Helvetica, sans-serif;
    color: #1e293b;
  "
>
  <table
    role="presentation"
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="
      width: 100%;
      margin: 0;
      padding: 0;
      background-color: #f1f5f9;
    "
  >
    <tr>
      <td
        align="center"
        style="padding: 40px 16px;"
      >
        <table
          role="presentation"
          class="email-container"
          width="600"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            width: 100%;
            max-width: 600px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            background-color: #ffffff;
            box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
          "
        >
          <tr>
            <td
              align="center"
              style="
                padding: 28px 24px;
                background-color: #2563eb;
              "
            >
              <div
                style="
                  width: 52px;
                  height: 52px;
                  margin: 0 auto 14px;
                  border-radius: 50%;
                  background-color: #ffffff;
                  color: #2563eb;
                  font-size: 26px;
                  line-height: 52px;
                  text-align: center;
                "
              >
                ✓
              </div>

              <h1
                style="
                  margin: 0;
                  color: #ffffff;
                  font-size: 24px;
                  line-height: 1.3;
                  font-weight: 700;
                "
              >
                Verify your email
              </h1>
            </td>
          </tr>

          <tr>
            <td
              class="email-content"
              style="
                padding: 36px 42px;
                text-align: center;
              "
            >
              <p
                style="
                  margin: 0 0 12px;
                  color: #475569;
                  font-size: 16px;
                  line-height: 1.6;
                "
              >
                Use the verification code below to
                complete your registration.
              </p>

              <table
                role="presentation"
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin: 28px 0;"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding: 22px 16px;
                      border: 1px solid #bfdbfe;
                      border-radius: 10px;
                      background-color: #eff6ff;
                    "
                  >
                    <div
                      class="otp-code"
                      style="
                        color: #1d4ed8;
                        font-size: 36px;
                        line-height: 1.2;
                        font-weight: 700;
                        letter-spacing: 10px;
                      "
                    >
                      ${otp}
                    </div>
                  </td>
                </tr>
              </table>

              <p
                style="
                  margin: 0 0 10px;
                  color: #64748b;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This code will expire in
                <strong style="color: #334155;">
                  10 minutes
                </strong>.
              </p>

              <p
                style="
                  margin: 0;
                  color: #94a3b8;
                  font-size: 13px;
                  line-height: 1.6;
                "
              >
                If you did not request this code,
                you can safely ignore this email.
              </p>
            </td>
          </tr>

          <tr>
            <td
              align="center"
              style="
                padding: 20px 24px;
                border-top: 1px solid #e2e8f0;
                background-color: #f8fafc;
              "
            >
              <p
                style="
                  margin: 0;
                  color: #94a3b8;
                  font-size: 12px;
                  line-height: 1.5;
                "
              >
                © ${new Date().getFullYear()}
                Student DB. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}