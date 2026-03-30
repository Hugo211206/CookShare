package com.cookshare.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${APP_FRONTEND_URL}")
    private String frontendUrl;

    public void sendEmail(String toEmail, String token) {
        String verificationURL = frontendUrl + "/verify?token=" + token;

        String html = """
            <!DOCTYPE html>
            <html lang="fr">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>Vérification CookShare</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                      
                      <!-- Header gradient -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#F25C05,#F29B30);padding:36px 40px;text-align:center;">
                          <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">🍳 CookShare</h1>
                          <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Partagez votre passion culinaire</p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px 40px 32px;">
                          <h2 style="margin:0 0 12px;color:#111827;font-size:22px;font-weight:700;">Bienvenue sur CookShare ! 👋</h2>
                          <p style="margin:0 0 24px;color:#6b7280;font-size:15px;line-height:1.6;">
                            Merci de vous être inscrit. Pour activer votre compte et commencer à partager vos recettes, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous.
                          </p>

                          <!-- CTA Button -->
                          <table width="100%%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center" style="padding:8px 0 32px;">
                                <a href="%s"
                                   style="display:inline-block;background:linear-gradient(135deg,#F25C05,#F29B30);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:50px;letter-spacing:0.3px;">
                                  ✅ Vérifier mon adresse email
                                </a>
                              </td>
                            </tr>
                          </table>

                          <!-- Lien texte de secours -->
                          <p style="margin:0 0 8px;color:#9ca3af;font-size:13px;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
                          <p style="margin:0 0 32px;word-break:break-all;">
                            <a href="%s" style="color:#F25C05;font-size:12px;text-decoration:underline;">%s</a>
                          </p>

                          <!-- Info expiration -->
                          <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;padding:14px 18px;margin-bottom:8px;">
                            <p style="margin:0;color:#92400e;font-size:13px;">
                              ⏰ <strong>Ce lien expirera dans 24 heures.</strong> Si vous n'avez pas créé de compte CookShare, ignorez simplement cet email.
                            </p>
                          </div>
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;text-align:center;">
                          <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                            Cet email a été envoyé automatiquement par CookShare.<br/>
                            © 2026 CookShare — Tous droits réservés.
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(verificationURL, verificationURL, verificationURL);

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(toEmail);
            helper.setSubject("🍳 CookShare — Vérifiez votre adresse email");
            helper.setFrom("noreply@cookshare.com");
            helper.setText(html, true);
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
        }
    }
}