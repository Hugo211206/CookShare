package com.cookshare.repository;

import com.cookshare.entity.Abonnement;
import com.cookshare.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {

    List<Abonnement> findByAbonne(Utilisateur abonne);

    List<Abonnement> findByAbonnement(Utilisateur abonnement);

    boolean existsByAbonneAndAbonnement(Utilisateur abonne, Utilisateur abonnement);

    Optional<Abonnement> findByAbonneAndAbonnement(Utilisateur abonne, Utilisateur abonnement);
}