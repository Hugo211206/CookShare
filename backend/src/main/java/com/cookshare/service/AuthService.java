package com.cookshare.service;

import com.cookshare.dto.AuthResponse;
import com.cookshare.dto.LoginRequest;
import com.cookshare.dto.RegisterRequest;
import com.cookshare.entity.Utilisateur;
import com.cookshare.entity.VerificationToken;
import com.cookshare.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final VerificationTokenService verificationTokenService;


    public AuthResponse register(RegisterRequest request) {

        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }
        if (utilisateurRepository.existsByPseudo(request.getPseudo())) {
            throw new RuntimeException("Ce pseudo est déjà utilisé");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setPseudo(request.getPseudo());
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setIsVerified(true);

        utilisateur = utilisateurRepository.save(utilisateur);

        VerificationToken verificationToken = verificationTokenService.createVerificationToken(utilisateur);

        try {
            emailService.sendEmail(utilisateur.getEmail(), verificationToken.getToken());
        } catch (Exception e) {
            System.err.println("Erreur envoi email : " + e.getMessage());
        }

        String jwtToken = jwtService.generateToken(utilisateur.getEmail(), utilisateur.getId());

        return new AuthResponse(jwtToken, utilisateur);
    }


    public AuthResponse login(LoginRequest request) {

        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email incorrect"));

        if (!passwordEncoder.matches(request.getMotDePasse(), utilisateur.getMotDePasse())) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        if (!utilisateur.getIsVerified()) {
             throw new RuntimeException("Veuillez vérifier votre email avant de vous connecter");
         }

        String jwtToken = jwtService.generateToken(utilisateur.getEmail(), utilisateur.getId());

        return new AuthResponse(jwtToken, utilisateur);
    }

    public void verifyEmail(String token) {

        VerificationToken verificationToken = verificationTokenService.getToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        if (!verificationTokenService.isTokenValid(verificationToken)) {
            throw new RuntimeException("Token expiré");
        }

        Utilisateur utilisateur = verificationToken.getUtilisateur();
        utilisateur.setIsVerified(true);
        utilisateurRepository.save(utilisateur);

        // Supprimer le token
        verificationTokenService.deleteUserTokens(utilisateur.getId());
    }
}