package com.cookshare.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "session_live")
public class SessionLive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    // UUID unique utilisé comme nom de salle Jitsi
    private String roomId;

    @Enumerated(EnumType.STRING)
    private StatutSession statut = StatutSession.EN_ATTENTE;

    private LocalDateTime dateCreation = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "hote_id")
    private Utilisateur hote;


    public enum StatutSession {
        EN_ATTENTE, EN_COURS, TERMINEE
    }
}
