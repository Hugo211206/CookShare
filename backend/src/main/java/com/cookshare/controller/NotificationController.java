package com.cookshare.controller;

import com.cookshare.entity.Notification;
import com.cookshare.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    private final NotificationService notificationService;


    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(@RequestParam Long userId) {
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }


    @GetMapping("/count")
    public ResponseEntity<Map<String, Long>> countNonLues(@RequestParam Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.countNonLues(userId)));
    }


    @PutMapping("/{id}/lu")
    public ResponseEntity<Void> marquerLue(@PathVariable Long id) {
        notificationService.marquerLue(id);
        return ResponseEntity.ok().build();
    }


    @PutMapping("/tout-lire")
    public ResponseEntity<Void> marquerToutesLues(@RequestParam Long userId) {
        notificationService.marquerToutesLues(userId);
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        notificationService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}