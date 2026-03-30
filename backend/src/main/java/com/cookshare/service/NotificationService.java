package com.cookshare.service;

import com.cookshare.entity.Notification;
import com.cookshare.entity.Notification.TypeNotification;
import com.cookshare.entity.Utilisateur;
import com.cookshare.repository.NotificationRepository;
import com.cookshare.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UtilisateurRepository utilisateurRepository;

    public void creer(Long destinataireId, Long declencheurId, TypeNotification type, String message, Long lienId) {
        // Pas de notif si on s'auto-notifie
        if (destinataireId.equals(declencheurId)) return;

        Utilisateur destinataire = utilisateurRepository.findById(destinataireId).orElse(null);
        Utilisateur declencheur = utilisateurRepository.findById(declencheurId).orElse(null);
        if (destinataire == null || declencheur == null) return;

        Notification notif = new Notification();
        notif.setDestinataire(destinataire);
        notif.setDeclencheur(declencheur);
        notif.setType(type);
        notif.setMessage(message);
        notif.setLienId(lienId);
        notificationRepository.save(notif);
    }

    public void notifierLike(Long destinataireId, Long declencheurId, String pseudoDeclencheur, String titreRecette, Long recetteId) {
        creer(destinataireId, declencheurId, TypeNotification.LIKE,
                pseudoDeclencheur + " a aimé ta recette \"" + titreRecette + "\"",
                recetteId);
    }

    public void notifierCommentaire(Long destinataireId, Long declencheurId, String pseudoDeclencheur, String titreRecette, Long recetteId) {
        creer(destinataireId, declencheurId, TypeNotification.COMMENTAIRE,
                pseudoDeclencheur + " a commenté ta recette \"" + titreRecette + "\"",
                recetteId);
    }

    public void notifierFollow(Long destinataireId, Long declencheurId, String pseudoDeclencheur) {
        creer(destinataireId, declencheurId, TypeNotification.FOLLOW,
                pseudoDeclencheur + " a commencé à te suivre",
                declencheurId);
    }

    public List<Notification> getNotifications(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return notificationRepository.findByDestinataireOrderByDateCreationDesc(user);
    }

    public long countNonLues(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return notificationRepository.countByDestinataireAndLuFalse(user);
    }

    public void marquerLue(Long notifId) {
        Notification notif = notificationRepository.findById(notifId)
                .orElseThrow(() -> new RuntimeException("Notification non trouvée"));
        notif.setLu(true);
        notificationRepository.save(notif);
    }

    public void marquerToutesLues(Long userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        List<Notification> notifs = notificationRepository.findByDestinataireOrderByDateCreationDesc(user);
        notifs.forEach(n -> n.setLu(true));
        notificationRepository.saveAll(notifs);
    }

    public void supprimer(Long notifId) {
        notificationRepository.deleteById(notifId);
    }
}