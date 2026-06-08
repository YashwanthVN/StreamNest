package com.streamnest.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api")
public class StreamController {

    @Value("${streamnest.music-path}")
    private String musicPath;

    @GetMapping("/stream/{fileName}")
    public ResponseEntity<Resource> streamSong(
            @PathVariable String fileName
    ) throws Exception {

        Path path = Paths.get(musicPath, fileName);

        Resource resource = new UrlResource(path.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("audio/mpeg"))
                .body(resource);
    }
}