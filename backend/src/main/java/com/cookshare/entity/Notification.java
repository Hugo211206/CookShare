package com.cookshare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destinataire_id", nullable = false)
    private Utilisateur destinataire;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "declencheur_id", nullable = false)
    private Utilisateur declencheur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeNotification type;

    @Column(length = 255, nullable = false)
    private String message;

    @Column(name = "lien_id")
    private Long lienId;

    @Column(nullable = false)
    private boolean lu = false;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
    }

    public enum TypeNotification {
        LIKE,
        COMMENTAIRE,
        FOLLOW
    }
}