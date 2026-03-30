package com.cookshare.controller;

import com.cookshare.entity.Recette;
import com.cookshare.entity.Utilisateur;
import com.cookshare.service.AbonnementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/abonnements")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class AbonnementController {

    private final AbonnementService abonnementService;

    @PostMapping("/{cibleId}")
    public ResponseEntity<Map<String, String>> follow(
            @PathVariable Long cibleId,
            @RequestBody Map<String, Long> body) {
        try {
            Long abonneId = body.get("abonneId");
            abonnementService.follow(abonneId, cibleId);
            return ResponseEntity.ok(Map.of("message", "Abonnement effectué"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{cibleId}")
    public ResponseEntity<Map<String, String>> unfollow(
            @PathVariable Long cibleId,
            @RequestBody Map<String, Long> body) {
        try {
            Long abonneId = body.get("abonneId");
            abonnementService.unfollow(abonneId, cibleId);
            return ResponseEntity.ok(Map.of("message", "Désabonnement effectué"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{cibleId}/is-following")
    public ResponseEntity<Map<String, Boolean>> isFollowing(
            @PathVariable Long cibleId,
            @RequestParam Long abonneId) {
        boolean result = abonnementService.isFollowing(abonneId, cibleId);
        return ResponseEntity.ok(Map.of("isFollowing", result));
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<Utilisateur>> getFollowers(@PathVariable Long userId) {
        return ResponseEntity.ok(abonnementService.getFollowers(userId));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<Utilisateur>> getFollowing(@PathVariable Long userId) {
        return ResponseEntity.ok(abonnementService.getFollowing(userId));
    }

    @GetMapping("/{userId}/stats")
    public ResponseEntity<Map<String, Long>> getStats(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of(
                "followers", abonnementService.countFollowers(userId),
                "following", abonnementService.countFollowing(userId)
        ));
    }

    @GetMapping("/feed")
    public ResponseEntity<List<Recette>> getFeed(@RequestParam Long userId) {
        return ResponseEntity.ok(abonnementService.getFeed(userId));
    }
}