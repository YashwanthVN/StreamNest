package com.streamnest.backend.service;

import com.streamnest.backend.dto.SongResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

@Service
public class MusicScannerService {

    @Value("${streamnest.music-path}")
    private String musicPath;

    public List<SongResponse> scanSongs() {

        List<SongResponse> songs = new ArrayList<>();

        File folder = new File(musicPath);

        File[] files = folder.listFiles();

        if (files == null) {
            return songs;
        }

        for (File file : files) {

            if (file.isFile()
                    && file.getName().toLowerCase().endsWith(".mp3")) {

                songs.add(
                        new SongResponse(
                                file.getName().replace(".mp3", ""),
                                "Unknown Artist",
                                "Unknown Album",
                                file.getName()
                        )
                );
            }
        }

        return songs;
    }
}