package com.streamnest.backend.dto;

public record SongResponse(
        String title,
        String artist,
        String album,
        String fileName
) {}