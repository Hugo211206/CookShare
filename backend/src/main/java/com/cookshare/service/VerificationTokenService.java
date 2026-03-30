package com.cookshare.service;

import com.cookshare.entity.Utilisateur;
import com.cookshare.entity.VerificationToken;
import com.cookshare.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class VerificationTokenService {

    private final VerificationTokenRepository verificationTokenRepository;

    /**
     * Créer un token de vérification
     */
    public VerificationToken createVerificationToken(Utilisateur utilisateur) {
        String token = UUID.randomUUID().toString();

        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUtilisateur(utilisateur);
        verificationToken.setExpiration(LocalDateTime.now().plusHours(24));

        return verificationTokenRepository.save(verificationToken);
    }

    /**
     * Récupérer un token par sa valeur
     */
    public Optional<VerificationToken> getToken(String token) {
        return verificationTokenRepository.findByToken(token);
    }

    /**
     * Vérifier si un token est valide (existe et non expiré)
     */
    public boolean isTokenValid(VerificationToken token) {
        return token.getExpiration().isAfter(LocalDateTime.now());
    }

    /**
     * Supprimer les tokens d'un utilisateur
     */
    public void deleteUserTokens(Long utilisateurId) {
        verificationTokenRepository.deleteByUtilisateurId(utilisateurId);
    }
}