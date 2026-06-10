package com.streamnest.backend.service;

import com.streamnest.backend.dto.SongResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.mpatric.mp3agic.ID3v1;
import com.mpatric.mp3agic.ID3v2;
import com.mpatric.mp3agic.Mp3File;

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

        if (!file.isFile()
                || !file.getName().toLowerCase().endsWith(".mp3")) {
            continue;
        }
        String title = file.getName().replaceFirst("(?i)\\.mp3$", "");
        String artist = "Unknown Artist";
        String album = "Unknown Album";
        String id = String.valueOf(
                file.getAbsolutePath().hashCode()
                );
                
        try {

            Mp3File mp3File = new Mp3File(file);

            

            if (mp3File.hasId3v2Tag()) {

                ID3v2 tag = mp3File.getId3v2Tag();

                if (tag.getTitle() != null && !tag.getTitle().isBlank()) {
                    title = tag.getTitle();
                }

                if (tag.getArtist() != null && !tag.getArtist().isBlank()) {
                    artist = tag.getArtist();
                }

                if (tag.getAlbum() != null && !tag.getAlbum().isBlank()) {
                    album = tag.getAlbum();
                }

            } else if (mp3File.hasId3v1Tag()) {

                ID3v1 tag = mp3File.getId3v1Tag();

                if (tag.getTitle() != null && !tag.getTitle().isBlank()) {
                    title = tag.getTitle();
                }

                if (tag.getArtist() != null && !tag.getArtist().isBlank()) {
                    artist = tag.getArtist();
                }

                if (tag.getAlbum() != null && !tag.getAlbum().isBlank()) {
                    album = tag.getAlbum();
                }
            }


            songs.add(
                    new SongResponse(
                            id,
                            title,
                            artist,
                            album,
                            file.getName(),
                            "/api/artwork/" + id
                    )
            );

        } catch (Exception e) {

            songs.add(
                    new SongResponse(
                            String.valueOf(file.getAbsolutePath().hashCode()),
                            file.getName().replaceFirst("(?i)\\.mp3$", ""),
                            "Unknown Artist",
                            "Unknown Album",
                            file.getName(),
                            null
                    )
            );
        }
    }

        return songs;
    }
}