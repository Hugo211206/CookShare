package com.cookshare.config;

import com.cookshare.service.CustomUserDetailsService;
import com.cookshare.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Récupérer le header Authorization
        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Extraire le token
        final String jwt = authHeader.substring(7);

        String userEmail = null;
        try {
            userEmail = jwtService.extractEmail(jwt);
        } catch (Exception e) {
            // Token expiré ou invalide — on laisse passer sans authentifier
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Vérifier si l'utilisateur n'est pas déjà authentifié
        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {


            // 4. Charger l'utilisateur
            UserDetails userDetails = userDetailsService.loadUserByUsername(userEmail);

            // 5. Valider le token
            if (jwtService.validateToken(jwt, userDetails.getUsername())) {

                // 6. Créer l'authentification
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );

                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // 7. Enregistrer dans le contexte de sécurité
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 8. Continuer la chaîne de filtres
        filterChain.doFilter(request, response);
    }
}