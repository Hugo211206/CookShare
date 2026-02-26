package com.cookshare.controller;

import com.cookshare.entity.Media;
import com.cookshare.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@CrossOrigin (origins = "http:localhost:3000")
public class MediaController {

    private final MediaService mediaService;

    @PostMapping(value = "/recette/{recetteId}", consumes = "multipart/form-data")
    public ResponseEntity<Media> uploadImageForRecette(
            @PathVariable Long recetteId,
            @RequestPart("file") MultipartFile file) {
        try {
            Media media = mediaService.uploadImageForRecette(recetteId, file);
            return ResponseEntity.status(HttpStatus.CREATED).body(media);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (RuntimeException e)  {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedia(@PathVariable Long id) {
        try {
            mediaService.deleteMedia(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }


}
