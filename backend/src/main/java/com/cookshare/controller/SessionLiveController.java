package com.cookshare.controller;

import com.cookshare.entity.SessionLive;
import com.cookshare.service.SessionLiveService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class SessionLiveController {

    private final SessionLiveService sessionLiveService;

    @GetMapping
    public ResponseEntity<List<SessionLive>> getSessions() {
        return ResponseEntity.ok(sessionLiveService.getSessions());
    }

    @PostMapping
    public ResponseEntity<SessionLive> createSession(@RequestBody Map<String, Object> body) {
        Long hoteId = Long.valueOf(body.get("hoteId").toString());
        String titre = body.get("titre").toString();
        return ResponseEntity.ok(sessionLiveService.createSession(hoteId, titre));
    }

    @PutMapping("/{id}/start")
    public ResponseEntity<SessionLive> startSession(@PathVariable Long id) {
        return ResponseEntity.ok(sessionLiveService.startSession(id));
    }

    @PutMapping("/{id}/end")
    public ResponseEntity<SessionLive> endSession(@PathVariable Long id) {
        return ResponseEntity.ok(sessionLiveService.endSession(id));
    }
}
