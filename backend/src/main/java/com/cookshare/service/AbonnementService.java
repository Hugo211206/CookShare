package com.cookshare.service;

import com.cookshare.entity.Abonnement;
import com.cookshare.entity.Utilisateur;
import com.cookshare.entity.Recette;
import com.cookshare.repository.AbonnementRepository;
import com.cookshare.repository.RecetteRepository;
import com.cookshare.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AbonnementService {

    private final AbonnementRepository abonnementRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final RecetteRepository recetteRepository;
    private final NotificationService notificationService;

    public void follow(Long abonneId, Long cibleId) {
        if (abonneId.equals(cibleId)) {
            throw new RuntimeException("Un utilisateur ne peut pas se suivre lui-même");
        }

        Utilisateur abonne = utilisateurRepository.findById(abonneId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Utilisateur cible = utilisateurRepository.findById(cibleId)
                .orElseThrow(() -> new RuntimeException("Utilisateur cible non trouvé"));

        if (abonnementRepository.existsByAbonneAndAbonnement(abonne, cible)) {
            throw new RuntimeException("Vous suivez déjà cet utilisateur");
        }

        Abonnement abonnement = new Abonnement();
        abonnement.setAbonne(abonne);
        abonnement.setAbonnement(cible);
        abonnementRepository.save(abonnement);
        notificationService.notifierFollow(
                cibleId,
                abonneId,
                abonne.getPseudo()
        );
    }

    public void unfollow(Long abonneId, Long cibleId) {
        Utilisateur abonne = utilisateurRepository.findById(abonneId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Utilisateur cible = utilisateurRepository.findById(cibleId)
                .orElseThrow(() -> new RuntimeException("Utilisateur cible non trouvé"));

        Abonnement abonnement = abonnementRepository.findByAbonneAndAbonnement(abonne, cible)
                .orElseThrow(() -> new RuntimeException("Abonnement non trouvé"));

        abonnementRepository.delete(abonnement);
    }

    public boolean isFollowing(Long abonneId, Long cibleId) {
        Utilisateur abonne = utilisateurRepository.findById(abonneId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        Utilisateur cible = utilisateurRepository.findById(cibleId)
                .orElseThrow(() -> new RuntimeException("Utilisateur cible non trouvé"));

        return abonnementRepository.existsByAbonneAndAbonnement(abonne, cible);
    }

    public List<Utilisateur> getFollowers(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return abonnementRepository.findByAbonnement(user)
                .stream()
                .map(Abonnement::getAbonne)
                .collect(Collectors.toList());
    }

    public List<Utilisateur> getFollowing(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return abonnementRepository.findByAbonne(user)
                .stream()
                .map(Abonnement::getAbonnement)
                .collect(Collectors.toList());
    }

    public long countFollowers(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return abonnementRepository.findByAbonnement(user).size();
    }

    public long countFollowing(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return abonnementRepository.findByAbonne(user).size();
    }

    public List<Recette> getFeed(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        List<Utilisateur> following = abonnementRepository.findByAbonne(user)
                .stream()
                .map(Abonnement::getAbonnement)
                .collect(Collectors.toList());

        if (following.isEmpty()) return List.of();

        return following.stream()
                .flatMap(u -> recetteRepository.findByAuteur(u).stream())
                .sorted((a, b) -> b.getDatePublication().compareTo(a.getDatePublication()))
                .collect(Collectors.toList());
    }
}