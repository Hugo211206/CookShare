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

    /**
     * Inscription d'un nouvel utilisateur
     */
    public AuthResponse register(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Cet email est déjà utilisé");
        }

        // Vérifier si le pseudo existe déjà
        if (utilisateurRepository.existsByPseudo(request.getPseudo())) {
            throw new RuntimeException("Ce pseudo est déjà utilisé");
        }

        // Créer l'utilisateur
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setPseudo(request.getPseudo());
        utilisateur.setNom(request.getNom());
        utilisateur.setPrenom(request.getPrenom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setIsVerified(false);

        utilisateur = utilisateurRepository.save(utilisateur);

        // Créer le token de vérification
        VerificationToken verificationToken = verificationTokenService.createVerificationToken(utilisateur);

        // Envoyer l'email de vérification
        emailService.sendEmail(utilisateur.getEmail(), verificationToken.getToken());

        // Générer le JWT (l'utilisateur peut se connecter mais certaines actions nécessiteront la vérification)
        String jwtToken = jwtService.generateToken(utilisateur.getEmail(), utilisateur.getId());

        return new AuthResponse(jwtToken, utilisateur);
    }

    /**
     * Connexion d'un utilisateur
     */
    public AuthResponse login(LoginRequest request) {
        // Trouver l'utilisateur
        Utilisateur utilisateur = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        // Vérifier le mot de passe
        if (!passwordEncoder.matches(request.getMotDePasse(), utilisateur.getMotDePasse())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        // Optionnel : Bloquer si email non vérifié
        // if (!utilisateur.getIsVerified()) {
        //     throw new RuntimeException("Veuillez vérifier votre email avant de vous connecter");
        // }

        // Générer le JWT
        String jwtToken = jwtService.generateToken(utilisateur.getEmail(), utilisateur.getId());

        return new AuthResponse(jwtToken, utilisateur);
    }

    /**
     * Vérifier l'email via le token
     */
    public void verifyEmail(String token) {
        // Trouver le token
        VerificationToken verificationToken = verificationTokenService.getToken(token)
                .orElseThrow(() -> new RuntimeException("Token invalide"));

        // Vérifier s'il n'est pas expiré
        if (!verificationTokenService.isTokenValid(verificationToken)) {
            throw new RuntimeException("Token expiré");
        }

        // Marquer l'utilisateur comme vérifié
        Utilisateur utilisateur = verificationToken.getUtilisateur();
        utilisateur.setIsVerified(true);
        utilisateurRepository.save(utilisateur);

        // Supprimer le token
        verificationTokenService.deleteUserTokens(utilisateur.getId());
    }
}