package com.cookshare.controller;

import com.cookshare.entity.Favoris;
import com.cookshare.service.FavoriService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favoris")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class FavoriController {

    private final FavoriService favoriService;


    @PostMapping("/recette/{recetteId}")
    public ResponseEntity<Map<String, Object>> toggleFavori(
            @PathVariable Long recetteId,
            @RequestBody Map<String, Long> body) {
        try {
            Long auteurId = body.get("auteurId");
            boolean isAdded = favoriService.toggleFavori(recetteId, auteurId);

            return ResponseEntity.ok(Map.of(
                    "inFavoris", isAdded,
                    "message", isAdded ? "Ajouté aux favoris" : "Retiré des favoris"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }


    @GetMapping("/auteur/{auteurId}")
    public ResponseEntity<List<Favoris>> getFavorisByAuteur(@PathVariable Long auteurId) {
        List<Favoris> favoris = favoriService.getFavorisByAuteur(auteurId);
        return ResponseEntity.ok(favoris);
    }


    @GetMapping("/recette/{recetteId}/auteur/{auteurId}")
    public ResponseEntity<Map<String, Boolean>> isInFavoris(
            @PathVariable Long recetteId,
            @PathVariable Long auteurId) {
        Boolean inFavoris = favoriService.isInFavoris(auteurId, recetteId);
        return ResponseEntity.ok(Map.of("inFavoris", inFavoris));
    }
}