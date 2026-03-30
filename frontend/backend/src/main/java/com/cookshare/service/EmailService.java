package com.cookshare.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend.url}")
    private String frontendurl;

    public void sendEmail(String toEmail, String token) {
        String subject = "Cookshare - Confirmation Email";
        String verificationURL = frontendurl + "/verify?token=" + token;
        String body = "Bienvenue sur CookShare !\n\n"
                + "Cliquez sur le lien ci-dessous pour vérifier votre adresse email :\n\n"
                + verificationURL + "\n\n"
                + "Ce lien expirera dans 24 heures.\n\n"
                + "Si vous n'avez pas créé de compte, ignorez cet email.\n\n"
                + "L'équipe CookShare";

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        message.setFrom("noreply@cookshare.com");

        mailSender.send(message);
    }
}
