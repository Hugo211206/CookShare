package com.cookshare.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "abonnements", uniqueConstraints = @UniqueConstraint(columnNames = {"abonne_id", "abonnement_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Abonnement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "abonne_id", nullable = false)
    private Utilisateur abonne;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "abonnement_id", nullable = false)
    private Utilisateur abonnement;

    @Column(name = "date_abonnement", nullable = false)
    private LocalDateTime dateAbonnement = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (dateAbonnement == null) {
            dateAbonnement = LocalDateTime.now();
        }
    }
}