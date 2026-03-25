package com.cookshare.service;

import com.cookshare.entity.Recette;
import com.cookshare.entity.SessionLive;
import com.cookshare.entity.SessionLive.StatutSession;
import com.cookshare.entity.Utilisateur;
import com.cookshare.repository.RecetteRepository;
import com.cookshare.repository.SessionLiveRepository;
import com.cookshare.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SessionLiveService {

    private final SessionLiveRepository sessionLiveRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final RecetteRepository recetteRepository;

    // Toutes les sessions sauf terminées
    public List<SessionLive> getSessions() {
        return sessionLiveRepository.findByStatutNot(StatutSession.TERMINEE);
    }

    public SessionLive createSession(Long hoteId, String titre) {
        Utilisateur hote = utilisateurRepository.findById(hoteId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        SessionLive session = new SessionLive();
        session.setTitre(titre);
        session.setHote(hote);
        session.setRoomId(UUID.randomUUID().toString()); // ID unique pour Jitsi
        return sessionLiveRepository.save(session);
    }

    public SessionLive startSession(Long id) {
        SessionLive session = sessionLiveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session non trouvée"));
        session.setStatut(StatutSession.EN_COURS);
        return sessionLiveRepository.save(session);
    }

    public SessionLive endSession(Long id) {
        SessionLive session = sessionLiveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Session non trouvée"));
        session.setStatut(StatutSession.TERMINEE);
        return sessionLiveRepository.save(session);
    }
}
