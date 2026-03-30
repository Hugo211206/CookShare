package com.cookshare.repository;

import com.cookshare.entity.Notification;
import com.cookshare.entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByDestinataireOrderByDateCreationDesc(Utilisateur destinataire);

    long countByDestinataireAndLuFalse(Utilisateur destinataire);
}