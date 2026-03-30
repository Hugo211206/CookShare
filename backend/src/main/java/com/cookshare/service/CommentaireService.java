package com.cookshare.service;

import com.cookshare.entity.Commentaire;
import com.cookshare.entity.Recette;
import com.cookshare.entity.Utilisateur;
import com.cookshare.repository.CommentaireRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
@RequiredArgsConstructor
@Transactional
public class CommentaireService {

    private final CommentaireRepository commentaireRepository;
    private final RecetteService recetteService;
    private final UtilisateurService utilisateurService;
    private final NotificationService notificationService;

    public Commentaire creerCommentaire(Long recetteId, Long auteurId, String contenu) {
        Recette recette = recetteService.findRecetteByID(recetteId)
                .orElseThrow(() -> new RuntimeException("Recette non trouvée"));

        Utilisateur auteur = utilisateurService.getUtilisateurById(auteurId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        Commentaire commentaire = new Commentaire();
        commentaire.setContenu(contenu);
        commentaire.setRecette(recette);
        commentaire.setAuteur(auteur);

        Commentaire saved = commentaireRepository.save(commentaire);

        notificationService.notifierCommentaire(
                recette.getAuteur().getId(),
                auteur.getId(),
                auteur.getPseudo(),
                recette.getTitre(),
                recetteId
        );

        return saved;

    }

    public void supprimerCommentaire(Long commentaireId, Long utilisateurId) {
        Commentaire commentaire = commentaireRepository.findById(commentaireId)
                .orElseThrow(() -> new RuntimeException("Commentaire non trouvé"));

        boolean estAuteurCommentaire = commentaire.getAuteur().getId().equals(utilisateurId);
        boolean estAuteurRecette = commentaire.getRecette().getAuteur().getId().equals(utilisateurId);

        if (!estAuteurCommentaire && !estAuteurRecette) {
            throw new RuntimeException("Vous n'avez pas le droit de supprimer ce commentaire");
        }

        commentaireRepository.deleteById(commentaireId);
    }

    public List<Commentaire> getCommentairesByRecette(Long recetteId) {
        return commentaireRepository.findByRecetteId(recetteId);
    }

    public Long countCommentairesByRecette(Long recetteId) {
        return commentaireRepository.countByRecetteId(recetteId);
    }

    public Optional<Commentaire> getCommentaireById(Long id) {
        return commentaireRepository.findById(id);
    }
}
