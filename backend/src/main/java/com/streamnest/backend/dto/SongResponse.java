package com.streamnest.backend.dto;

public record SongResponse(
        String id,
        String title,
        String artist,
        String album,
        String fileName
) {}