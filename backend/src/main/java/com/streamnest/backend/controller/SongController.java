package com.streamnest.backend.controller;

import com.streamnest.backend.dto.SongResponse;
import com.streamnest.backend.service.MusicScannerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class SongController {

    private final MusicScannerService scannerService;

    public SongController(
            MusicScannerService scannerService
    ) {
        this.scannerService = scannerService;
    }

    @GetMapping("/api/songs")
    public List<SongResponse> songs() {
        return scannerService.scanSongs();
    }
}