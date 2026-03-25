package com.cookshare.controller;


import com.cookshare.entity.Commentaire;
import com.cookshare.service.CommentaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/commentaires")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class CommentaireController {

    private final CommentaireService commentaireService;

    @PostMapping("/recette/{recetteId}")
    public ResponseEntity<Commentaire> creerCommentaire(
            @PathVariable Long recetteId,
            @RequestBody Map<String, Object> body) {
        try {
            Long auteurId = Long.valueOf(body.get("auteurId").toString());
            String contenu = body.get("contenu").toString();

            Commentaire commentaire = commentaireService.creerCommentaire(recetteId, auteurId, contenu);
            return ResponseEntity.status(HttpStatus.CREATED).body(commentaire);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimerCommentaire(
            @PathVariable Long id,
            @RequestParam Long utilisateurId) {
        try {
            commentaireService.supprimerCommentaire(id, utilisateurId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
    }
    @GetMapping("/recette/{recetteId}")
    public ResponseEntity<List<Commentaire>> getCommentairesByRecette(@PathVariable Long recetteId) {
        List<Commentaire> commentaires = commentaireService.getCommentairesByRecette(recetteId);
        return ResponseEntity.ok(commentaires);
    }

    @GetMapping("/recette/{recetteId}/count")
    public ResponseEntity<Long> countCommentairesByRecette(@PathVariable Long recetteId) {
        Long count = commentaireService.countCommentairesByRecette(recetteId);
        return ResponseEntity.ok(count);
    }
}
