package com.streamnest.backend.controller;

import com.mpatric.mp3agic.ID3v2;
import com.mpatric.mp3agic.Mp3File;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api")
public class ArtworkController {

    @Value("${streamnest.music-path}")
    private String musicPath;

    // id -> raw image bytes (absent key = no artwork)
    private final ConcurrentHashMap<String, byte[]> artworkCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, String> mimeCache    = new ConcurrentHashMap<>();

    /** Scan all MP3s once at startup and cache artwork in memory. */
    @PostConstruct
    public void warmCache() {
        File folder = new File(musicPath);
        File[] files = folder.listFiles();
        if (files == null) return;
        for (File file : files) {
            if (!file.isFile() || !file.getName().toLowerCase().endsWith(".mp3")) continue;
            String id = String.valueOf(file.getAbsolutePath().hashCode());
            try {
                Mp3File mp3 = new Mp3File(file);
                if (!mp3.hasId3v2Tag()) continue;
                ID3v2 tag = mp3.getId3v2Tag();
                byte[] image = tag.getAlbumImage();
                if (image == null) continue;
                artworkCache.put(id, image);
                String mime = tag.getAlbumImageMimeType();
                mimeCache.put(id, (mime != null && !mime.isBlank()) ? mime : "image/jpeg");
            } catch (Exception ignored) {}
        }
    }

    @GetMapping("/artwork/{id}")
    public ResponseEntity<byte[]> artwork(@PathVariable String id) {
        byte[] image = artworkCache.get(id);
        if (image == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(mimeCache.getOrDefault(id, "image/jpeg")))
                .header("Cache-Control", "public, max-age=86400")
                .body(image);
    }
}