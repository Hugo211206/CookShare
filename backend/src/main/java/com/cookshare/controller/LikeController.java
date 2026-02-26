package com.cookshare.controller;

import com.cookshare.entity.Like;
import com.cookshare.service.LikeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class LikeController {

    private final LikeService likeService;

    @PostMapping("/recette/{recetteId}")
    public ResponseEntity<Map<String, Object>> LikerRecette(
            @PathVariable Long recetteId,
            @RequestBody Map<String, Long> body) {
        try {
            Long auteurId = body.get("utilisateurId");
            boolean isLiked = likeService.LikerRecette(recetteId, auteurId);

            return ResponseEntity.ok(Map.of(
                    "liked", isLiked,
                    "message", isLiked ? "Recette likée" : "Like retiré"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/recette/{recetteId}/count")
    public ResponseEntity<Long> countLikes(@PathVariable Long recetteId) {
        Long count = likeService.countLikesByRecette(recetteId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/recette/{recetteId}/utilisateur/{auteurId}")
    public ResponseEntity<Map<String, Boolean>> hasUserLiked(
            @PathVariable Long recetteId,
            @PathVariable Long auteurId) {
        Boolean hasLiked = likeService.hasUserLikedRecette(auteurId, recetteId);
        return ResponseEntity.ok(Map.of("hasLiked", hasLiked));
    }

    @GetMapping("/utilisateur/{auteurId}")
    public List<Like> findByAuteurId(@PathVariable Long auteurId) {
        return likeService.findByAuteurId(auteurId);
    }
}
