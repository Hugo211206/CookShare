package com.cookshare.repository;

import com.cookshare.entity.SessionLive;
import com.cookshare.entity.SessionLive.StatutSession;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SessionLiveRepository extends JpaRepository<SessionLive, Long> {
    List<SessionLive> findByStatutNot(StatutSession statut);
}
